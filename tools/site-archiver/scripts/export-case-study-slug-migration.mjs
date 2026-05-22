import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { caseStudySeoById } from "./case-study-seo-metadata.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const rows = [];

for (const n of [1, 2, 3]) {
  const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
  const blocks = text.split(/\n  \},\n/);
  for (const block of blocks) {
    const oldSlug = block.match(/"slug": "([^"]+)"/)?.[1];
    const legacySlug = block.match(/"legacySlug": "([^"]+)"/)?.[1];
    const id = block.match(/"archivePageId": "([^"]+)"/)?.[1];
    if (!oldSlug || !id) continue;
    const seo = caseStudySeoById[id];
    rows.push({
      id,
      legacySlug,
      oldSlug,
      newSlug: seo?.slug ?? oldSlug,
      seoTitle: seo?.title ?? "",
    });
  }
}

fs.writeFileSync(path.join(__dirname, "../case-study-slug-migration.json"), JSON.stringify(rows, null, 2));
console.log(`Exported ${rows.length} slug mappings`);
