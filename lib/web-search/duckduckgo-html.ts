import { WEB_SEARCH_USER_AGENT } from "@/lib/web-search/constants";
import { resolveDuckDuckGoResultHref, urlDedupeKey } from "@/lib/web-search/resolve-url";
import type { WebSearchHit } from "@/lib/web-search/types";

function stripResultInnerHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&#x27;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function extractSnippetByUrl(html: string): Map<string, string> {
  const map = new Map<string, string>();
  const re = /<a[^>]*class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  for (m = re.exec(html); m !== null; m = re.exec(html)) {
    const rawUrl = m[1];
    const resolved = resolveDuckDuckGoResultHref(rawUrl);
    map.set(urlDedupeKey(resolved), stripResultInnerHtml(m[2]));
  }
  return map;
}

export async function duckDuckGoHtmlHits(topic: string, limit: number): Promise<WebSearchHit[]> {
  const body = new URLSearchParams({ q: topic });
  const res = await fetch("https://html.duckduckgo.com/html/", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": WEB_SEARCH_USER_AGENT,
    },
    body: body.toString(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    return [];
  }

  const html = await res.text();
  const snippets = extractSnippetByUrl(html);
  const hits: WebSearchHit[] = [];
  const seen = new Set<string>();

  const titleRe = /<a[^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let tm: RegExpExecArray | null;
  for (tm = titleRe.exec(html); tm !== null; tm = titleRe.exec(html)) {
    const resolvedUrl = resolveDuckDuckGoResultHref(tm[1]);
    const key = urlDedupeKey(resolvedUrl);
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    const title = stripResultInnerHtml(tm[2]) || resolvedUrl;
    hits.push({
      title,
      url: resolvedUrl,
      snippet: snippets.get(key) ?? "",
      provider: "duckduckgo",
    });
    if (hits.length >= limit) {
      break;
    }
  }

  return hits;
}
