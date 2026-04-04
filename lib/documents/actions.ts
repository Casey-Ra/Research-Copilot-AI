"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireUser } from "@/lib/auth/session";
import { ingestDocumentForUser } from "@/lib/documents/ingestion";
import { getDocumentSummaryFromMetadata } from "@/lib/documents/metadata";
import { generateDocumentSummaryForUser, getSummaryConfig } from "@/lib/documents/summaries";
import { getDocumentStorage } from "@/lib/documents/storage";
import { validateUploadInput } from "@/lib/documents/validation";
import type { DocumentSummaryType } from "@/types/database";

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

export async function generateDocumentSummaryAction(
  documentId: string,
  summaryType: DocumentSummaryType,
) {
  const user = await requireUser();

  try {
    await generateDocumentSummaryForUser({
      documentId,
      userId: user.id,
      summaryType,
    });
  } finally {
    revalidatePath("/dashboard");
    revalidatePath("/documents");
    revalidatePath(`/documents/${documentId}`);
    revalidatePath("/notes");
  }

  redirect(`/documents/${documentId}`);
}

export async function saveDocumentSummaryToNoteAction(
  documentId: string,
  summaryType: DocumentSummaryType,
) {
  const user = await requireUser();
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      userId: user.id,
    },
    select: {
      id: true,
      title: true,
      metadata: true,
    },
  });

  if (!document) {
    redirect("/documents");
  }

  const summary = getDocumentSummaryFromMetadata(document.metadata, summaryType);

  if (!summary) {
    redirect(`/documents/${document.id}`);
  }

  const summaryConfig = getSummaryConfig(summaryType);
  const sourceId = `document-summary:${document.id}:${summaryType}`;
  const existingNote = await prisma.note.findFirst({
    where: {
      userId: user.id,
      sourceType: "SUMMARY",
      sourceId,
    },
    select: {
      id: true,
    },
  });

  if (existingNote) {
    await prisma.note.update({
      where: {
        id: existingNote.id,
      },
      data: {
        title: `${document.title} - ${summaryConfig.noteTitle}`,
        content: summary.content,
        documentId: document.id,
        tags: ["summary", summaryType],
      },
    });
  } else {
    await prisma.note.create({
      data: {
        userId: user.id,
        documentId: document.id,
        title: `${document.title} - ${summaryConfig.noteTitle}`,
        content: summary.content,
        sourceType: "SUMMARY",
        sourceId,
        tags: ["summary", summaryType],
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/documents");
  revalidatePath(`/documents/${document.id}`);
  revalidatePath("/notes");
  redirect("/notes");
}
