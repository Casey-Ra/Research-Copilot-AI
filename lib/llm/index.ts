export type ChatCompletionRequest = {
  prompt: string;
  system?: string;
};

export async function createGroundedAnswerStub(_request: ChatCompletionRequest) {
  throw new Error("LLM orchestration is not implemented in Phase 0.");
}
