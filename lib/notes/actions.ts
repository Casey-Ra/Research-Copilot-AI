"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { upsertNoteForUserBySource } from "@/lib/db/notes";
import { requireUser } from "@/lib/auth/session";
import { compareDocumentsForUser } from "@/lib/documents/comparison";

function normalizeQueryForSourceId(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 80);
}

function buildSearchLocation(input: {
  pageNumber?: number | null;
  startOffset?: number | null;
  endOffset?: number | null;
}) {
  if (input.pageNumber) {
    return `Page ${input.pageNumber}`;
  }

  if (input.startOffset !== null && input.startOffset !== undefined && input.endOffset !== null && input.endOffset !== undefined) {
    return `Offsets ${input.startOffset}-${input.endOffset}`;
  }

  return "Location unavailable";
}

function normalizeNoteTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeEntry(value: FormDataEntryValue | null) {
  return value?.toString().trim() ?? "";
}

export async function createManualNoteAction(formData: FormData) {
  const user = await requireUser();
  const title = normalizeEntry(formData.get("title"));
  const content = normalizeEntry(formData.get("content"));
  const tags = normalizeNoteTags(normalizeEntry(formData.get("tags")));

  if (!title || !content) {
    redirect("/notes");
  }

  await prisma.note.create({
    data: {
      userId: user.id,
      title,
      content,
      sourceType: "MANUAL",
      tags,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  redirect("/notes");
}

export async function updateNoteAction(noteId: string, formData: FormData) {
  const user = await requireUser();
  const title = normalizeEntry(formData.get("title"));
  const content = normalizeEntry(formData.get("content"));
  const tags = normalizeNoteTags(normalizeEntry(formData.get("tags")));

  if (!title || !content) {
    redirect(`/notes?edit=${noteId}`);
  }

  await prisma.note.updateMany({
    where: {
      id: noteId,
      userId: user.id,
    },
    data: {
      title,
      content,
      tags,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNoteAction(noteId: string) {
  const user = await requireUser();

  await prisma.note.deleteMany({
    where: {
      id: noteId,
      userId: user.id,
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/notes");
  redirect("/notes");
}

export async function saveSearchResultNoteAction(input: {
  chunkId: string;
  documentId: string;
  query: string;
  score: number;
}) {
  const user = await requireUser();

  const chunk = await prisma.documentChunk.findFirst({
    where: {
      id: input.chunkId,
      documentId: input.documentId,
      document: {
        userId: user.id,
        status: "READY",
      },
    },
    select: {
      id: true,
      text: true,
      pageNumber: true,
      startOffset: true,
      endOffset: true,
      document: {
        select: {
          id: true,
          title: true,
          fileName: true,
          fileType: true,
        },
      },
    },
  });

  if (!chunk) {
    redirect("/search");
  }

  const normalizedQuery = normalizeQueryForSourceId(input.query);
  const sourceId = `search-result:${chunk.id}:${normalizedQuery || "queryless"}`;
  const title = `${chunk.document.title} - Search finding`;
  const content = [
    `Search query: ${input.query}`,
    `Source document: ${chunk.document.title}`,
    `File: ${chunk.document.fileName} (${chunk.document.fileType})`,
    `Relevance score: ${input.score.toFixed(3)}`,
    `Location: ${buildSearchLocation(chunk)}`,
    "",
    chunk.text,
  ].join("\n");

  await upsertNoteForUserBySource({
    userId: user.id,
    sourceId,
    sourceType: "DOCUMENT",
    title,
    content,
    documentId: chunk.document.id,
    tags: ["search", "document-evidence", normalizedQuery || "search-result"],
  });

  revalidatePath("/dashboard");
  revalidatePath("/search");
  revalidatePath("/notes");
  redirect("/notes");
}

export async function saveComparisonNoteAction(input: {
  leftDocumentId: string;
  rightDocumentId: string;
  focusQuery?: string;
}) {
  const user = await requireUser();
  const comparison = await compareDocumentsForUser({
    userId: user.id,
    leftDocumentId: input.leftDocumentId,
    rightDocumentId: input.rightDocumentId,
    focusQuery: input.focusQuery,
  });

  const pairKey = [comparison.leftDocument.id, comparison.rightDocument.id].sort().join(":");
  const normalizedFocus = normalizeQueryForSourceId(comparison.focusQuery ?? "");
  const sourceId = `comparison:${pairKey}:${normalizedFocus || "overall"}`;
  const title = `${comparison.leftDocument.title} vs ${comparison.rightDocument.title}`;
  const sharedEvidenceBlock =
    comparison.sharedEvidence.length > 0
      ? comparison.sharedEvidence
          .map(
            (pair, index) =>
              `Shared evidence ${index + 1} (${pair.score.toFixed(3)}):\n- ${comparison.leftDocument.title}: ${pair.left.text}\n- ${comparison.rightDocument.title}: ${pair.right.text}`,
          )
          .join("\n\n")
      : "No strong shared evidence surfaced from the sampled chunks.";
  const uniqueLeftBlock =
    comparison.uniqueToLeft.length > 0
      ? comparison.uniqueToLeft.map((item, index) => `- ${comparison.leftDocument.title} ${index + 1}: ${item.text}`).join("\n")
      : `- No clearly unique evidence surfaced for ${comparison.leftDocument.title}.`;
  const uniqueRightBlock =
    comparison.uniqueToRight.length > 0
      ? comparison.uniqueToRight.map((item, index) => `- ${comparison.rightDocument.title} ${index + 1}: ${item.text}`).join("\n")
      : `- No clearly unique evidence surfaced for ${comparison.rightDocument.title}.`;

  const content = [
    `Comparison: ${comparison.leftDocument.title} vs ${comparison.rightDocument.title}`,
    `Focus: ${comparison.focusQuery ?? "Overall comparison"}`,
    `Similarity: ${comparison.similarityLabel} overlap (${comparison.similarityScore.toFixed(3)})`,
    "",
    comparison.comparisonNarrative,
    "",
    "Shared evidence",
    sharedEvidenceBlock,
    "",
    `Distinct to ${comparison.leftDocument.title}`,
    uniqueLeftBlock,
    "",
    `Distinct to ${comparison.rightDocument.title}`,
    uniqueRightBlock,
  ].join("\n");

  await upsertNoteForUserBySource({
    userId: user.id,
    sourceId,
    sourceType: "DOCUMENT",
    title,
    content,
    documentId: comparison.leftDocument.id,
    tags: ["compare", normalizedFocus || "overall-comparison"],
  });

  revalidatePath("/dashboard");
  revalidatePath("/compare");
  revalidatePath("/notes");
  redirect("/notes");
}

export async function saveChatMessageNoteAction(chatMessageId: string) {
  const user = await requireUser();
  const message = await prisma.chatMessage.findFirst({
    where: {
      id: chatMessageId,
      role: "ASSISTANT",
      chatSession: {
        userId: user.id,
      },
    },
    select: {
      id: true,
      content: true,
      chatSession: {
        select: {
          title: true,
          userId: true,
        },
      },
    },
  });

  if (!message) {
    redirect("/chat");
  }

  await upsertNoteForUserBySource({
    userId: user.id,
    sourceId: `chat-message:${message.id}`,
    sourceType: "CHAT_MESSAGE",
    title: `${message.chatSession.title} - Chat answer`,
    content: message.content,
    chatMessageId: message.id,
    tags: ["chat", "grounded-answer"],
  });

  revalidatePath("/dashboard");
  revalidatePath("/chat");
  revalidatePath("/notes");
  redirect("/notes?view=chat");
}
