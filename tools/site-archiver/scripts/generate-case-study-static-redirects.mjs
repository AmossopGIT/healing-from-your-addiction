/**
 * Writes static HTML redirect pages into public/ for legacy and interim cs-* URLs.
 * Required for GitHub Pages static export (next.config redirects do not run there).
 *
 * Run: node tools/site-archiver/scripts/generate-case-study-static-redirects.mjs
 * Also runs automatically via npm prebuild (before next build copies public/).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const PUBLIC = path.join(ROOT, "public");
const MIGRATION = path.join(__dirname, "../case-study-slug-migration.json");

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://healingfromyouraddiction.co.za";
const basePath = (
  process.env.NEXT_PUBLIC_BASE_PATH ||
  (process.env.GITHUB_PAGES === "true" ? "/healing-from-your-addiction" : "")
).replace(/\/$/, "");

function destinationPath(newSlug) {
  const pathPart = `/case-studies/${newSlug}/`;
  return basePath ? `${basePath}${pathPart}` : pathPart;
}

function absoluteDestination(newSlug) {
  return `${siteUrl}${destinationPath(newSlug)}`;
}

function redirectHtml(newSlug) {
  const destPath = destinationPath(newSlug);
  const destAbs = absoluteDestination(newSlug);
  return `<!DOCTYPE html>
<html lang="en-ZA">
  <head>
    <meta charset="utf-8" />
    <title>Redirecting…</title>
    <meta http-equiv="refresh" content="0;url=${destAbs}" />
    <link rel="canonical" href="${destAbs}" />
    <meta name="robots" content="noindex, follow" />
    <script>location.replace(${JSON.stringify(destAbs)});</script>
  </head>
  <body>
    <p>This page has moved. <a href="${destPath}">Continue to the updated case study</a>.</p>
  </body>
</html>
`;
}

function writeRedirect(relativeDir, newSlug) {
  const dir = path.join(PUBLIC, relativeDir);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), redirectHtml(newSlug), "utf8");
}

const migration = JSON.parse(fs.readFileSync(MIGRATION, "utf8"));
let legacyCount = 0;
let csCount = 0;

for (const row of migration) {
  if (!row.newSlug) continue;
  writeRedirect(row.legacySlug, row.newSlug);
  legacyCount++;
  writeRedirect(path.join("case-studies", row.oldSlug), row.newSlug);
  csCount++;
}

const manifest = {
  generatedAt: new Date().toISOString(),
  siteUrl,
  basePath: basePath || null,
  legacyRedirects: legacyCount,
  interimCsRedirects: csCount,
  total: legacyCount + csCount,
};

fs.writeFileSync(
  path.join(PUBLIC, "case-study-redirect-manifest.json"),
  JSON.stringify(manifest, null, 2),
);

console.log(
  `Wrote ${legacyCount} legacy + ${csCount} cs-* static redirects under public/ (${manifest.total} total)`,
);
