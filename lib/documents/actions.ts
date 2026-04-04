"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ingestDocumentForUser } from "@/lib/documents/ingestion";
import { getDocumentStorage } from "@/lib/documents/storage";
import { validateUploadInput } from "@/lib/documents/validation";

export type UploadDocumentActionState = {
  error?: string;
  success?: string;
};

export async function uploadDocumentAction(
  _previousState: UploadDocumentActionState,
  formData: FormData,
): Promise<UploadDocumentActionState> {
  const user = await requireUser();
  const storage = getDocumentStorage();
  const validationResult = await validateUploadInput(formData);

  if (!validationResult.ok) {
    return { error: validationResult.error };
  }

  const storedObject = await storage.saveFile({
    userId: user.id,
    fileName: validationResult.fileName,
    fileType: validationResult.fileType,
    bytes: validationResult.bytes,
  });

  const document = await prisma.document.create({
    data: {
      userId: user.id,
      title: validationResult.title,
      fileName: storedObject.fileName,
      fileType: storedObject.fileType,
      storagePath: storedObject.storagePath,
      fileSizeBytes: storedObject.fileSizeBytes,
      status: "UPLOADED",
      metadata: {
        sourceKind: validationResult.sourceKind,
        uploadedAt: new Date().toISOString(),
      },
    },
  });

  try {
    const ingestionResult = await ingestDocumentForUser(document.id, user.id);

    revalidatePath("/dashboard");
    revalidatePath("/upload");
    revalidatePath("/documents");

    return {
      success: `Uploaded ${storedObject.fileName}, extracted text, and stored ${ingestionResult.chunkCount} chunks.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error.";

    revalidatePath("/dashboard");
    revalidatePath("/upload");
    revalidatePath("/documents");

    return {
      error: `The file was uploaded, but processing failed. The document is marked FAILED. ${message}`,
    };
  }
}

export async function processDocumentAction(documentId: string) {
  const user = await requireUser();

  try {
    await ingestDocumentForUser(documentId, user.id);
  } catch {
    // The document is marked FAILED inside the ingestion service, so redirecting
    // back to the detail page gives the user the latest status and error context.
  }

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  revalidatePath("/documents");
  redirect(`/documents/${documentId}`);
}

export async function deleteDocumentAction(documentId: string) {
  const user = await requireUser();
  const storage = getDocumentStorage();

  const existingDocument = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
    select: {
      storagePath: true,
    },
  });

  await prisma.document.deleteMany({
    where: {
      id: documentId,
      userId: user.id,
    },
  });

  if (existingDocument?.storagePath) {
    await storage.deleteFile(existingDocument.storagePath);
  }

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  revalidatePath("/documents");
  redirect("/documents");
}
