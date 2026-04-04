export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = [
  "text/plain",
  "application/pdf",
] as const;

export const ALLOWED_FILE_EXTENSIONS = [".txt", ".pdf"] as const;

export const DEFAULT_TEXT_FILE_TYPE = "text/plain";

export const DEFAULT_TEXT_FILE_NAME = "pasted-notes.txt";
