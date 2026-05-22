/**
 * Seeds placeholder PNG files for case study hero art (replace with watercolor exports later).
 * Run: node tools/site-archiver/scripts/seed-case-study-art-png.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const OUT_DIR = path.join(ROOT, "public/art/watercolor");

const PLACEHOLDER_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+X2ZkAAAAASUVORK5CYII=",
  "base64",
);

let count = 0;
fs.mkdirSync(OUT_DIR, { recursive: true });

for (const n of [1, 2, 3]) {
  const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
  const ids = [...text.matchAll(/"heroArtId": "(case-study-[^"]+)"/g)].map((m) => m[1]);
  for (const id of ids) {
    const dest = path.join(OUT_DIR, `art-watercolor-${id}.png`);
    if (!fs.existsSync(dest)) {
      fs.writeFileSync(dest, PLACEHOLDER_PNG);
      count++;
    }
  }
}

console.log(`Seeded ${count} case study PNG placeholders`);
