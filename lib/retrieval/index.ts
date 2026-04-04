export type RetrievalResult = {
  chunkId: string;
  score: number;
  documentId: string;
  text: string;
};

export async function searchDocumentsStub(_query: string): Promise<RetrievalResult[]> {
  throw new Error("Semantic retrieval is not implemented in Phase 0.");
}
