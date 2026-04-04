import { PDFParse } from "pdf-parse";
import type { ParsedDocument } from "@/lib/documents";

function normalizeExtractedText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

async function parseTextDocument(buffer: Buffer): Promise<ParsedDocument> {
  const text = normalizeExtractedText(buffer.toString("utf8"));

  return {
    text,
    metadata: {
      parser: "text",
    },
  };
}

async function parsePdfDocument(buffer: Buffer): Promise<ParsedDocument> {
  const parser = new PDFParse({ data: buffer });
  const parsed = await parser.getText({
    parsePageInfo: true,
  });
  await parser.destroy();

  const pages = parsed.pages
    .map((page) => ({
      pageNumber: page.num,
      text: normalizeExtractedText(page.text),
    }))
    .filter((page) => page.text.length > 0);

  const text = normalizeExtractedText(parsed.text ?? "");

  return {
    text,
    pageCount: typeof parsed.total === "number" ? parsed.total : pages.length,
    pages,
    metadata: {
      parser: "pdf",
      pageCount: parsed.total ?? pages.length,
    },
  };
}

export async function parseStoredDocument(input: {
  fileType: string;
  fileName: string;
  buffer: Buffer;
}): Promise<ParsedDocument> {
  if (input.fileType === "application/pdf" || input.fileName.toLowerCase().endsWith(".pdf")) {
    return parsePdfDocument(input.buffer);
  }

  return parseTextDocument(input.buffer);
}
