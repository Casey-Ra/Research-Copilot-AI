import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/documents/constants";
import type { WebSearchHit } from "@/lib/web-search/types";

function utf8SafeTruncate(str: string, maxBytes: number): string {
  let out = "";
  for (const ch of str) {
    const next = out + ch;
    if (Buffer.byteLength(next, "utf8") > maxBytes) {
      break;
    }
    out = next;
  }
  return out;
}

export function buildWebSourcePlainText(topic: string, hit: WebSearchHit, enriched?: string): string {
  const body =
    enriched?.trim() ??
    "(No additional plain text could be fetched automatically; rely on the snippet above.)";

  return [
    `Topic: ${topic}`,
    `Title: ${hit.title}`,
    `URL: ${hit.url}`,
    `Provider: ${hit.provider}`,
    "",
    "--- Snippet ---",
    hit.snippet.trim() || "(No snippet returned.)",
    "",
    "--- Extracted text ---",
    body,
    "",
  ].join("\n");
}

export function webSourceTextToUploadBuffer(text: string): Buffer {
  const note = "\n[Truncated for upload size limit.]\n";
  const max = MAX_UPLOAD_SIZE_BYTES - Buffer.byteLength(note, "utf8");
  if (Buffer.byteLength(text, "utf8") <= MAX_UPLOAD_SIZE_BYTES) {
    return Buffer.from(text, "utf8");
  }
  return Buffer.from(utf8SafeTruncate(text, max) + note, "utf8");
}
