import type { Prisma } from "@prisma/client";
import type { DocumentMetadata, DocumentSummaryEntry, DocumentSummaryType } from "@/types/database";

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseDocumentMetadata(value: unknown): DocumentMetadata {
  if (!isJsonObject(value)) {
    return {};
  }

  return value as DocumentMetadata;
}

export function mergeDocumentMetadata(
  existing: unknown,
  incoming: Record<string, unknown>,
): Prisma.InputJsonValue {
  return {
    ...parseDocumentMetadata(existing),
    ...incoming,
  } as Prisma.InputJsonObject;
}

export function getDocumentSummaryFromMetadata(
  metadata: unknown,
  summaryType: DocumentSummaryType,
): DocumentSummaryEntry | null {
  const parsed = parseDocumentMetadata(metadata);
  const candidate = parsed.summaries?.[summaryType];

  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  return candidate as DocumentSummaryEntry;
}

export function getDocumentSummaryError(
  metadata: unknown,
  summaryType: DocumentSummaryType,
): string | null {
  const parsed = parseDocumentMetadata(metadata);
  const error = parsed.summaryErrors?.[summaryType];

  return typeof error === "string" ? error : null;
}

export function withUpdatedDocumentSummary(
  metadata: unknown,
  summaryType: DocumentSummaryType,
  summary: DocumentSummaryEntry,
): Prisma.InputJsonValue {
  const parsed = parseDocumentMetadata(metadata);

  return {
    ...parsed,
    summaries: {
      ...(parsed.summaries ?? {}),
      [summaryType]: summary,
    },
    summaryErrors: {
      ...(parsed.summaryErrors ?? {}),
      [summaryType]: null,
    },
  } as Prisma.InputJsonObject;
}

export function withDocumentSummaryError(
  metadata: unknown,
  summaryType: DocumentSummaryType,
  error: string | null,
): Prisma.InputJsonValue {
  const parsed = parseDocumentMetadata(metadata);

  return {
    ...parsed,
    summaryErrors: {
      ...(parsed.summaryErrors ?? {}),
      [summaryType]: error,
    },
  } as Prisma.InputJsonObject;
}
