"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { upsertNoteForUserBySource } from "@/lib/db/notes";
import { requireUser } from "@/lib/auth/session";
import { ingestDocumentForUser } from "@/lib/documents/ingestion";
import { getDocumentSummaryFromMetadata } from "@/lib/documents/metadata";
import { generateDocumentSummaryForUser, getSummaryConfig } from "@/lib/documents/summaries";
import { createDocumentAndIngestForUser } from "@/lib/documents/create-and-ingest";
import { getDocumentStorage } from "@/lib/documents/storage";
import { validateUploadInput } from "@/lib/documents/validation";
import { getErrorMessage } from "@/lib/utils/errors";
import { logger } from "@/lib/utils/logger";
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
  const validationResult = await validateUploadInput(formData);

  if (!validationResult.ok) {
    return { error: validationResult.error };
  }

  try {
    const { documentId, chunkCount, fileName } = await createDocumentAndIngestForUser({
      userId: user.id,
      title: validationResult.title,
      fileName: validationResult.fileName,
      fileType: validationResult.fileType,
      bytes: validationResult.bytes,
      metadata: {
        sourceKind: validationResult.sourceKind,
        uploadedAt: new Date().toISOString(),
      },
    });
    logger.info("document.upload.completed", {
      userId: user.id,
      documentId,
      chunkCount,
      fileType: validationResult.fileType,
    });

    revalidatePath("/dashboard");
    revalidatePath("/upload");
    revalidatePath("/documents");

    return {
      success: `Uploaded ${fileName}, extracted text, and stored ${chunkCount} chunks.`,
    };
  } catch (error) {
    const message = getErrorMessage(error, "Unknown ingestion error.");
    logger.error("document.upload.failed", {
      userId: user.id,
      message,
    });

    revalidatePath("/dashboard");
    revalidatePath("/upload");
    revalidatePath("/documents");

    return {
      error: `Could not finish processing this upload. ${message}`,
    };
  }
}

export async function processDocumentAction(documentId: string) {
  const user = await requireUser();

  try {
    await ingestDocumentForUser(documentId, user.id);
    logger.info("document.reprocess.completed", {
      userId: user.id,
      documentId,
    });
  } catch (error) {
    logger.error("document.reprocess.failed", {
      userId: user.id,
      documentId,
      message: getErrorMessage(error),
    });
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

  logger.info("document.deleted", {
    userId: user.id,
    documentId,
  });

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
    logger.info("document.summary.generated", {
      userId: user.id,
      documentId,
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
  await upsertNoteForUserBySource({
    userId: user.id,
    sourceId,
    sourceType: "SUMMARY",
    title: `${document.title} - ${summaryConfig.noteTitle}`,
    content: summary.content,
    documentId: document.id,
    tags: ["summary", summaryType],
  });

  logger.info("note.summary.saved", {
    userId: user.id,
    documentId: document.id,
    summaryType,
    sourceId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/documents");
  revalidatePath(`/documents/${document.id}`);
  revalidatePath("/notes");
  redirect("/notes?view=summary&success=Summary saved to notes.");
}
