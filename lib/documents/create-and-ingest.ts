import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ingestDocumentForUser } from "@/lib/documents/ingestion";
import { getDocumentStorage } from "@/lib/documents/storage";

export type CreateDocumentInput = {
  userId: string;
  title: string;
  fileName: string;
  fileType: string;
  bytes: Buffer;
  metadata: Prisma.InputJsonValue;
};

export async function createDocumentAndIngestForUser(
  input: CreateDocumentInput,
): Promise<{ documentId: string; chunkCount: number; fileName: string }> {
  const storage = getDocumentStorage();
  const storedObject = await storage.saveFile({
    userId: input.userId,
    fileName: input.fileName,
    fileType: input.fileType,
    bytes: input.bytes,
  });

  const document = await prisma.document.create({
    data: {
      userId: input.userId,
      title: input.title,
      fileName: storedObject.fileName,
      fileType: storedObject.fileType,
      storagePath: storedObject.storagePath,
      fileSizeBytes: storedObject.fileSizeBytes,
      status: "UPLOADED",
      metadata: input.metadata,
    },
  });

  const ingestionResult = await ingestDocumentForUser(document.id, input.userId);

  return {
    documentId: document.id,
    chunkCount: ingestionResult.chunkCount,
    fileName: storedObject.fileName,
  };
}
