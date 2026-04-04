"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
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

  await prisma.document.create({
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

  revalidatePath("/dashboard");
  revalidatePath("/upload");
  revalidatePath("/documents");

  return {
    success: `Uploaded ${storedObject.fileName} and created a document record with UPLOADED status.`,
  };
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
