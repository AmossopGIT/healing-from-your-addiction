import type { ArtGalleryItem } from "@/content/artGallery";
import { artGalleryById } from "@/content/artGallery";
import type { BlogPost } from "@/content/blog";
import type { CaseStudy } from "@/content/caseStudies";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

export function cmsBlogHeroArtId(slug: string) {
  return `blog-${slug}`;
}

export function cmsCaseStudyHeroArtId(slug: string) {
  return `case-study-${slug}`;
}

export function cmsBlogPostToBlogPost(row: CmsBlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    excerpt: row.excerpt,
    h1: row.h1,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: row.secondary_keywords,
    categorySlug: row.category_slug,
    tagSlugs: row.tag_slugs,
    heroArtId: row.hero_art_id,
    publishedAt: row.published_at ? row.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    updatedAt: row.updated_at.slice(0, 10),
    sections: row.sections,
  };
}

export function cmsCaseStudyToCaseStudy(row: CmsCaseStudyRow): CaseStudy {
  return {
    slug: row.slug,
    legacySlug: row.legacy_slug,
    archivePageId: row.archive_page_id ?? row.slug,
    title: row.title,
    description: row.description,
    excerpt: row.excerpt,
    h1: row.h1,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: row.secondary_keywords,
    caseStudyType: row.case_study_type,
    addictionSlug: row.addiction_slug,
    tagSlugs: row.tag_slugs,
    heroArtId: row.hero_art_id,
    publishedAt: row.published_at ? row.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    sections: row.sections,
  };
}

export function cmsRowToArtItem(row: Pick<CmsBlogPostRow, "hero_art_id" | "hero_art_src" | "hero_art_alt" | "hero_art_prompt" | "hero_art_palette" | "title" | "slug">, category: string): ArtGalleryItem {
  return {
    id: row.hero_art_id,
    title: row.title,
    category,
    src: row.hero_art_src,
    alt: row.hero_art_alt,
    prompt: row.hero_art_prompt ?? "",
    palette: row.hero_art_palette.length ? row.hero_art_palette : ["#f7f3ea", "#17231f", "#0a3f39"],
    usage: `CMS hero art for ${row.slug}`,
  };
}

export function resolveContentArt(
  heroArtId: string,
  cmsRow?: Pick<CmsBlogPostRow, "hero_art_id" | "hero_art_src" | "hero_art_alt" | "hero_art_prompt" | "hero_art_palette" | "title" | "slug"> | null,
  category = "cms",
): ArtGalleryItem | undefined {
  const staticArt = artGalleryById.get(heroArtId);
  if (staticArt) return staticArt;
  if (cmsRow && cmsRow.hero_art_src) {
    return cmsRowToArtItem(cmsRow, category);
  }
  return undefined;
}
