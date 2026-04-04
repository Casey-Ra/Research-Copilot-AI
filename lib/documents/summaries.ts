import { prisma } from "@/lib/db/prisma";
import { getOpenAIClient, hasUsableApiKey } from "@/lib/llm/client";
import {
  withDocumentSummaryError,
  withUpdatedDocumentSummary,
} from "@/lib/documents/metadata";
import type { DocumentSummaryEntry, DocumentSummaryType } from "@/types/database";

const SUMMARY_CONFIG = {
  concise: {
    title: "Concise summary",
    noteTitle: "Concise Summary",
    emptyFallback: "No concise summary could be generated from the available document text.",
    prompt:
      "Write a concise executive summary in 2 short paragraphs. Stay strictly grounded in the supplied document text and avoid unsupported claims.",
  },
  bullets: {
    title: "Bullet summary",
    noteTitle: "Bullet Summary",
    emptyFallback: "No bullet summary could be generated from the available document text.",
    prompt:
      "Write a bullet summary with 4 to 6 bullets. Each bullet should capture a grounded, high-value point from the document text only.",
  },
  takeaways: {
    title: "Key takeaways",
    noteTitle: "Key Takeaways",
    emptyFallback: "No key takeaways could be generated from the available document text.",
    prompt:
      "List 3 to 5 key takeaways from the document. Keep each takeaway grounded and concrete. Use bullets.",
  },
  actionItems: {
    title: "Action items",
    noteTitle: "Action Items",
    emptyFallback:
      "No explicit action items were found in the document. The available text reads as informational rather than directive.",
    prompt:
      "Extract action items only if the document explicitly supports them. If none are clearly supported, say that no explicit action items were identified. Use bullets when action items exist.",
  },
} satisfies Record<
  DocumentSummaryType,
  {
    title: string;
    noteTitle: string;
    emptyFallback: string;
    prompt: string;
  }
>;

const MAX_SOURCE_CHARACTERS = 12000;

type SummarySource = {
  text: string;
  evidenceMode: "full-document" | "chunk-sample";
  chunkCount: number;
  totalChunks: number;
};

type SummaryDocumentRecord = {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  extractedText: string | null;
  metadata: unknown;
  chunks: Array<{
    text: string;
    chunkIndex: number;
  }>;
};

function normalizeWhitespace(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function splitSentences(text: string) {
  return normalizeWhitespace(text)
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
}

function pickRepresentativeChunks(chunks: SummaryDocumentRecord["chunks"], limit: number) {
  if (chunks.length <= limit) {
    return chunks;
  }

  const indexes = new Set<number>();

  for (let i = 0; i < limit; i += 1) {
    const position = Math.round((i / (limit - 1 || 1)) * (chunks.length - 1));
    indexes.add(position);
  }

  return Array.from(indexes)
    .sort((left, right) => left - right)
    .map((index) => chunks[index]);
}

function buildSummarySource(document: SummaryDocumentRecord): SummarySource {
  const extractedText = normalizeWhitespace(document.extractedText ?? "");

  if (extractedText && extractedText.length <= MAX_SOURCE_CHARACTERS) {
    return {
      text: extractedText,
      evidenceMode: "full-document",
      chunkCount: document.chunks.length,
      totalChunks: document.chunks.length,
    };
  }

  const sampledChunks = pickRepresentativeChunks(document.chunks, 8);
  const chunkText = sampledChunks
    .map((chunk) => `Chunk ${chunk.chunkIndex + 1}\n${normalizeWhitespace(chunk.text)}`)
    .join("\n\n");
  const sampledText = normalizeWhitespace(chunkText).slice(0, MAX_SOURCE_CHARACTERS);

  return {
    text: sampledText || extractedText.slice(0, MAX_SOURCE_CHARACTERS),
    evidenceMode: extractedText ? "chunk-sample" : "full-document",
    chunkCount: sampledChunks.length || document.chunks.length,
    totalChunks: document.chunks.length,
  };
}

function truncateSentence(sentence: string, maxLength = 220) {
  if (sentence.length <= maxLength) {
    return sentence;
  }

  return `${sentence.slice(0, maxLength - 3).trimEnd()}...`;
}

function uniqueSentences(sentences: string[], limit: number) {
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const sentence of sentences) {
    const normalized = sentence.toLowerCase();

    if (seen.has(normalized)) {
      continue;
    }

    seen.add(normalized);
    unique.push(sentence);

    if (unique.length >= limit) {
      break;
    }
  }

  return unique;
}

function buildFallbackActionItems(sentences: string[]) {
  const actionSentences = uniqueSentences(
    sentences.filter((sentence) =>
      /\b(should|must|need to|next step|action|follow up|recommended|plan to|required)\b/i.test(
        sentence,
      ),
    ),
    4,
  );

  if (actionSentences.length === 0) {
    return SUMMARY_CONFIG.actionItems.emptyFallback;
  }

  return actionSentences.map((sentence) => `- ${truncateSentence(sentence)}`).join("\n");
}

