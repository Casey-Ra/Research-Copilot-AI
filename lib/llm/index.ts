import { prisma } from "@/lib/db/prisma";
import { getOpenAIClient, hasUsableApiKey } from "@/lib/llm/client";
import { semanticSearchDocuments } from "@/lib/retrieval";
import type { JsonCitation } from "@/types/database";

type PersistedChatMessage = {
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
};

export type ChatCompletionRequest = {
  question: string;
  selectedDocumentIds?: string[];
  userId: string;
  chatSessionId: string;
};

export type GroundedAnswerResult = {
  answer: string;
  citations: JsonCitation[];
};

function mapRole(role: PersistedChatMessage["role"]) {
  if (role === "ASSISTANT") {
    return "assistant" as const;
  }

  return "user" as const;
}

function buildCitationPayload(results: Awaited<ReturnType<typeof semanticSearchDocuments>>["results"]) {
  return results.slice(0, 4).map((result) => ({
    chunkId: result.chunkId,
    documentId: result.documentId,
    documentTitle: result.documentTitle,
    fileName: result.fileName,
    chunkIndex: result.chunkIndex,
    pageNumber: result.pageNumber ?? undefined,
    startOffset: result.startOffset,
    endOffset: result.endOffset,
    score: result.score,
    quote: result.text.length > 240 ? `${result.text.slice(0, 237)}...` : result.text,
  })) satisfies JsonCitation[];
}

function buildContextBlock(citations: JsonCitation[]) {
  return citations
    .map((citation, index) => {
      const location =
        citation.pageNumber !== undefined
          ? `page ${citation.pageNumber}`
          : citation.startOffset !== undefined && citation.endOffset !== undefined
            ? `offsets ${citation.startOffset}-${citation.endOffset}`
            : "location unavailable";

      return `[${index + 1}] ${citation.documentTitle} (${citation.fileName}, ${location})\n${citation.quote ?? ""}`;
    })
    .join("\n\n");
}

function buildFallbackAnswer(question: string, citations: JsonCitation[]) {
  if (citations.length === 0) {
    return `I don't have enough evidence in the selected documents to answer "${question}" confidently. Upload and process more documents, or broaden the document filter.`;
  }

  const evidenceLines = citations
    .slice(0, 3)
    .map(
      (citation, index) =>
        `Source [${index + 1}] from ${citation.documentTitle}: ${citation.quote ?? "Relevant supporting text found."}`,
    )
    .join("\n\n");

  return `Based on the retrieved evidence, here is the most grounded answer I can provide:\n\n${evidenceLines}\n\nIf you need a more synthesized answer, connect an OpenAI-compatible chat model and I can turn the same citations into a fuller response.`;
}

async function createModelGroundedAnswer(input: {
  question: string;
  citations: JsonCitation[];
  history: PersistedChatMessage[];
}) {
  const client = getOpenAIClient();

  const historyBlock = input.history
    .slice(-6)
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");

  const completion = await client.chat.completions.create({
    model: process.env.CHAT_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are Research Copilot AI. Answer only from the provided retrieved context. Use bracket citations like [1] or [2] for every factual claim. If the evidence is weak or missing, say so plainly and do not hallucinate.",
      },
      ...input.history.slice(-6).map((message) => ({
        role: mapRole(message.role),
        content: message.content,
      })),
      {
        role: "user",
        content: `Question:\n${input.question}\n\nRecent conversation:\n${historyBlock || "No prior messages."}\n\nRetrieved context:\n${buildContextBlock(
          input.citations,
        )}\n\nWrite a concise grounded answer with numbered citations.`,
      },
    ],
  });

  return completion.choices[0]?.message?.content?.trim() || buildFallbackAnswer(input.question, input.citations);
}

export async function answerGroundedQuestion(
  request: ChatCompletionRequest,
): Promise<GroundedAnswerResult> {
  const [history, retrievalResponse] = await Promise.all([
    prisma.chatMessage.findMany({
      where: {
        chatSessionId: request.chatSessionId,
        chatSession: {
          userId: request.userId,
        },
      },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        content: true,
      },
    }),
    semanticSearchDocuments({
      userId: request.userId,
      query: request.question,
      documentIds: request.selectedDocumentIds,
      limit: 6,
    }),
  ]);

  const citations = buildCitationPayload(retrievalResponse.results);

  if (citations.length === 0) {
    return {
      answer: buildFallbackAnswer(request.question, citations),
      citations,
    };
  }

  const answer = hasUsableApiKey()
    ? await createModelGroundedAnswer({
        question: request.question,
        citations,
        history,
      })
    : buildFallbackAnswer(request.question, citations);

  return {
    answer,
    citations,
  };
}
