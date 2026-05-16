const LOC_RE = /<loc>\s*([^<\s]+)\s*<\/loc>/gi;

export function extractLocs(xml: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  LOC_RE.lastIndex = 0;
  while ((m = LOC_RE.exec(xml)) !== null) {
    const u = m[1]?.trim();
    if (u) out.push(u);
  }
  return out;
}

function isSitemapIndex(xml: string): boolean {
  return /<sitemapindex[\s>]/i.test(xml);
}

function isUrlSet(xml: string): boolean {
  return /<urlset[\s>]/i.test(xml);
}

async function fetchText(
  url: string,
  userAgent: string,
  timeoutMs: number
): Promise<{ status: number; contentType: string | null; text: string }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: ctrl.signal,
      headers: {
        "User-Agent": userAgent,
        Accept: "application/xml,text/xml;q=0.9,*/*;q=0.8",
      },
    });
    const text = await res.text();
    return { status: res.status, contentType: res.headers.get("content-type"), text };
  } finally {
    clearTimeout(t);
  }
}

export type SitemapSeedResult = {
  pageUrls: string[];
  errors: { url: string; message: string }[];
};

/**
 * Fetch a sitemap index or urlset and return same-host page URLs (http/https only).
 * Recurses into child sitemap XML files when the document is a sitemap index.
 */
export async function collectUrlsFromSitemap(
  sitemapUrl: string,
  siteOrigin: URL,
  userAgent: string,
  requestTimeoutMs: number,
  maxSitemapDocs = 80
): Promise<SitemapSeedResult> {
  const errors: SitemapSeedResult["errors"] = [];
  const pageUrls: string[] = [];
  const seenPages = new Set<string>();
  const seenDocs = new Set<string>();

  async function visit(docUrl: string): Promise<void> {
    if (seenDocs.size >= maxSitemapDocs) return;
    if (seenDocs.has(docUrl)) return;
    seenDocs.add(docUrl);

    let body: string;
    let status: number;
    try {
      const r = await fetchText(docUrl, userAgent, requestTimeoutMs);
      status = r.status;
      body = r.text;
      if (status < 200 || status >= 300) {
        errors.push({ url: docUrl, message: `HTTP ${status}` });
        return;
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ url: docUrl, message });
      return;
    }

    if (isSitemapIndex(body)) {
      const locs = extractLocs(body);
      for (const loc of locs) {
        let child: URL;
        try {
          child = new URL(loc);
        } catch {
          continue;
        }
        if (child.hostname !== siteOrigin.hostname) continue;
        if (seenDocs.size >= maxSitemapDocs) return;
        await visit(child.href);
      }
      return;
    }

    if (isUrlSet(body)) {
      for (const loc of extractLocs(body)) {
        let u: URL;
        try {
          u = new URL(loc);
        } catch {
          continue;
        }
        if (u.hostname !== siteOrigin.hostname) continue;
        if (u.protocol !== "http:" && u.protocol !== "https:") continue;
        const href = u.href;
        if (!seenPages.has(href)) {
          seenPages.add(href);
          pageUrls.push(href);
        }
      }
      return;
    }

    errors.push({ url: docUrl, message: "Not a recognized sitemap (index/urlset)" });
  }

  await visit(sitemapUrl);
  return { pageUrls, errors };
}
