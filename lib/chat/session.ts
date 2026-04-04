export function buildChatSessionTitle(question: string) {
  const normalized = question.trim().replace(/\s+/g, " ");

  if (!normalized) {
    return "Untitled chat";
  }

  return normalized.length > 60 ? `${normalized.slice(0, 57)}...` : normalized;
}

export function coerceQueryArray(value?: string | string[]) {
  if (!value) {
    return [] as string[];
  }

  return Array.isArray(value) ? value : [value];
}
