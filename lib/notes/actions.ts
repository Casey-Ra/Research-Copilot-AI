"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
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

export async function saveSearchResultNoteAction(input: {
  chunkId: string;
  documentId: string;
  documentTitle: string;
  fileName: string;
  fileType: string;
  query: string;
  score: number;
  text: string;
  pageNumber?: number | null;
  startOffset?: number | null;
  endOffset?: number | null;
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

  const existingNote = await prisma.note.findFirst({
    where: {
      userId: user.id,
      sourceId,
    },
    select: {
      id: true,
    },
  });

  if (existingNote) {
    await prisma.note.update({
      where: { id: existingNote.id },
      data: {
        title,
        content,
        documentId: chunk.document.id,
        sourceType: "DOCUMENT",
        tags: ["search", "document-evidence", normalizedQuery || "search-result"],
      },
    });
  } else {
    await prisma.note.create({
      data: {
        userId: user.id,
        documentId: chunk.document.id,
        title,
        content,
        sourceType: "DOCUMENT",
        sourceId,
        tags: ["search", "document-evidence", normalizedQuery || "search-result"],
      },
    });
  }

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

  const existingNote = await prisma.note.findFirst({
    where: {
      userId: user.id,
      sourceId,
    },
    select: {
      id: true,
    },
  });

  if (existingNote) {
    await prisma.note.update({
      where: { id: existingNote.id },
      data: {
        title,
        content,
        documentId: comparison.leftDocument.id,
        sourceType: "DOCUMENT",
        tags: ["compare", normalizedFocus || "overall-comparison"],
      },
    });
  } else {
    await prisma.note.create({
      data: {
        userId: user.id,
        documentId: comparison.leftDocument.id,
        title,
        content,
        sourceType: "DOCUMENT",
        sourceId,
        tags: ["compare", normalizedFocus || "overall-comparison"],
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/compare");
  revalidatePath("/notes");
  redirect("/notes");
}
