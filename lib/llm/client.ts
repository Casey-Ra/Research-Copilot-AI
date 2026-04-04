import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

export function hasUsableApiKey() {
  const apiKey = process.env.OPENAI_API_KEY;
  return Boolean(apiKey && apiKey !== "replace-me");
}

export function getOpenAIClient() {
  if (!cachedClient) {
    cachedClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL,
    });
  }

  return cachedClient;
}
