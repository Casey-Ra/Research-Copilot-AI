import type { ChunkedDocumentRecord, ParsedDocument } from "@/lib/documents";

const DEFAULT_CHUNK_SIZE = Number(process.env.CHUNK_SIZE_CHARS ?? 1200);
const DEFAULT_CHUNK_OVERLAP = Number(process.env.CHUNK_OVERLAP_CHARS ?? 200);

function normalizeWhitespace(value: string) {
  return value.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
}

function buildChunksFromText(
  text: string,
  options: {
    baseChunkIndex: number;
    pageNumber?: number;
    startOffsetSeed?: number;
    chunkSize: number;
    overlap: number;
  },
) {
  const normalized = normalizeWhitespace(text);

  if (!normalized) {
    return [] as ChunkedDocumentRecord[];
  }

  const chunks: ChunkedDocumentRecord[] = [];
  let chunkIndex = options.baseChunkIndex;
  let cursor = 0;

  while (cursor < normalized.length) {
    const maxEnd = Math.min(cursor + options.chunkSize, normalized.length);
    let end = maxEnd;

    if (end < normalized.length) {
      const breakCandidate = normalized.lastIndexOf(" ", end);

      if (breakCandidate > cursor + Math.floor(options.chunkSize * 0.6)) {
        end = breakCandidate;
      }
    }

    const slice = normalized.slice(cursor, end).trim();

    if (!slice) {
      break;
    }

    const startOffset = (options.startOffsetSeed ?? 0) + cursor;
    const endOffset = (options.startOffsetSeed ?? 0) + end;

    chunks.push({
      chunkIndex,
      text: slice,
      pageNumber: options.pageNumber ?? null,
      startOffset,
      endOffset,
    });

    if (end >= normalized.length) {
      break;
    }

    cursor = Math.max(end - options.overlap, cursor + 1);
    chunkIndex += 1;
  }

  return chunks;
}

export function chunkParsedDocument(
  parsedDocument: ParsedDocument,
  options?: {
    chunkSize?: number;
    overlap?: number;
  },
): ChunkedDocumentRecord[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  const overlap = options?.overlap ?? DEFAULT_CHUNK_OVERLAP;

  if (parsedDocument.pages && parsedDocument.pages.length > 0) {
    const chunks: ChunkedDocumentRecord[] = [];
    let nextChunkIndex = 0;
    let runningOffset = 0;

    for (const page of parsedDocument.pages) {
      const pageChunks = buildChunksFromText(page.text, {
        baseChunkIndex: nextChunkIndex,
        pageNumber: page.pageNumber,
        startOffsetSeed: runningOffset,
        chunkSize,
        overlap,
      });

      chunks.push(...pageChunks);
      nextChunkIndex += pageChunks.length;
      runningOffset += page.text.length + 2;
    }

    return chunks;
  }

  return buildChunksFromText(parsedDocument.text, {
    baseChunkIndex: 0,
    chunkSize,
    overlap,
  });
}
