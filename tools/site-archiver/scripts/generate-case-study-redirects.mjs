/**
 * Writes next.config redirect snippet for legacy case-study slugs.
 * Run: node tools/site-archiver/scripts/generate-case-study-redirects.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const studies = [];

for (const n of [1, 2, 3]) {
  const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
  const blocks = text.split(/\n  \},\n/);
  for (const block of blocks) {
    const legacy = block.match(/"legacySlug": "([^"]+)"/)?.[1];
    const slug = block.match(/"slug": "(cs-[^"]+)"/)?.[1];
    if (legacy && slug) studies.push({ legacySlug: legacy, slug });
  }
}

const lines = studies.map(
  (s) =>
    `      { source: "/${s.legacySlug}/", destination: "/case-studies/${s.slug}/", permanent: true },`,
);

fs.writeFileSync(path.join(__dirname, "../case-study-redirects.snippet.txt"), lines.join("\n"));
console.log(`Wrote ${studies.length} redirects`);
