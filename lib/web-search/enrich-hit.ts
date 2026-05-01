import { MAX_ENRICHED_BODY_CHARS, MAX_FETCH_HTML_BYTES, WEB_SEARCH_USER_AGENT } from "@/lib/web-search/constants";
import { htmlToPlainText } from "@/lib/web-search/html-to-text";
import { wikipediaRestExtract } from "@/lib/web-search/wikipedia";
import type { WebSearchHit } from "@/lib/web-search/types";

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max)}\n\n[Text truncated for ingestion size limits.]`;
}

async function fetchGenericPagePlainText(url: string): Promise<string | undefined> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": WEB_SEARCH_USER_AGENT, Accept: "text/html,application/xhtml+xml" },
      signal: controller.signal,
      redirect: "follow",
    });
    if (!res.ok) {
      return undefined;
    }
    const lenHeader = res.headers.get("content-length");
    if (lenHeader && Number(lenHeader) > MAX_FETCH_HTML_BYTES) {
      return undefined;
    }
    const buf = await res.arrayBuffer();
    if (buf.byteLength > MAX_FETCH_HTML_BYTES) {
      return undefined;
    }
    const ct = res.headers.get("content-type") ?? "";
    if (!ct.includes("text/html") && !ct.includes("application/xhtml")) {
      return undefined;
    }
    const html = new TextDecoder("utf-8", { fatal: false }).decode(new Uint8Array(buf));
    const plain = htmlToPlainText(html);
    return plain.length > 0 ? plain : undefined;
  } catch {
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}

export async function enrichWebHitBody(hit: WebSearchHit): Promise<string | undefined> {
  if (hit.url.includes("wikipedia.org/wiki/")) {
    const extract = await wikipediaRestExtract(hit.url);
    return extract ? truncate(extract, MAX_ENRICHED_BODY_CHARS) : undefined;
  }

  const fetched = await fetchGenericPagePlainText(hit.url);
  return fetched ? truncate(fetched, MAX_ENRICHED_BODY_CHARS) : undefined;
}
