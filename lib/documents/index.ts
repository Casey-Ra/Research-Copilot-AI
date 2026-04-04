export type DocumentStatus = "uploaded" | "processing" | "ready" | "failed";

export type StoredDocument = {
  id: string;
  title: string;
  fileName: string;
  fileType: string;
  status: DocumentStatus;
};

export type DocumentChunkRecord = {
  id: string;
  documentId: string;
  chunkIndex: number;
  text: string;
  pageNumber?: number | null;
  startOffset?: number | null;
  endOffset?: number | null;
  embedding?: unknown;
};

export type ParsedPage = {
  pageNumber: number;
  text: string;
};

export type ParsedDocument = {
  text: string;
  pageCount?: number;
  pages?: ParsedPage[];
  metadata?: Record<string, unknown>;
};

export type ChunkedDocumentRecord = {
  chunkIndex: number;
  text: string;
  pageNumber?: number | null;
  startOffset?: number | null;
  endOffset?: number | null;
};
