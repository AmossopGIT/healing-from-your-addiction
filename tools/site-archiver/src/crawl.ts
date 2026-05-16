import { setTimeout as delay } from "node:timers/promises";
import { normalizeUrl, sameRegistrableDomain, isProbablyHtml } from "./urlUtils.js";
import { extractContext, extractLinks } from "./extract.js";
import { collectUrlsFromSitemap } from "./sitemapSeed.js";
import {
  ensureArchiveRoot,
  writePageRecord,
  writeGraph,
  writeManifest,
  writeContextIndex,
  urlToId,
  type GraphNode,
  type CrawlManifest,
} from "./archiveWriter.js";

export type CrawlOptions = {
  startUrl: string;
  outDir: string;
  maxPages: number;
  delayMs: number;
  saveHtml: boolean;
  userAgent: string;
  requestTimeoutMs: number;
  /** Optional sitemap index or urlset; URLs merged into crawl queue (same host only). */
  sitemapUrl?: string;
};

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(t);
  }
}

export async function runCrawl(opts: CrawlOptions): Promise<CrawlManifest> {
  const startedAt = new Date().toISOString();
  const errors: CrawlManifest["errors"] = [];
  const start = new URL(opts.startUrl);
  const queue: string[] = [];
  const queued = new Set<string>();
  const visited = new Set<string>();
  const graphNodes: GraphNode[] = [];
  const contextIndex: Parameters<typeof writeContextIndex>[1] = [];

  function enqueue(raw: string): void {
    const u = normalizeUrl(raw, start);
    if (!u || !sameRegistrableDomain(u, start)) return;
    const href = u.href;
    if (queued.has(href)) return;
    queued.add(href);
    queue.push(href);
  }

  enqueue(start.href);

  let sitemapSeedManifest: CrawlManifest["sitemapSeed"] | undefined;
  if (opts.sitemapUrl) {
    const { pageUrls, errors: smErrors } = await collectUrlsFromSitemap(
      opts.sitemapUrl,
      start,
      opts.userAgent,
      opts.requestTimeoutMs
    );
    for (const u of pageUrls) enqueue(u);
    sitemapSeedManifest = {
      sitemapUrl: opts.sitemapUrl,
      urlsMerged: pageUrls.length,
      errors: smErrors,
    };
  }

  await ensureArchiveRoot(opts.outDir);

  while (queue.length > 0 && visited.size < opts.maxPages) {
    const raw = queue.shift()!;
    const current = normalizeUrl(raw, start);
    if (!current || !sameRegistrableDomain(current, start)) continue;
    const key = current.href;
    if (visited.has(key)) continue;
    visited.add(key);

    let res: Response;
    try {
      res = await fetchWithTimeout(
        key,
        {
          redirect: "follow",
          headers: {
            "User-Agent": opts.userAgent,
            Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
          },
        },
        opts.requestTimeoutMs
      );
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ url: key, message });
      graphNodes.push({
        url: key,
        id: urlToId(key),
        status: 0,
        contentType: null,
        title: "",
        linksTo: [],
      });
      await delay(opts.delayMs);
      continue;
    }

    const status = res.status;
    const contentType = res.headers.get("content-type");

    if (!isProbablyHtml(current, contentType)) {
      graphNodes.push({
        url: key,
        id: urlToId(key),
        status,
        contentType,
        title: "",
        linksTo: [],
      });
      await delay(opts.delayMs);
      continue;
    }

    let html: string;
    try {
      html = await res.text();
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push({ url: key, message });
      await delay(opts.delayMs);
      continue;
    }

    const context = extractContext(html, current);
    const allLinks = extractLinks(html, current);
    const internalTargets: string[] = [];

    for (const href of allLinks) {
      const u = normalizeUrl(href, current);
      if (!u || !sameRegistrableDomain(u, start)) continue;
      const h = u.href;
      internalTargets.push(h);
      if (!visited.has(h)) enqueue(h);
    }

    const { id } = await writePageRecord(
      opts.outDir,
      key,
      status,
      contentType,
      context,
      internalTargets,
      opts.saveHtml ? html : null
    );
    graphNodes.push({
      url: key,
      id,
      status,
      contentType,
      title: context.title,
      linksTo: [...new Set(internalTargets)],
    });
    contextIndex.push({
      url: key,
      title: context.title,
      excerpt: context.excerpt,
      headings: context.headings,
    });

    await delay(opts.delayMs);
  }

  await writeGraph(opts.outDir, graphNodes);
  await writeContextIndex(opts.outDir, contextIndex);

  const manifest: CrawlManifest = {
    startUrl: start.href,
    startedAt,
    finishedAt: new Date().toISOString(),
    maxPages: opts.maxPages,
    delayMs: opts.delayMs,
    pagesCrawled: contextIndex.length,
    errors,
    ...(sitemapSeedManifest ? { sitemapSeed: sitemapSeedManifest } : {}),
  };
  await writeManifest(opts.outDir, manifest);
  return manifest;
}
