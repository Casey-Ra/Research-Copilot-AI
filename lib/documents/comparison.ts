import OpenAI from "openai";
import { prisma } from "@/lib/db/prisma";
import { semanticSearchDocuments } from "@/lib/retrieval";
import { cosineSimilarity, isNumericVector } from "@/lib/retrieval/vector";
import { getDocumentSummaryFromMetadata } from "@/lib/documents/metadata";
import type { DocumentSummaryType } from "@/types/database";

const MAX_CANDIDATE_CHUNKS = 10;
const MAX_SHARED_PAIRS = 4;
const MAX_UNIQUE_POINTS = 3;

type CompareChunk = {
  id: string;
  chunkIndex: number;
  text: string;
  pageNumber: number | null;
  startOffset: number | null;
  endOffset: number | null;
  embedding: number[] | null;
};

type CompareDocument = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  updatedAt: Date;
  extractedText: string | null;
  metadata: unknown;
  chunks: CompareChunk[];
};

type SharedPair = {
  score: number;
  left: CompareChunk;
  right: CompareChunk;
};

type SharedEvidenceItem = {
  score: number;
  left: {
    id: string;
    chunkIndex: number;
    text: string;
    pageNumber: number | null;
    startOffset: number | null;
    endOffset: number | null;
  };
  right: {
    id: string;
    chunkIndex: number;
    text: string;
    pageNumber: number | null;
    startOffset: number | null;
    endOffset: number | null;
  };
};

type ComparisonHighlight = {
  chunkId: string;
  chunkIndex: number;
  text: string;
  pageNumber: number | null;
  startOffset: number | null;
  endOffset: number | null;
  uniquenessScore: number;
};

type PossibleContradiction = {
  score: number;
  reason: string;
  left: SharedEvidenceItem["left"];
  right: SharedEvidenceItem["right"];
};

export type DocumentComparisonResult = {
  leftDocument: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    updatedAt: Date;
    summary: string | null;
  };
  rightDocument: {
    id: string;
    title: string;
    fileName: string;
    fileType: string;
    updatedAt: Date;
    summary: string | null;
  };
  similarityScore: number;
  similarityLabel: "low" | "moderate" | "high";
  focusQuery: string | null;
  comparisonNarrative: string;
  sharedEvidence: SharedEvidenceItem[];
  possibleContradictions: PossibleContradiction[];
  uniqueToLeft: ComparisonHighlight[];
  uniqueToRight: ComparisonHighlight[];
  comparedChunkCount: {
    left: number;
    right: number;
  };
};

function hasUsableApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey !== "replace-me");
}

function toSharedEvidenceItem(pair: SharedPair): SharedEvidenceItem {
  return {
    score: pair.score,
    left: {
      id: pair.left.id,
      chunkIndex: pair.left.chunkIndex,
      text: truncateText(pair.left.text),
      pageNumber: pair.left.pageNumber,
      startOffset: pair.left.startOffset,
      endOffset: pair.left.endOffset,
    },
    right: {
      id: pair.right.id,
      chunkIndex: pair.right.chunkIndex,
      text: truncateText(pair.right.text),
      pageNumber: pair.right.pageNumber,
      startOffset: pair.right.startOffset,
      endOffset: pair.right.endOffset,
    },
  };
}

