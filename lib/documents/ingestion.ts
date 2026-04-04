import { prisma } from "@/lib/db/prisma";
import { mergeDocumentMetadata } from "@/lib/documents/metadata";
import { getDocumentStorage } from "@/lib/documents/storage";
import { parseStoredDocument } from "@/lib/documents/parsers";
import { chunkParsedDocument } from "@/lib/documents/chunking";
import { generateEmbeddings } from "@/lib/embeddings";

type IngestionResult = {
  documentId: string;
  chunkCount: number;
  pageCount?: number;
  embeddingModel?: string;
};

export async function ingestDocumentForUser(documentId: string, userId: string): Promise<IngestionResult> {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId,
    },
  });

  if (!document) {
    throw new Error("Document not found for this user.");
  }

  if (!document.storagePath) {
    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "FAILED",
        metadata: mergeDocumentMetadata(document.metadata, {
          ingestionError: "Document is missing a storage path.",
        }),
      },
    });

    throw new Error("Document is missing a storage path.");
  }

  await prisma.document.update({
    where: { id: document.id },
    data: {
      status: "PROCESSING",
      metadata: mergeDocumentMetadata(document.metadata, {
        ingestionStartedAt: new Date().toISOString(),
        ingestionError: null,
      }),
    },
  });

  try {
    const storage = getDocumentStorage();
    const buffer = await storage.readFile(document.storagePath);
    const parsed = await parseStoredDocument({
      fileType: document.fileType,
      fileName: document.fileName,
      buffer,
    });

    const chunks = chunkParsedDocument(parsed);

    if (chunks.length === 0) {
      throw new Error("No usable text could be extracted from this document.");
    }

    const embeddings = await generateEmbeddings({
      texts: chunks.map((chunk) => chunk.text),
      userId,
    });

    await prisma.$transaction([
      prisma.documentChunk.deleteMany({
        where: { documentId: document.id },
      }),
      prisma.document.update({
        where: { id: document.id },
        data: {
          extractedText: parsed.text,
          status: "READY",
          metadata: mergeDocumentMetadata(document.metadata, {
            ...parsed.metadata,
            pageCount: parsed.pageCount ?? parsed.pages?.length ?? null,
            chunkCount: chunks.length,
            ingestionCompletedAt: new Date().toISOString(),
            embeddingModel: embeddings.model,
            embeddingProvider: embeddings.provider,
            embeddingDimensions: embeddings.dimensions,
            ingestionError: null,
          }),
        },
      }),
      prisma.documentChunk.createMany({
        data: chunks.map((chunk, index) => ({
          documentId: document.id,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          pageNumber: chunk.pageNumber ?? null,
          startOffset: chunk.startOffset ?? null,
          endOffset: chunk.endOffset ?? null,
          embedding: embeddings.vectors[index],
          embeddingModel: embeddings.model,
        })),
      }),
    ]);

    return {
      documentId: document.id,
      chunkCount: chunks.length,
      pageCount: parsed.pageCount ?? parsed.pages?.length,
      embeddingModel: embeddings.model,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error.";

    await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "FAILED",
        metadata: mergeDocumentMetadata(document.metadata, {
          ingestionFailedAt: new Date().toISOString(),
          ingestionError: message,
        }),
      },
    });

    throw error;
  }
}
