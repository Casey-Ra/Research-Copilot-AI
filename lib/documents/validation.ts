import path from "node:path";
import {
  ALLOWED_FILE_EXTENSIONS,
  ALLOWED_FILE_TYPES,
  DEFAULT_TEXT_FILE_NAME,
  DEFAULT_TEXT_FILE_TYPE,
  MAX_UPLOAD_SIZE_BYTES,
} from "@/lib/documents/constants";

type ValidationSuccess = {
  ok: true;
  fileName: string;
  fileType: string;
  title: string;
  bytes: Buffer;
  sourceKind: "file" | "pasted-text";
};

type ValidationFailure = {
  ok: false;
  error: string;
};

export type UploadValidationResult = ValidationSuccess | ValidationFailure;

function normalizeTitle(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function guessTitleFromFileName(fileName: string) {
  const ext = path.extname(fileName);
  return path.basename(fileName, ext).replace(/[-_]+/g, " ").trim() || "Untitled document";
}

function hasAllowedExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase();
  return ALLOWED_FILE_EXTENSIONS.includes(extension as (typeof ALLOWED_FILE_EXTENSIONS)[number]);
}

export async function validateUploadInput(formData: FormData): Promise<UploadValidationResult> {
  const manualTitle = normalizeTitle(formData.get("title")?.toString() ?? "");
  const pastedText = formData.get("pastedText")?.toString().trim() ?? "";
  const file = formData.get("file");

  if (file instanceof File && file.size > 0) {
    if (file.size > MAX_UPLOAD_SIZE_BYTES) {
      return {
        ok: false,
        error: "Files must be 10 MB or smaller for the current local upload pipeline.",
      };
    }

    if (!hasAllowedExtension(file.name) || !ALLOWED_FILE_TYPES.includes(file.type as never)) {
      return {
        ok: false,
        error: "Only TXT and PDF files are supported right now.",
      };
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer);

    return {
      ok: true,
      fileName: file.name,
      fileType: file.type,
      title: manualTitle || guessTitleFromFileName(file.name),
      bytes,
      sourceKind: "file",
    };
  }

  if (pastedText.length > 0) {
    const bytes = Buffer.from(pastedText, "utf8");

    if (bytes.byteLength > MAX_UPLOAD_SIZE_BYTES) {
      return {
        ok: false,
        error: "Pasted text is too large for the current local upload pipeline.",
      };
    }

    return {
      ok: true,
      fileName: DEFAULT_TEXT_FILE_NAME,
      fileType: DEFAULT_TEXT_FILE_TYPE,
      title: manualTitle || "Pasted research notes",
      bytes,
      sourceKind: "pasted-text",
    };
  }

  return {
    ok: false,
    error: "Add a TXT or PDF file, or paste text into the text area before submitting.",
  };
}
