export function normalizeUrl(raw: string, base: URL): URL | null {
  try {
    const u = new URL(raw, base);
    u.hash = "";
    if (u.pathname.endsWith("/") && u.pathname.length > 1) {
      u.pathname = u.pathname.replace(/\/+$/, "/");
    }
    return u;
  } catch {
    return null;
  }
}

export function sameRegistrableDomain(a: URL, b: URL): boolean {
  return a.hostname === b.hostname;
}

export function isProbablyHtml(url: URL, contentType: string | null): boolean {
  if (contentType?.includes("text/html")) return true;
  const path = url.pathname.toLowerCase();
  if (path.endsWith(".html") || path.endsWith(".htm") || path.endsWith("/") || !path.includes(".")) {
    return !contentType || contentType.includes("text");
  }
  return false;
}
