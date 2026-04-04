export type JsonCitation = {
  documentId: string;
  chunkIndex?: number;
  pageNumber?: number;
  quote?: string;
};

export type DocumentMetadata = {
  source?: string;
  pageCount?: number;
  originalFileName?: string;
};
