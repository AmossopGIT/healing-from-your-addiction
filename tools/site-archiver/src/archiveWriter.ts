import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { PageContext } from "./extract.js";

export function urlToId(url: string): string {
  return createHash("sha256").update(url).digest("hex").slice(0, 16);
}

export type GraphNode = {
  url: string;
  id: string;
  status: number;
  contentType: string | null;
  title: string;
  linksTo: string[];
};

export type CrawlManifest = {
  startUrl: string;
  startedAt: string;
  finishedAt: string;
  maxPages: number;
  delayMs: number;
  pagesCrawled: number;
  errors: { url: string; message: string }[];
  sitemapSeed?: {
    sitemapUrl: string;
    urlsMerged: number;
    errors: { url: string; message: string }[];
  };
};

export async function ensureArchiveRoot(outDir: string): Promise<void> {
  await mkdir(join(outDir, "pages"), { recursive: true });
}

export async function writePageRecord(
  outDir: string,
  url: string,
  status: number,
  contentType: string | null,
  context: PageContext,
  linksDiscovered: string[],
  html: string | null
): Promise<{ id: string }> {
  const id = urlToId(url);
  const base = join(outDir, "pages", id);
  const files: { html?: string } = {};
  if (html !== null) {
    await writeFile(`${base}.html`, html, "utf8");
    files.html = `pages/${id}.html`;
  }
  const record = {
    url,
    id,
    fetchedAt: new Date().toISOString(),
    status,
    contentType,
    ...context,
    linksDiscovered,
    files,
  };
  await writeFile(`${base}.json`, JSON.stringify(record, null, 2), "utf8");
  return { id };
}

export async function writeGraph(outDir: string, nodes: GraphNode[]): Promise<void> {
  const path = join(outDir, "graph.json");
  await writeFile(path, JSON.stringify({ nodeCount: nodes.length, nodes }, null, 2), "utf8");
}

export async function writeManifest(outDir: string, manifest: CrawlManifest): Promise<void> {
  await writeFile(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
}

export async function writeContextIndex(
  outDir: string,
  items: { url: string; title: string; excerpt: string; headings: { level: number; text: string }[] }[]
): Promise<void> {
  const lines: string[] = [
    "# Site archive — context index",
    "",
    "Plain-text rollup for quick reading and LLM context. Per-page JSON lives in `pages/*.json`.",
    "",
  ];
  for (const it of items) {
    lines.push(`## ${it.title || "(no title)"}`, "", `**URL:** ${it.url}`, "");
    if (it.headings.length) {
      const bullets = it.headings.map((h) => `- H${h.level}: ${h.text}`).join("\n");
      lines.push("### Headings", "", bullets, "");
    }
    lines.push(it.excerpt.slice(0, 2000), "", "---", "");
  }
  await writeFile(join(outDir, "CONTEXT.md"), lines.join("\n"), "utf8");
}
