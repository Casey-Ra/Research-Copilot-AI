import { WEB_SEARCH_USER_AGENT } from "@/lib/web-search/constants";
import type { WebSearchHit } from "@/lib/web-search/types";

type OpenSearchResponse = [string, string[], string[], string[]];

export async function wikipediaOpenSearchHits(topic: string, limit: number): Promise<WebSearchHit[]> {
  const params = new URLSearchParams({
    action: "opensearch",
    search: topic,
    limit: String(limit),
    namespace: "0",
    format: "json",
  });

  const res = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
    headers: { "User-Agent": WEB_SEARCH_USER_AGENT },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return [];
  }

  const data = (await res.json()) as OpenSearchResponse;
  if (!Array.isArray(data) || data.length < 4) {
    return [];
  }

  const [, titles, descriptions, urls] = data;
  const hits: WebSearchHit[] = [];

  for (let i = 0; i < titles.length; i += 1) {
    const title = titles[i]?.trim();
    const url = urls[i]?.trim();
    if (!title || !url) {
      continue;
    }
    hits.push({
      title,
      url,
      snippet: (descriptions[i] ?? "").trim(),
      provider: "wikipedia",
    });
  }

  return hits;
}

export async function wikipediaRestExtract(url: string): Promise<string | undefined> {
  try {
    const u = new URL(url);
    if (!u.hostname.endsWith("wikipedia.org")) {
      return undefined;
    }
    const m = u.pathname.match(/^\/wiki\/(.+)$/);
    if (!m) {
      return undefined;
    }
    const pageTitle = decodeURIComponent(m[1]).replace(/_/g, " ");
    const lang = u.hostname.split(".")[0] || "en";
    const apiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
    const res = await fetch(apiUrl, {
      headers: { "User-Agent": WEB_SEARCH_USER_AGENT },
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      return undefined;
    }
    const data = (await res.json()) as { extract?: string };
    return data.extract?.trim();
  } catch {
    return undefined;
  }
}
