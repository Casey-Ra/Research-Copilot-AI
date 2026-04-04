export type EmbeddingModelConfig = {
  model: string;
  dimensions?: number;
};

export async function generateEmbeddingStub(_input: string, _config: EmbeddingModelConfig) {
  throw new Error("Embedding generation is not implemented in Phase 0.");
}
