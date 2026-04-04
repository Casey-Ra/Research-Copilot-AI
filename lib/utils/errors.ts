export function getErrorMessage(error: unknown, fallback = "An unexpected error occurred.") {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function truncateMessage(message: string, limit = 180) {
  if (message.length <= limit) {
    return message;
  }

  return `${message.slice(0, limit - 3).trimEnd()}...`;
}
