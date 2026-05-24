import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "../../..");
const archiveDir = path.join(
  root,
  "tools/site-archiver/archives/healingfromyouraddiction-co-za/pages",
);

const blogTs = fs.readFileSync(path.join(root, "content/blog.ts"), "utf8");
const chunk2 = fs.readFileSync(path.join(root, "content/blogArchiveChunk2.ts"), "utf8");
const chunk3 = fs.readFileSync(path.join(root, "content/blogArchiveChunk3.ts"), "utf8");
const seo = fs.readFileSync(path.join(root, "content/seo.ts"), "utf8");
const programmes = fs.readFileSync(path.join(root, "content/programmes.ts"), "utf8");

const builtPosts = new Set();
for (const text of [chunk2, chunk3]) {
  const re = /"slug": "([^"]+)"/g;
  let m;
  while ((m = re.exec(text))) builtPosts.add(m[1]);
}
const initMatch = blogTs.match(/const blogPostsInitial[\s\S]*?\];/);
if (initMatch) {
  const re = /slug: "([^"]+)"/g;
  let m;
  while ((m = re.exec(initMatch[0]))) builtPosts.add(m[1]);
}

const seoPaths = new Set([...seo.matchAll(/path: "([^"]+)"/g)].map((m) => m[1]));
const programmeSlugs = new Set(
  [...programmes.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]),
);

const builtSiteSlugs = new Set([
  "privacy-policy",
  "terms-and-conditions-of-use",
  "about-the-therapist",
  "other-books-written-by-gerald-crawford",
  "addictions",
  "faqs",
  "testimonies",
  "contact",
]);

const skip = new Set([
  "hello-world",
  "keywords",
  ...builtSiteSlugs,
  "sitemap",
  "feed",
  "comments",
]);

const healingPrograms = [];
const caseStudies = [];
const educational = [];
const builtAsBlog = [];
const builtAsSite = [];
let archiveSingles = 0;

for (const f of fs.readdirSync(archiveDir)) {
  if (!f.endsWith(".json")) continue;
  const j = JSON.parse(fs.readFileSync(path.join(archiveDir, f), "utf8"));
  const slug = (j.url || "")
    .replace("https://healingfromyouraddiction.co.za/", "")
    .replace(/\/$/, "");
  if (!slug || slug.includes("/")) continue;
  archiveSingles++;

  if (skip.has(slug)) continue;
  if (builtPosts.has(slug)) {
    builtAsBlog.push(slug);
    continue;
  }
  if (seoPaths.has(`/blog/${slug}/`) || seoPaths.has(`/${slug}/`)) {
    builtAsSite.push(slug);
    continue;
  }
  for (const pSlug of programmeSlugs) {
    if (slug.includes(pSlug) || slug.includes(pSlug.replace(/-/g, ""))) {
      builtAsSite.push(slug);
      continue;
    }
  }

  if (slug.startsWith("case-study")) {
    caseStudies.push(slug);
    continue;
  }
  if (slug.includes("healing-program")) {
    healingPrograms.push(slug);
    continue;
  }
  educational.push(slug);
}

console.log(
  JSON.stringify(
    {
      builtBlogPosts: builtPosts.size,
      archiveSinglePostUrls: archiveSingles,
      remainingHealingProgramPages: healingPrograms.length,
      healingProgramSlugs: healingPrograms.sort(),
      remainingCaseStudies: caseStudies.length,
      remainingEducationalArticles: educational.length,
      educationalSample: educational.slice(0, 15).sort(),
      totalRemainingArchiveContent: healingPrograms.length + caseStudies.length + educational.length,
      seoPageCount: seoPaths.size,
    },
    null,
    2,
  ),
);
