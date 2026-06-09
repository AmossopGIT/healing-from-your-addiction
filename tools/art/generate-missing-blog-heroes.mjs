#!/usr/bin/env node
/**
 * List blog posts whose hero PNG is missing under public/art/watercolor/.
 * Usage: node tools/art/generate-missing-blog-heroes.mjs
 */

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
const artDir = join(root, "public/art/watercolor");
const contentDir = join(root, "content");

function collectHeroIds() {
  const items = [];
  const files = readdirSync(contentDir).filter((name) => name.startsWith("blog") && name.endsWith(".ts"));

  for (const file of files) {
    const text = readFileSync(join(contentDir, file), "utf8");
    const slugMatches = [
      ...text.matchAll(/slug:\s*"([^"]+)"/g),
      ...text.matchAll(/"slug":\s*"([^"]+)"/g),
    ];
    for (const slugMatch of slugMatches) {
      const slug = slugMatch[1];
      const slice = text.slice(slugMatch.index ?? 0, (slugMatch.index ?? 0) + 1200);
      const heroMatch = slice.match(/heroArtId:\s*"([^"]+)"/) ?? slice.match(/"heroArtId":\s*"([^"]+)"/);
      if (heroMatch) {
        items.push({ slug, heroArtId: heroMatch[1] });
      }
    }
  }

  return items;
}

const posts = collectHeroIds();
const missing = [];
let present = 0;

for (const post of posts) {
  const filename = `art-watercolor-${post.heroArtId}.png`;
  if (existsSync(join(artDir, filename))) {
    present += 1;
  } else {
    missing.push({ ...post, filename });
  }
}

console.log(`Blog hero artwork: ${present} present, ${missing.length} missing\n`);

if (missing.length) {
  console.log("Missing files:");
  for (const item of missing) {
    console.log(`  ${item.filename}  (${item.slug})`);
  }
  process.exit(1);
}

console.log("All blog hero PNGs are present.");
process.exit(0);
