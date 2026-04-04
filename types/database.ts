export type JsonCitation = {
  chunkId?: string;
  documentId: string;
  documentTitle?: string;
  fileName?: string;
  chunkIndex?: number;
  pageNumber?: number;
  startOffset?: number | null;
  endOffset?: number | null;
  score?: number;
  quote?: string;
};

export type DocumentMetadata = {
  source?: string;
  pageCount?: number;
  originalFileName?: string;
};
