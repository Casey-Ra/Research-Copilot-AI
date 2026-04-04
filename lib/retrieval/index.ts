import "server-only";

import { prisma } from "@/lib/db/prisma";
import { generateQueryEmbedding } from "@/lib/embeddings";

export type RetrievalResult = {
  chunkId: string;
  score: number;
  documentId: string;
  documentTitle: string;
  fileName: string;
  text: string;
  pageNumber: number | null;
  startOffset: number | null;
  endOffset: number | null;
};

function cosineSimilarity(a: number[], b: number[]) {
  if (a.length === 0 || b.length === 0 || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let aMagnitude = 0;
  let bMagnitude = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    aMagnitude += a[index] * a[index];
    bMagnitude += b[index] * b[index];
  }

  if (!aMagnitude || !bMagnitude) {
    return 0;
  }

  return dot / (Math.sqrt(aMagnitude) * Math.sqrt(bMagnitude));
}

function isNumericVector(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => typeof item === "number");
}

export async function semanticSearchDocuments(input: {
  userId: string;
  query: string;
  documentIds?: string[];
  limit?: number;
}) {
  const query = input.query.trim();

  if (!query) {
    return [] as RetrievalResult[];
  }

  const queryEmbedding = await generateQueryEmbedding(query);
  const candidateChunks = await prisma.documentChunk.findMany({
    where: {
      document: {
        userId: input.userId,
        status: "READY",
        ...(input.documentIds && input.documentIds.length > 0
          ? { id: { in: input.documentIds } }
          : {}),
      },
    },
    select: {
      id: true,
      documentId: true,
      text: true,
      pageNumber: true,
      startOffset: true,
      endOffset: true,
      embedding: true,
      document: {
        select: {
          title: true,
          fileName: true,
        },
      },
    },
  });

  const ranked = candidateChunks
    .map((chunk) => {
      const embedding = isNumericVector(chunk.embedding) ? chunk.embedding : null;

      if (!embedding) {
        return null;
      }

      return {
        chunkId: chunk.id,
        score: cosineSimilarity(queryEmbedding.vector, embedding),
        documentId: chunk.documentId,
        documentTitle: chunk.document.title,
        fileName: chunk.document.fileName,
        text: chunk.text,
        pageNumber: chunk.pageNumber,
        startOffset: chunk.startOffset,
        endOffset: chunk.endOffset,
      } satisfies RetrievalResult;
    })
    .filter((result): result is RetrievalResult => Boolean(result))
    .sort((left, right) => right.score - left.score)
    .slice(0, input.limit ?? 8);

  return ranked;
}
