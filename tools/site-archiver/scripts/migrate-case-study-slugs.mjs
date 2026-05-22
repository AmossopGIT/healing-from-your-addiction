/**
 * Maps old cs-* slugs to new SEO slugs: renames art files and writes redirect snippets.
 * Run: node tools/site-archiver/scripts/migrate-case-study-slugs.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { caseStudySeoById } from "./case-study-seo-metadata.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const ART_DIR = path.join(ROOT, "public/art/watercolor");
const SLUGS_PATH = path.join(__dirname, "../case-study-slugs.json");

const slugEntries = JSON.parse(fs.readFileSync(SLUGS_PATH, "utf8"));
const mappings = [];

for (const { id, slug: legacySlug } of slugEntries) {
  const seo = caseStudySeoById[id];
  if (!seo) continue;
  const oldSlug = `cs-${legacySlug.match(/^case-study-(\d+)/)?.[1] ?? "x"}-${seo.slug.split("-")[0]}`;
  // Build old slug from previous convention by reading chunk if exists - use explicit map file
}

// Read old slugs from a snapshot file generated before migration
const OLD_NEW_PATH = path.join(__dirname, "../case-study-slug-migration.json");
if (!fs.existsSync(OLD_NEW_PATH)) {
  // Build from case-study-pages if still has old format, else from chunk files
  const oldFromChunks = [];
  for (const n of [1, 2, 3]) {
    const text = fs.readFileSync(path.join(ROOT, `content/caseStudyArchiveChunk${n}.ts`), "utf8");
    const re = /"slug": "([^"]+)"[\s\S]*?"legacySlug": "([^"]+)"[\s\S]*?"archivePageId": "([^"]+)"/g;
    let m;
    while ((m = re.exec(text))) {
      oldFromChunks.push({ oldSlug: m[1], legacySlug: m[2], id: m[3] });
    }
  }
  const migration = oldFromChunks.map((row) => ({
    ...row,
    newSlug: caseStudySeoById[row.id]?.slug,
    seoTitle: caseStudySeoById[row.id]?.title,
  }));
  fs.writeFileSync(OLD_NEW_PATH, JSON.stringify(migration, null, 2));
}

const migration = JSON.parse(fs.readFileSync(OLD_NEW_PATH, "utf8"));
let renamed = 0;
const redirects = [];
const csRedirects = [];

for (const row of migration) {
  if (!row.newSlug || row.oldSlug === row.newSlug) continue;
  const oldArt = path.join(ART_DIR, `art-watercolor-case-study-${row.oldSlug}.png`);
  const newArt = path.join(ART_DIR, `art-watercolor-case-study-${row.newSlug}.png`);
  if (fs.existsSync(oldArt)) {
    if (!fs.existsSync(newArt)) fs.renameSync(oldArt, newArt);
    renamed++;
  }
  redirects.push(
    `      { source: "/${row.legacySlug}/", destination: "/case-studies/${row.newSlug}/", permanent: true },`,
  );
  csRedirects.push(
    `      { source: "/case-studies/${row.oldSlug}/", destination: "/case-studies/${row.newSlug}/", permanent: true },`,
  );
}

fs.writeFileSync(path.join(__dirname, "../case-study-redirects.snippet.txt"), redirects.join("\n"));
fs.writeFileSync(path.join(__dirname, "../case-study-cs-redirects.snippet.txt"), csRedirects.join("\n"));
console.log(`Renamed ${renamed} art files. ${redirects.length} legacy + ${csRedirects.length} cs-* redirects.`);
