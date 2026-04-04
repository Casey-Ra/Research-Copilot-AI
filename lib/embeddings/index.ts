import OpenAI from "openai";

export type EmbeddingModelConfig = {
  model?: string;
  dimensions?: number;
};

export type EmbeddingBatchResult = {
  vectors: number[][];
  model: string;
  dimensions: number;
  provider: "openai" | "local-fallback";
};

function getEmbeddingConfig(config?: EmbeddingModelConfig) {
  const model = config?.model ?? process.env.EMBEDDING_MODEL ?? "text-embedding-3-small";
  const configuredDimensions =
    config?.dimensions ?? Number(process.env.EMBEDDING_DIMENSIONS ?? 256);
  const dimensions = configuredDimensions || undefined;

  return { model, dimensions };
}

function hasUsableApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey !== "replace-me");
}

function normalizeVector(vector: number[]) {
  const magnitude = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));

  if (!magnitude) {
    return vector;
  }

  return vector.map((value) => value / magnitude);
}

function generateLocalFallbackEmbedding(text: string, dimensions: number) {
  const vector = Array.from({ length: dimensions }, () => 0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];

  for (const token of tokens) {
    let hash = 2166136261;

    for (let index = 0; index < token.length; index += 1) {
      hash ^= token.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    vector[Math.abs(hash) % dimensions] += 1;
  }

  return normalizeVector(vector);
}

async function generateOpenAIEmbeddings(
  texts: string[],
  config?: EmbeddingModelConfig,
): Promise<EmbeddingBatchResult> {
  const { model, dimensions } = getEmbeddingConfig(config);
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL,
  });

  const response = await client.embeddings.create({
    model,
    input: texts,
    encoding_format: "float",
    ...(dimensions ? { dimensions } : {}),
  });

  const vectors = response.data.map((item) => item.embedding);

  return {
    vectors,
    model: response.model,
    dimensions: vectors[0]?.length ?? dimensions ?? 0,
    provider: "openai",
  };
}

export async function generateEmbeddings(input: {
  texts: string[];
  userId?: string;
  config?: EmbeddingModelConfig;
}): Promise<EmbeddingBatchResult> {
  const texts = input.texts.map((text) => text.trim()).filter(Boolean);
  const { model, dimensions } = getEmbeddingConfig(input.config);

  if (texts.length === 0) {
    return {
      vectors: [],
      model,
      dimensions: dimensions ?? 0,
      provider: hasUsableApiKey() ? "openai" : "local-fallback",
    };
  }

  if (hasUsableApiKey()) {
    return generateOpenAIEmbeddings(texts, input.config);
  }

  const fallbackDimensions = dimensions ?? 256;

  return {
    vectors: texts.map((text) => generateLocalFallbackEmbedding(text, fallbackDimensions)),
    model: "local-hash-embedding",
    dimensions: fallbackDimensions,
    provider: "local-fallback",
  };
}

export async function generateQueryEmbedding(input: string, config?: EmbeddingModelConfig) {
  const result = await generateEmbeddings({
    texts: [input],
    config,
  });

  return {
    vector: result.vectors[0] ?? [],
    model: result.model,
    dimensions: result.dimensions,
    provider: result.provider,
  };
}
