import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/caseStudies";
import { artGalleryById } from "@/content/artGallery";

function buildBlogRow(post: (typeof blogPosts)[number]) {
  const art = artGalleryById.get(post.heroArtId);
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    excerpt: post.excerpt,
    h1: post.h1,
    meta_title: `${post.title} | Healing From Your Addiction`,
    meta_description: post.description,
    primary_keyword: post.primaryKeyword,
    secondary_keywords: post.secondaryKeywords,
    search_intent: "Read an educational addiction recovery article.",
    conversion_goal: "Move readers toward a relevant programme page or confidential enquiry.",
    canonical_path: `/blog/${post.slug}/`,
    noindex: false,
    og_image_alt: art?.alt ?? post.title,
    category_slug: post.categorySlug,
    tag_slugs: post.tagSlugs,
    sections: post.sections,
    hero_art_id: post.heroArtId,
    hero_art_src: art?.src ?? `/art/watercolor/art-watercolor-${post.heroArtId}.png`,
    hero_art_alt: art?.alt ?? post.title,
    hero_art_prompt: art?.prompt ?? "",
    hero_art_palette: art?.palette ? [...art.palette] : ["#f7f3ea", "#17231f", "#0a3f39"],
    workflow_status: "published",
    published_at: new Date(`${post.publishedAt}T08:00:00.000Z`).toISOString(),
  };
}

function buildCaseStudyRow(study: (typeof caseStudies)[number]) {
  const art = artGalleryById.get(study.heroArtId);
  return {
    slug: study.slug,
    legacy_slug: study.legacySlug,
    archive_page_id: study.archivePageId,
    title: study.title,
    description: study.description,
    excerpt: study.excerpt,
    h1: study.h1,
    meta_title: `${study.title} | Healing From Your Addiction`,
    meta_description: study.description,
    primary_keyword: study.primaryKeyword,
    secondary_keywords: study.secondaryKeywords,
    search_intent: "Read an educational addiction case study or programme resource.",
    conversion_goal: "Move readers toward a relevant programme page or confidential enquiry.",
    canonical_path: `/case-studies/${study.slug}/`,
    noindex: false,
    og_image_alt: art?.alt ?? study.title,
    case_study_type: study.caseStudyType,
    addiction_slug: study.addictionSlug,
    tag_slugs: study.tagSlugs,
    sections: study.sections,
    hero_art_id: study.heroArtId,
    hero_art_src: art?.src ?? `/art/watercolor/art-watercolor-${study.heroArtId}.png`,
    hero_art_alt: art?.alt ?? study.title,
    hero_art_prompt: art?.prompt ?? "",
    hero_art_palette: art?.palette ? [...art.palette] : ["#f7f3ea", "#17231f", "#0a3f39"],
    workflow_status: "published",
    published_at: new Date(`${study.publishedAt}T08:00:00.000Z`).toISOString(),
  };
}

const outDir = path.join(process.cwd(), "tmp");
mkdirSync(outDir, { recursive: true });
writeFileSync(
  path.join(outDir, "cms-backfill-payload.json"),
  JSON.stringify({
    blogs: blogPosts.map(buildBlogRow),
    caseStudies: caseStudies.map(buildCaseStudyRow),
  }),
);
console.log(`Exported ${blogPosts.length} blogs and ${caseStudies.length} case studies.`);