function buildFallbackSummary(document: SummaryDocumentRecord, summaryType: DocumentSummaryType) {
  const source = buildSummarySource(document);
  const sentences = splitSentences(source.text);
  const openingSentences = uniqueSentences(sentences, 6);
  const middleIndex = Math.floor(sentences.length / 2);
  const middleSentences = uniqueSentences(
    [sentences[middleIndex], sentences[middleIndex + 1], sentences.at(-1)].filter(
      (sentence): sentence is string => Boolean(sentence),
    ),
    3,
  );

  let content = SUMMARY_CONFIG[summaryType].emptyFallback;

  if (summaryType === "concise") {
    const concise = uniqueSentences(
      [...openingSentences.slice(0, 2), ...middleSentences.slice(0, 1)],
      3,
    );
    content = concise.length
      ? concise.map((sentence) => truncateSentence(sentence)).join("\n\n")
      : SUMMARY_CONFIG.concise.emptyFallback;
  }

  if (summaryType === "bullets") {
    const bullets = uniqueSentences([...openingSentences, ...middleSentences], 5);
    content = bullets.length
      ? bullets.map((sentence) => `- ${truncateSentence(sentence)}`).join("\n")
      : SUMMARY_CONFIG.bullets.emptyFallback;
  }

  if (summaryType === "takeaways") {
    const takeaways = uniqueSentences([...openingSentences, ...middleSentences], 4);
    content = takeaways.length
      ? takeaways.map((sentence) => `- ${truncateSentence(sentence)}`).join("\n")
      : SUMMARY_CONFIG.takeaways.emptyFallback;
  }

  if (summaryType === "actionItems") {
    content = buildFallbackActionItems(sentences);
  }

  return {
    type: summaryType,
    title: SUMMARY_CONFIG[summaryType].title,
    content,
    generatedAt: new Date().toISOString(),
    provider: "local-fallback",
    model: "deterministic-summary-fallback",
    evidenceMode: source.evidenceMode,
    chunkCount: source.chunkCount,
    totalChunks: source.totalChunks,
  } satisfies DocumentSummaryEntry;
}

async function buildModelSummary(
  document: SummaryDocumentRecord,
  summaryType: DocumentSummaryType,
): Promise<DocumentSummaryEntry> {
  const source = buildSummarySource(document);
  const client = getOpenAIClient();

  const completion = await client.chat.completions.create({
    model: process.env.CHAT_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are Research Copilot AI. Summarize only from the supplied document evidence. Do not add outside facts, and explicitly avoid unsupported claims or speculation.",
      },
      {
        role: "user",
        content: `Document title: ${document.title}\nFile name: ${document.fileName}\n\nTask: ${SUMMARY_CONFIG[summaryType].prompt}\n\nUse only this evidence:\n${source.text}`,
      },
    ],
  });

  return {
    type: summaryType,
    title: SUMMARY_CONFIG[summaryType].title,
    content:
      completion.choices[0]?.message?.content?.trim() || SUMMARY_CONFIG[summaryType].emptyFallback,
    generatedAt: new Date().toISOString(),
    provider: "openai",
    model: completion.model,
    evidenceMode: source.evidenceMode,
    chunkCount: source.chunkCount,
    totalChunks: source.totalChunks,
  };
}

export function getSummaryConfig(summaryType: DocumentSummaryType) {
  return SUMMARY_CONFIG[summaryType];
}

export function getAllSummaryTypes() {
  return Object.keys(SUMMARY_CONFIG) as DocumentSummaryType[];
}

export async function generateDocumentSummaryForUser(input: {
  documentId: string;
  userId: string;
  summaryType: DocumentSummaryType;
}) {
  const document = await prisma.document.findFirst({
    where: {
      id: input.documentId,
      userId: input.userId,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      fileName: true,
      extractedText: true,
      metadata: true,
      chunks: {
        select: {
          text: true,
          chunkIndex: true,
        },
        orderBy: {
          chunkIndex: "asc",
        },
      },
    },
  });

  if (!document) {
    throw new Error("Document not found for this user.");
  }

  const hasUsableSource = Boolean(document.extractedText?.trim()) || document.chunks.length > 0;

  if (!hasUsableSource) {
    const message =
      "This document has no extracted text yet. Process the document before generating a summary.";

    await prisma.document.update({
      where: { id: document.id },
      data: {
        metadata: withDocumentSummaryError(document.metadata, input.summaryType, message),
      },
    });

    throw new Error(message);
  }

  try {
    const summary = hasUsableApiKey()
      ? await buildModelSummary(document, input.summaryType)
      : buildFallbackSummary(document, input.summaryType);

    await prisma.document.update({
      where: { id: document.id },
      data: {
        metadata: withUpdatedDocumentSummary(document.metadata, input.summaryType, summary),
      },
    });

    return summary;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown summary generation error.";

    await prisma.document.update({
      where: { id: document.id },
      data: {
        metadata: withDocumentSummaryError(document.metadata, input.summaryType, message),
      },
    });

    throw error;
  }
}
