import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "../../..");
const archiveDir = path.join(
  root,
  "tools/site-archiver/archives/healingfromyouraddiction-co-za/pages",
);

const seo = fs.readFileSync(path.join(root, "content/seo.ts"), "utf8");
const seoPaths = new Set([...seo.matchAll(/path: "([^"]+)"/g)].map((m) => m[1]));

const archiveSitePages = [];
for (const f of fs.readdirSync(archiveDir)) {
  if (!f.endsWith(".json")) continue;
  const j = JSON.parse(fs.readFileSync(path.join(archiveDir, f), "utf8"));
  const slug = (j.url || "")
    .replace("https://healingfromyouraddiction.co.za/", "")
    .replace(/\/$/, "");
  if (!slug || slug.includes("/")) continue;
  const title = j.title || j.h1 || slug;
  archiveSitePages.push({ slug, title });
}

const wpSiteSlugs = new Set([
  "hello-world",
  "keywords",
  "privacy-policy",
  "terms-and-conditions-of-use",
  "about-the-therapist",
  "other-books-written-by-gerald-crawford",
  "addictions",
  "faqs",
  "testimonies",
  "contact",
  "sitemap",
  "feed",
  "comments",
]);

const slugToLivePath = {
  "about-the-therapist": "/about-the-therapist/",
  addictions: "/addictions/",
  contact: "/contact/",
  faqs: "/faqs/",
  "privacy-policy": "/privacy-policy/",
  "terms-and-conditions-of-use": "/terms-and-conditions-of-use/",
  "testimonies": "/testimonies/",
  "other-books-written-by-gerald-crawford": "/other-books-written-by-gerald-crawford/",
};

const sitePages = archiveSitePages.filter((p) => wpSiteSlugs.has(p.slug));

const have = [];
const missing = [];
const renamed = [];

for (const p of sitePages.sort((a, b) => a.slug.localeCompare(b.slug))) {
  const live = slugToLivePath[p.slug];
  if (live && seoPaths.has(live)) {
    renamed.push({ wp: p.slug, live, title: p.title });
    have.push(p.slug);
  } else if (seoPaths.has(`/${p.slug}/`)) {
    have.push(p.slug);
  } else {
    missing.push({ slug: p.slug, title: p.title });
  }
}

const liveCorePages = [...seoPaths].filter(
  (p) =>
    !p.startsWith("/blog/") &&
    !p.startsWith("/case-studies/") &&
    !p.includes("/addictions/") &&
    p !== "/",
);

console.log(
  JSON.stringify(
    {
      wordpressCorePagesInArchive: sitePages.length,
      haveOnNewSite: have,
      renamedOrReplaced: renamed,
      notBuiltYet: missing,
      allSeoCorePaths: liveCorePages.sort(),
    },
    null,
    2,
  ),
);
