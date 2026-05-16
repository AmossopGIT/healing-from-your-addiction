#!/usr/bin/env node
import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { Command } from "commander";
import { runCrawl } from "./crawl.js";

const program = new Command();

program
  .name("site-archiver")
  .description("Crawl a site (same host), save HTML + JSON context, graph, and CONTEXT.md for migration/LLM use.")
  .requiredOption("-u, --url <url>", "Starting URL (https://example.com/page)")
  .option("-o, --out <dir>", "Output directory", "./archives/site-snapshot")
  .option("-m, --max-pages <n>", "Max pages to fetch", "150")
  .option("-d, --delay-ms <n>", "Delay between requests (politeness)", "750")
  .option("--no-html", "Skip saving raw .html (JSON + graph + CONTEXT.md only)")
  .option("--timeout-ms <n>", "Per-request timeout", "45000")
  .option(
    "--user-agent <ua>",
    "User-Agent string",
    "SiteArchiver/1.0 (+https://github.com/local/tool; respectful crawl)"
  )
  .option(
    "--sitemap-url <url>",
    "Sitemap index or urlset (same host); URLs are merged into the crawl queue for fuller coverage"
  )
  .action(async (opts) => {
    const outDir = resolve(process.cwd(), opts.out);
    await mkdir(outDir, { recursive: true });
    const maxPages = Math.max(1, parseInt(String(opts.maxPages), 10) || 150);
    const delayMs = Math.max(0, parseInt(String(opts.delayMs), 10) || 750);
    const requestTimeoutMs = Math.max(1000, parseInt(String(opts.timeoutMs), 10) || 45000);
    const saveHtml = opts.html !== false;

    console.error(`Output: ${outDir}`);
    console.error(`Start:  ${opts.url}`);

    const manifest = await runCrawl({
      startUrl: opts.url,
      outDir,
      maxPages,
      delayMs,
      saveHtml,
      userAgent: opts.userAgent,
      requestTimeoutMs,
      sitemapUrl: opts.sitemapUrl as string | undefined,
    });

    console.error(`Done. Pages: ${manifest.pagesCrawled}, errors: ${manifest.errors.length}`);
    if (manifest.errors.length) {
      console.error(JSON.stringify(manifest.errors.slice(0, 10), null, 2));
    }
    console.log(JSON.stringify(manifest, null, 2));
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err);
  process.exit(1);
});
