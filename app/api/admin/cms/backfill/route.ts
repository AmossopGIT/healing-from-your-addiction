import { NextResponse } from "next/server";
import { blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/caseStudies";
import { artGalleryById } from "@/content/artGallery";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isSupabaseServiceConfigured()) {
    return NextResponse.json({ error: "Supabase service role is not configured." }, { status: 503 });
  }

  const service = createServiceClient();
  let blogCount = 0;
  let caseStudyCount = 0;

  for (const post of blogPosts) {
    const art = artGalleryById.get(post.heroArtId);
    const row = {
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
      workflow_status: "published" as const,
      published_at: new Date(`${post.publishedAt}T08:00:00.000Z`).toISOString(),
      created_by: user.id,
      updated_by: user.id,
      approved_by: user.id,
    };

    const { error } = await service.from("cms_blog_posts").upsert(row, { onConflict: "slug" });
    if (error) {
      return NextResponse.json({ error: `Blog backfill failed for ${post.slug}: ${error.message}` }, { status: 500 });
    }
    blogCount += 1;
  }

  for (const study of caseStudies) {
    const art = artGalleryById.get(study.heroArtId);
    const row = {
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
      workflow_status: "published" as const,
      published_at: new Date(`${study.publishedAt}T08:00:00.000Z`).toISOString(),
      created_by: user.id,
      updated_by: user.id,
      approved_by: user.id,
    };

    const { error } = await service.from("cms_case_studies").upsert(row, { onConflict: "slug" });
    if (error) {
      return NextResponse.json({ error: `Case study backfill failed for ${study.slug}: ${error.message}` }, { status: 500 });
    }
    caseStudyCount += 1;
  }

  return NextResponse.json({
    message: `Backfilled ${blogCount} blog posts and ${caseStudyCount} case studies.`,
    blogCount,
    caseStudyCount,
  });
}
