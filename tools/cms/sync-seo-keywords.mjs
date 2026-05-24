#!/usr/bin/env node
/**
 * Sync published CMS SEO rows into docs/SEO_KEYWORDS.md
 * Usage: node tools/cms/sync-seo-keywords.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const seoDocPath = path.join(root, "docs", "SEO_KEYWORDS.md");

function blogPath(slug) {
  return `/blog/${slug}/`;
}

function caseStudyPath(slug) {
  return `/case-studies/${slug}/`;
}

function rowForBlog(post) {
  return `| ${post.title} | ${blogPath(post.slug)} | ${post.primary_keyword} | ${post.secondary_keywords.join(", ")} | ${post.search_intent ?? "Read an educational addiction recovery article."} | ${post.conversion_goal ?? "Move readers toward a relevant programme page or confidential enquiry."} |`;
}

function rowForCaseStudy(study) {
  return `| ${study.title} | ${caseStudyPath(study.slug)} | ${study.primary_keyword} | ${study.secondary_keywords.join(", ")} | ${study.search_intent ?? "Read an educational addiction case study or programme resource."} | ${study.conversion_goal ?? "Move readers toward a relevant programme page or confidential enquiry."} |`;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(url, key);
  const [{ data: blogPosts }, { data: caseStudies }] = await Promise.all([
    supabase.from("cms_blog_posts").select("*").in("workflow_status", ["published", "scheduled"]),
    supabase.from("cms_case_studies").select("*").in("workflow_status", ["published", "scheduled"]),
  ]);

  const blogSection = [
    "### CMS blog posts",
    "",
    "| Page | Canonical URL | Primary keyword | Secondary keywords | Intent | Conversion goal |",
    "| --- | --- | --- | --- | --- | --- |",
    ...(blogPosts ?? []).map(rowForBlog),
  ].join("\n");

  const caseStudySection = [
    "### CMS case studies",
    "",
    "| Page | Canonical URL | Primary keyword | Secondary keywords | Intent | Conversion goal |",
    "| --- | --- | --- | --- | --- | --- |",
    ...(caseStudies ?? []).map(rowForCaseStudy),
  ].join("\n");

  const doc = await readFile(seoDocPath, "utf8");
  const markerStart = "<!-- cms-seo-sync:start -->";
  const markerEnd = "<!-- cms-seo-sync:end -->";
  const block = `${markerStart}\n${blogSection}\n\n${caseStudySection}\n${markerEnd}`;

  const nextDoc = doc.includes(markerStart)
    ? doc.replace(new RegExp(`${markerStart}[\\s\\S]*?${markerEnd}`), block)
    : `${doc.trim()}\n\n${block}\n`;

  await writeFile(seoDocPath, nextDoc, "utf8");
  console.log(`Updated SEO tracker with ${blogPosts?.length ?? 0} blog rows and ${caseStudies?.length ?? 0} case study rows.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
