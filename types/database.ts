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

export type DocumentSummaryType = "concise" | "bullets" | "takeaways" | "actionItems";

export type DocumentSummaryEntry = {
  type: DocumentSummaryType;
  title: string;
  content: string;
  generatedAt: string;
  provider: "openai" | "local-fallback";
  model: string;
  evidenceMode: "full-document" | "chunk-sample";
  chunkCount: number;
  totalChunks: number;
};

export type DocumentSummaryMap = Partial<Record<DocumentSummaryType, DocumentSummaryEntry>>;

export type DocumentMetadata = Record<string, unknown> & {
  source?: string;
  pageCount?: number;
  originalFileName?: string;
  summaries?: DocumentSummaryMap;
  summaryErrors?: Partial<Record<DocumentSummaryType, string | null>>;
};
