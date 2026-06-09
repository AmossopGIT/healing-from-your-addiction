#!/usr/bin/env node
/**
 * Warn when seo.ts paths are missing from docs/SEO_KEYWORDS.md (and vice versa).
 * Usage: node tools/seo/sync-keywords-check.mjs
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const seoTs = readFileSync(join(root, "content/seo.ts"), "utf8");
const keywordsMd = readFileSync(join(root, "docs/SEO_KEYWORDS.md"), "utf8");

const seoPaths = new Set([...seoTs.matchAll(/path:\s*"(\/[^"]+)"/g)].map((m) => m[1]));
const mdPaths = new Set([...keywordsMd.matchAll(/\|\s*`(\/[^`]+)`\s*\|/g)].map((m) => m[1]));

const missingInMd = [...seoPaths].filter((p) => !mdPaths.has(p) && !p.includes("[slug]"));
const missingInSeo = [...mdPaths].filter((p) => !seoPaths.has(p));

console.log("SEO keyword sync check\n");

if (missingInMd.length) {
  console.log("In seo.ts but not SEO_KEYWORDS.md:");
  missingInMd.forEach((p) => console.log(`  ${p}`));
}

if (missingInSeo.length) {
  console.log("\nIn SEO_KEYWORDS.md but not seo.ts:");
  missingInSeo.forEach((p) => console.log(`  ${p}`));
}

if (!missingInMd.length && !missingInSeo.length) {
  console.log("All static paths appear aligned.");
}

process.exit(missingInMd.length || missingInSeo.length ? 1 : 0);
