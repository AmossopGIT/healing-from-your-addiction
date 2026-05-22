/**
 * Copies generated case study PNGs from Cursor assets folder into public/art/watercolor.
 * Run after GenerateImage batch: node tools/site-archiver/scripts/sync-case-study-art-from-assets.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const jobs = JSON.parse(fs.readFileSync(path.join(__dirname, "../case-study-art-jobs.json"), "utf8"));
const OUT_DIR = path.join(ROOT, "public/art/watercolor");

const assetDirs = [
  path.join(ROOT, "assets"),
  path.resolve(ROOT, "../.cursor/projects/c-Projects-Healing-from-Your-Addiction/assets"),
  path.join(process.env.USERPROFILE || "", ".cursor/projects/c-Projects-Healing-from-Your-Addiction/assets"),
];

function findAsset(filename) {
  for (const dir of assetDirs) {
    const p = path.join(dir, filename);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

fs.mkdirSync(OUT_DIR, { recursive: true });
let copied = 0;
const missing = [];

for (const job of jobs) {
  const src = findAsset(job.filename);
  const dest = path.join(OUT_DIR, job.filename);
  if (!src) {
    missing.push(job.filename);
    continue;
  }
  fs.copyFileSync(src, dest);
  copied++;
}

console.log(`Copied ${copied}/${jobs.length} images to public/art/watercolor/`);
if (missing.length) {
  console.log("Missing:", missing.join("\n"));
  process.exit(1);
}
