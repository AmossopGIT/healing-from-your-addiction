import { blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/caseStudies";
import { artGalleryById } from "@/content/artGallery";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export type BackfillStaticContentOptions = {
  /** When true (default), only insert slugs not already in CMS. Preserves drafts and edits. */
  insertMissing?: boolean;
  actorId?: string | null;
};

export type BackfillStaticContentResult = {
  blogInserted: number;
  blogSkipped: number;
  blogUpdated: number;
  caseStudyInserted: number;
  caseStudySkipped: number;
  caseStudyUpdated: number;
};

export function buildBlogRow(post: (typeof blogPosts)[number], actorId: string | null) {
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
    workflow_status: "draft" as const,
    published_at: new Date(`${post.publishedAt}T08:00:00.000Z`).toISOString(),
    created_by: actorId,
    updated_by: actorId,
    approved_by: null,
  };
}

function buildCaseStudyRow(study: (typeof caseStudies)[number], actorId: string | null) {
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
    workflow_status: "draft" as const,
    published_at: new Date(`${study.publishedAt}T08:00:00.000Z`).toISOString(),
    created_by: actorId,
    updated_by: actorId,
    approved_by: null,
  };
}

export async function backfillStaticContent(
  options: BackfillStaticContentOptions = {},
): Promise<BackfillStaticContentResult> {
  if (!isSupabaseServiceConfigured()) {
    throw new Error("Supabase service role is not configured.");
  }

  const insertMissing = options.insertMissing ?? true;
  const actorId = options.actorId ?? null;
  const service = createServiceClient();

  const [{ data: existingBlogRows }, { data: existingCaseStudyRows }] = await Promise.all([
    service.from("cms_blog_posts").select("slug"),
    service.from("cms_case_studies").select("slug"),
  ]);

  const existingBlogSlugs = new Set((existingBlogRows ?? []).map((row) => row.slug));
  const existingCaseStudySlugs = new Set((existingCaseStudyRows ?? []).map((row) => row.slug));

  const result: BackfillStaticContentResult = {
    blogInserted: 0,
    blogSkipped: 0,
    blogUpdated: 0,
    caseStudyInserted: 0,
    caseStudySkipped: 0,
    caseStudyUpdated: 0,
  };

  for (const post of blogPosts) {
    if (insertMissing && existingBlogSlugs.has(post.slug)) {
      result.blogSkipped += 1;
      continue;
    }

    const row = buildBlogRow(post, actorId);
    const { error } = insertMissing
      ? await service.from("cms_blog_posts").insert(row)
      : await service.from("cms_blog_posts").upsert(row, { onConflict: "slug" });

    if (error) {
      throw new Error(`Blog backfill failed for ${post.slug}: ${error.message}`);
    }

    if (insertMissing) {
      result.blogInserted += 1;
      existingBlogSlugs.add(post.slug);
    } else {
      result.blogUpdated += 1;
    }
  }

  for (const study of caseStudies) {
    if (insertMissing && existingCaseStudySlugs.has(study.slug)) {
      result.caseStudySkipped += 1;
      continue;
    }

    const row = buildCaseStudyRow(study, actorId);
    const { error } = insertMissing
      ? await service.from("cms_case_studies").insert(row)
      : await service.from("cms_case_studies").upsert(row, { onConflict: "slug" });

    if (error) {
      throw new Error(`Case study backfill failed for ${study.slug}: ${error.message}`);
    }

    if (insertMissing) {
      result.caseStudyInserted += 1;
      existingCaseStudySlugs.add(study.slug);
    } else {
      result.caseStudyUpdated += 1;
    }
  }

  return result;
}
