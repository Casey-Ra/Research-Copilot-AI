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

// Phase 2 note:
// The database schema now supports documents and chunks, but parsing and chunk creation
// are still deferred to the ingestion phase.
