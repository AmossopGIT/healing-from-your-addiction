#!/usr/bin/env node
/**
 * Scan static blog posts for internal markdown links and validate paths.
 * Usage: node tools/cms/validate-internal-links.mjs
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const contentDir = join(root, "content");

const LINK_PATTERN = /\[([^\]]+)\]\((\/[^)]+)\)/g;

function loadKnownPaths() {
  const paths = new Set(["/"]);

  const seoFile = readFileSync(join(contentDir, "seo.ts"), "utf8");
  for (const match of seoFile.matchAll(/path:\s*"(\/[^"]+)"/g)) {
    paths.add(match[1]);
  }

  const blogFiles = readdirSync(contentDir).filter((name) => name.startsWith("blog") && name.endsWith(".ts"));
  for (const file of blogFiles) {
    const text = readFileSync(join(contentDir, file), "utf8");
    for (const match of text.matchAll(/"slug":\s*"([^"]+)"/g)) {
      paths.add(`/blog/${match[1]}/`);
    }
    for (const match of text.matchAll(/slug:\s*"([^"]+)"/g)) {
      if (file.includes("blog")) paths.add(`/blog/${match[1]}/`);
    }
  }

  return paths;
}

function extractPostsFromFile(filePath) {
  const text = readFileSync(filePath, "utf8");
  const posts = [];
  const slugMatches = [...text.matchAll(/"slug":\s*"([^"]+)"/g)];
  for (const slugMatch of slugMatches) {
    const slug = slugMatch[1];
    const slugIndex = slugMatch.index ?? 0;
    const slice = text.slice(slugIndex, slugIndex + 8000);
    posts.push({ slug, body: slice });
  }
  return posts;
}

function main() {
  const knownPaths = loadKnownPaths();
  const blogFiles = readdirSync(contentDir).filter((name) => name.startsWith("blog") && name.endsWith(".ts"));
  let broken = 0;
  let missingLinks = 0;

  console.log("Internal link validation report\n");

  for (const file of blogFiles) {
    const posts = extractPostsFromFile(join(contentDir, file));
    for (const post of posts) {
      const links = [...post.body.matchAll(LINK_PATTERN)].map((m) => ({ text: m[1], href: m[2] }));
      if (links.length < 2) {
        missingLinks += 1;
        console.log(`WARN  ${post.slug}: only ${links.length} internal link(s)`);
      }
      for (const link of links) {
        const basePath = link.href.split("?")[0].replace(/\/?$/, "/");
        if (!knownPaths.has(basePath) && !knownPaths.has(link.href)) {
          broken += 1;
          console.log(`FAIL  ${post.slug}: broken link ${link.href} (${link.text})`);
        }
      }
    }
  }

  console.log(`\nDone. ${broken} broken link(s), ${missingLinks} post(s) with fewer than 2 internal links.`);
  process.exit(broken > 0 ? 1 : 0);
}

main();
