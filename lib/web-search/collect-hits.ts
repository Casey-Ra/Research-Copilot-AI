import {
  MAX_WEB_SOURCES_PER_IMPORT,
  MAX_WEB_TOPIC_CHARS,
} from "@/lib/web-search/constants";
import { duckDuckGoHtmlHits } from "@/lib/web-search/duckduckgo-html";
import { urlDedupeKey } from "@/lib/web-search/resolve-url";
import type { WebSearchHit } from "@/lib/web-search/types";
import { wikipediaOpenSearchHits } from "@/lib/web-search/wikipedia";

export function normalizeWebTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").slice(0, MAX_WEB_TOPIC_CHARS);
}

export async function collectFreeWebHits(topic: string): Promise<WebSearchHit[]> {
  const normalized = normalizeWebTopic(topic);
  if (!normalized) {
    return [];
  }

  const cap = MAX_WEB_SOURCES_PER_IMPORT;
  const wikiLimit = Math.min(5, cap);
  const ddgLimit = Math.min(10, cap + 4);

  const [wikiHits, ddgHits] = await Promise.all([
    wikipediaOpenSearchHits(normalized, wikiLimit),
    duckDuckGoHtmlHits(normalized, ddgLimit),
  ]);

  const merged: WebSearchHit[] = [];
  const seen = new Set<string>();

  const pushUnique = (hit: WebSearchHit) => {
    const key = urlDedupeKey(hit.url);
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    merged.push(hit);
  };

  for (const h of wikiHits) {
    pushUnique(h);
    if (merged.length >= cap) {
      return merged;
    }
  }

  for (const h of ddgHits) {
    pushUnique(h);
    if (merged.length >= cap) {
      return merged;
    }
  }

  return merged;
}