function truncateText(text: string, limit = 240) {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, limit - 3).trimEnd()}...`;
}

function getSimilarityLabel(score: number): "low" | "moderate" | "high" {
  if (score >= 0.82) {
    return "high";
  }

  if (score >= 0.62) {
    return "moderate";
  }

  return "low";
}

function significantTerms(text: string) {
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .match(/[a-z0-9]+/g)
        ?.filter((term) => term.length > 4) ?? [],
    ),
  );
}

function hasNegationSignal(text: string) {
  return /\b(no|not|never|without|lack|avoid|against|cannot|can't|won't|fails?)\b/i.test(text);
}

function buildPossibleContradictions(sharedEvidence: SharedEvidenceItem[]) {
  return sharedEvidence
    .map((pair) => {
      const leftTerms = significantTerms(pair.left.text);
      const rightTerms = significantTerms(pair.right.text);
      const overlappingTerms = leftTerms.filter((term) => rightTerms.includes(term));
      const negationMismatch = hasNegationSignal(pair.left.text) !== hasNegationSignal(pair.right.text);

      if (!negationMismatch || overlappingTerms.length < 2) {
        return null;
      }

      return {
        score: pair.score,
        reason: `Both excerpts discuss ${overlappingTerms.slice(0, 3).join(", ")}, but one uses negation language while the other does not.`,
        left: pair.left,
        right: pair.right,
      } satisfies PossibleContradiction;
    })
    .filter((item): item is PossibleContradiction => Boolean(item))
    .slice(0, 2);
}

function averageVectors(vectors: number[][]) {
  if (vectors.length === 0) {
    return [];
  }

  const dimensions = vectors[0]?.length ?? 0;
  const sum = Array.from({ length: dimensions }, () => 0);

  for (const vector of vectors) {
    if (vector.length !== dimensions) {
      continue;
    }

    for (let index = 0; index < dimensions; index += 1) {
      sum[index] += vector[index];
    }
  }

  return sum.map((value) => value / vectors.length);
}

function sampleChunks(chunks: CompareChunk[], limit: number) {
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

function pickSummary(metadata: unknown) {
  const priority: DocumentSummaryType[] = ["concise", "takeaways", "bullets"];

  for (const summaryType of priority) {
    const summary = getDocumentSummaryFromMetadata(metadata, summaryType);

    if (summary?.content) {
      return summary.content;
    }
  }

  return null;
}

async function getCompareDocumentsForUser(input: {
  userId: string;
  leftDocumentId: string;
  rightDocumentId: string;
}) {
  const documents = await prisma.document.findMany({
    where: {
      userId: input.userId,
      status: "READY",
      id: {
        in: [input.leftDocumentId, input.rightDocumentId],
      },
    },
    select: {
      id: true,
      title: true,
      fileName: true,
      fileType: true,
      updatedAt: true,
      extractedText: true,
      metadata: true,
      chunks: {
        orderBy: {
          chunkIndex: "asc",
        },
        select: {
          id: true,
          chunkIndex: true,
          text: true,
          pageNumber: true,
          startOffset: true,
          endOffset: true,
          embedding: true,
        },
      },
    },
  });

  const normalized = documents.map((document) => ({
    ...document,
    chunks: document.chunks.map((chunk) => ({
      ...chunk,
      embedding: isNumericVector(chunk.embedding) ? chunk.embedding : null,
    })),
  })) satisfies CompareDocument[];

  const left = normalized.find((document) => document.id === input.leftDocumentId);
  const right = normalized.find((document) => document.id === input.rightDocumentId);

  if (!left || !right) {
    throw new Error("Both selected documents must exist and be READY before comparison.");
  }

  return { left, right };
}

async function getFocusedCandidateChunks(input: {
  userId: string;
  document: CompareDocument;
  focusQuery?: string;
}) {
  const query = input.focusQuery?.trim();

  if (!query) {
    return sampleChunks(
      input.document.chunks.filter((chunk) => chunk.embedding),
      MAX_CANDIDATE_CHUNKS,
    );
  }

  const focused = await semanticSearchDocuments({
    userId: input.userId,
    query,
    documentIds: [input.document.id],
    limit: MAX_CANDIDATE_CHUNKS,
  });

  const focusedChunkIds = new Set(focused.results.map((result) => result.chunkId));
  const matchedChunks = input.document.chunks.filter((chunk) => focusedChunkIds.has(chunk.id));

  if (matchedChunks.length > 0) {
    return matchedChunks;
  }

  return sampleChunks(
    input.document.chunks.filter((chunk) => chunk.embedding),
    MAX_CANDIDATE_CHUNKS,
  );
}

function buildSharedEvidence(leftChunks: CompareChunk[], rightChunks: CompareChunk[]) {
  const usedRightChunkIds = new Set<string>();
  const pairs: SharedPair[] = [];

  for (const leftChunk of leftChunks) {
    if (!leftChunk.embedding) {
      continue;
    }

    let bestMatch: SharedPair | null = null;

    for (const rightChunk of rightChunks) {
      if (!rightChunk.embedding || usedRightChunkIds.has(rightChunk.id)) {
        continue;
      }

      const score = cosineSimilarity(leftChunk.embedding, rightChunk.embedding);

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          score,
          left: leftChunk,
          right: rightChunk,
        };
      }
    }

    if (bestMatch) {
      usedRightChunkIds.add(bestMatch.right.id);
      pairs.push(bestMatch);
    }
  }

  return pairs
    .filter((pair) => pair.score >= 0.45)
    .sort((left, right) => right.score - left.score)
    .slice(0, MAX_SHARED_PAIRS);
}

function buildUniqueEvidence(sourceChunks: CompareChunk[], comparisonChunks: CompareChunk[]) {
  return sourceChunks
    .filter((chunk) => chunk.embedding)
    .map((chunk) => {
      const maxSimilarity = comparisonChunks
        .filter((comparisonChunk) => comparisonChunk.embedding)
        .reduce((best, comparisonChunk) => {
          const score = cosineSimilarity(chunk.embedding!, comparisonChunk.embedding!);
          return Math.max(best, score);
        }, 0);

      return {
        chunkId: chunk.id,
        chunkIndex: chunk.chunkIndex,
        text: truncateText(chunk.text),
        pageNumber: chunk.pageNumber,
        startOffset: chunk.startOffset,
        endOffset: chunk.endOffset,
        uniquenessScore: Number((1 - maxSimilarity).toFixed(3)),
      } satisfies ComparisonHighlight;
    })
    .sort((left, right) => right.uniquenessScore - left.uniquenessScore)
    .slice(0, MAX_UNIQUE_POINTS);
}

function buildFallbackComparisonNarrative(input: {
  left: CompareDocument;
  right: CompareDocument;
  similarityLabel: "low" | "moderate" | "high";
  focusQuery: string | null;
  sharedEvidence: SharedPair[];
  uniqueToLeft: ComparisonHighlight[];
  uniqueToRight: ComparisonHighlight[];
}) {
  const focusLine = input.focusQuery
    ? `This comparison is scoped to the focus query "${input.focusQuery}".`
    : "This comparison considers the overall processed document content.";
  const sharedLine =
    input.sharedEvidence.length > 0
      ? `The strongest overlap appears around ${truncateText(input.sharedEvidence[0].left.text, 120)}`
      : "The two documents do not show strong chunk-level overlap in the available evidence.";
  const leftLine =
    input.uniqueToLeft.length > 0
      ? `${input.left.title} contributes distinct material such as ${input.uniqueToLeft[0].text}`
      : `${input.left.title} does not surface clearly unique evidence in the sampled comparison set.`;
  const rightLine =
    input.uniqueToRight.length > 0
      ? `${input.right.title} contributes distinct material such as ${input.uniqueToRight[0].text}`
      : `${input.right.title} does not surface clearly unique evidence in the sampled comparison set.`;

  return `${focusLine} The overall relationship between the documents is ${input.similarityLabel} overlap. ${sharedLine} ${leftLine} ${rightLine}`;
}

async function buildModelComparisonNarrative(input: {
  left: CompareDocument;
  right: CompareDocument;
  focusQuery: string | null;
  sharedEvidence: SharedPair[];
  uniqueToLeft: ComparisonHighlight[];
  uniqueToRight: ComparisonHighlight[];
}) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const sharedBlock =
    input.sharedEvidence.length > 0
      ? input.sharedEvidence
          .map(
            (pair, index) =>
              `Shared pair ${index + 1} (${pair.score.toFixed(3)}):\nA: ${truncateText(pair.left.text, 180)}\nB: ${truncateText(pair.right.text, 180)}`,
          )
          .join("\n\n")
      : "No strong shared evidence was identified.";

  const uniqueLeftBlock =
    input.uniqueToLeft.length > 0
      ? input.uniqueToLeft.map((item, index) => `A${index + 1}: ${item.text}`).join("\n")
      : "No clearly unique A-side evidence identified.";

  const uniqueRightBlock =
    input.uniqueToRight.length > 0
      ? input.uniqueToRight.map((item, index) => `B${index + 1}: ${item.text}`).join("\n")
      : "No clearly unique B-side evidence identified.";

  const completion = await client.chat.completions.create({
    model: process.env.CHAT_MODEL ?? "gpt-4.1-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content:
          "You are Research Copilot AI. Compare the two documents using only the provided evidence. Write a concise, grounded comparison and avoid unsupported claims.",
      },
      {
        role: "user",
        content: `Document A: ${input.left.title}\nDocument B: ${input.right.title}\nFocus query: ${input.focusQuery ?? "Overall comparison"}\n\nShared evidence:\n${sharedBlock}\n\nUnique to document A:\n${uniqueLeftBlock}\n\nUnique to document B:\n${uniqueRightBlock}\n\nWrite a concise comparison in 2 short paragraphs.`,
      },
    ],
  });

  return (
    completion.choices[0]?.message?.content?.trim() ||
    buildFallbackComparisonNarrative({
      left: input.left,
      right: input.right,
      similarityLabel: "moderate",
      focusQuery: input.focusQuery,
      sharedEvidence: input.sharedEvidence,
      uniqueToLeft: input.uniqueToLeft,
      uniqueToRight: input.uniqueToRight,
    })
  );
}

export async function compareDocumentsForUser(input: {
  userId: string;
  leftDocumentId: string;
  rightDocumentId: string;
  focusQuery?: string;
}): Promise<DocumentComparisonResult> {
  if (input.leftDocumentId === input.rightDocumentId) {
    throw new Error("Choose two different documents to compare.");
  }

  const { left, right } = await getCompareDocumentsForUser(input);
  const focusQuery = input.focusQuery?.trim() || null;
  const [leftChunks, rightChunks] = await Promise.all([
    getFocusedCandidateChunks({
      userId: input.userId,
      document: left,
      focusQuery: focusQuery ?? undefined,
    }),
    getFocusedCandidateChunks({
      userId: input.userId,
      document: right,
      focusQuery: focusQuery ?? undefined,
    }),
  ]);

  const leftVectors = leftChunks.flatMap((chunk) => (chunk.embedding ? [chunk.embedding] : []));
  const rightVectors = rightChunks.flatMap((chunk) => (chunk.embedding ? [chunk.embedding] : []));
  const similarityScore = Number(
    cosineSimilarity(averageVectors(leftVectors), averageVectors(rightVectors)).toFixed(3),
  );
  const similarityLabel = getSimilarityLabel(similarityScore);
  const sharedEvidence = buildSharedEvidence(leftChunks, rightChunks);
  const uniqueToLeft = buildUniqueEvidence(leftChunks, rightChunks);
  const uniqueToRight = buildUniqueEvidence(rightChunks, leftChunks);
  const comparisonNarrative = hasUsableApiKey()
    ? await buildModelComparisonNarrative({
        left,
        right,
        focusQuery,
        sharedEvidence,
        uniqueToLeft,
        uniqueToRight,
      })
    : buildFallbackComparisonNarrative({
        left,
        right,
        similarityLabel,
        focusQuery,
        sharedEvidence,
        uniqueToLeft,
        uniqueToRight,
      });
  const normalizedSharedEvidence = sharedEvidence.map(toSharedEvidenceItem);
  const possibleContradictions = buildPossibleContradictions(normalizedSharedEvidence);

  return {
    leftDocument: {
      id: left.id,
      title: left.title,
      fileName: left.fileName,
      fileType: left.fileType,
      updatedAt: left.updatedAt,
      summary: pickSummary(left.metadata) ?? (left.extractedText ? truncateText(left.extractedText, 220) : null),
    },
    rightDocument: {
      id: right.id,
      title: right.title,
      fileName: right.fileName,
      fileType: right.fileType,
      updatedAt: right.updatedAt,
      summary:
        pickSummary(right.metadata) ?? (right.extractedText ? truncateText(right.extractedText, 220) : null),
    },
    similarityScore,
    similarityLabel,
    focusQuery,
    comparisonNarrative,
    sharedEvidence: normalizedSharedEvidence,
    possibleContradictions,
    uniqueToLeft,
    uniqueToRight,
    comparedChunkCount: {
      left: leftChunks.length,
      right: rightChunks.length,
    },
  };
}
