export function resolveDuckDuckGoResultHref(href: string): string {
  const normalized = href.startsWith("//") ? `https:${href}` : href;

  try {
    const u = new URL(normalized);
    if (u.hostname.includes("duckduckgo.com") && u.pathname.includes("/l/")) {
      const uddg = u.searchParams.get("uddg");
      if (uddg) {
        return decodeURIComponent(uddg);
      }
    }
    return u.toString();
  } catch {
    return href;
  }
}

export function urlDedupeKey(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "") || "/";
    return `${u.hostname.toLowerCase()}${path}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}
