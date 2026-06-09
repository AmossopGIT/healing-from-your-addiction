import type { BlogSection } from "@/content/blog";
import { siteConfig } from "@/lib/constants";

export const META_TITLE_MIN = 30;
export const META_TITLE_MAX = 65;
export const META_DESC_MIN = 120;
export const META_DESC_MAX = 160;
export const META_DESC_PUBLISH_MIN = 50;
export const HERO_ALT_MIN = 20;

export type SeoChecklistItem = {
  id: string;
  label: string;
  ok: boolean;
  severity: "pass" | "warn" | "error";
  hint?: string;
};

export type SeoChecklistInput = {
  title: string;
  description: string;
  metaDescription?: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  slug: string;
  categorySlug: string;
  tagSlugs: string[];
  sections: BlogSection[];
  heroArtAlt: string;
};

export function getBrandTitleSuffix(): string {
  return ` | ${siteConfig.name}`;
}

export function getFullBlogTitle(title: string): string {
  const trimmed = title.trim();
  if (!trimmed) return siteConfig.name;
  return trimmed.includes(siteConfig.name) ? trimmed : `${trimmed}${getBrandTitleSuffix()}`;
}

function includesKeyword(haystack: string, keyword: string): boolean {
  const normalizedKeyword = keyword.trim().toLowerCase();
  if (!normalizedKeyword) return false;
  return haystack.toLowerCase().includes(normalizedKeyword);
}

function firstParagraph(sections: BlogSection[]): string {
  for (const section of sections) {
    for (const paragraph of section.paragraphs ?? []) {
      const text = paragraph.trim();
      if (text) return text;
    }
  }
  return "";
}

import { countInternalLinks, allSectionText } from "@/lib/cms/internalLinks";

export function evaluateBlogSeoChecklist(input: SeoChecklistInput): SeoChecklistItem[] {
  const titleLen = input.title.trim().length;
  const fullTitleLen = getFullBlogTitle(input.title).length;
  const effectiveDescription = (input.metaDescription?.trim() || input.description.trim());
  const descLen = effectiveDescription.length;
  const keyword = input.primaryKeyword.trim();
  const bodyText = allSectionText(input.sections);
  const intro = firstParagraph(input.sections);
  const sectionCount = input.sections.filter((section) => section.h2.trim()).length;
  const heroAltLen = input.heroArtAlt.trim().length;

  const items: SeoChecklistItem[] = [
    {
      id: "title-length",
      label: `Title length (${titleLen} chars → ${fullTitleLen} with brand)`,
      ok: titleLen >= META_TITLE_MIN && titleLen <= META_TITLE_MAX,
      severity: titleLen >= META_TITLE_MIN && titleLen <= META_TITLE_MAX ? "pass" : "warn",
      hint: `Aim for ${META_TITLE_MIN}–${META_TITLE_MAX} characters in the title field.`,
    },
    {
      id: "meta-description",
      label: `Meta description (${descLen}/${META_DESC_MAX})`,
      ok: descLen >= META_DESC_MIN && descLen <= META_DESC_MAX,
      severity:
        descLen < META_DESC_PUBLISH_MIN || descLen > META_DESC_MAX
          ? "error"
          : descLen >= META_DESC_MIN && descLen <= META_DESC_MAX
            ? "pass"
            : "warn",
      hint: `Aim for ${META_DESC_MIN}–${META_DESC_MAX} characters.`,
    },
    {
      id: "primary-keyword",
      label: keyword ? `Primary keyword: ${keyword}` : "Primary keyword (required to publish)",
      ok: Boolean(keyword),
      severity: keyword ? "pass" : "error",
      hint: "Use the first SEO keyword as the primary focus phrase.",
    },
    {
      id: "keyword-in-title",
      label: "Primary keyword appears in title",
      ok: includesKeyword(input.title, keyword),
      severity: includesKeyword(input.title, keyword) ? "pass" : "warn",
      hint: "Include the primary keyword naturally in the article title.",
    },
    {
      id: "keyword-in-h1",
      label: "Primary keyword appears in H1",
      ok: includesKeyword(input.h1, keyword),
      severity: includesKeyword(input.h1, keyword) ? "pass" : "warn",
      hint: "The on-page H1 should reflect the primary keyword.",
    },
    {
      id: "keyword-in-description",
      label: "Primary keyword appears in meta description",
      ok: includesKeyword(effectiveDescription, keyword),
      severity: includesKeyword(effectiveDescription, keyword) ? "pass" : "warn",
      hint: "Work the primary keyword into the meta description.",
    },
    {
      id: "keyword-in-slug",
      label: "Primary keyword appears in URL slug",
      ok: includesKeyword(input.slug.replace(/-/g, " "), keyword),
      severity: includesKeyword(input.slug.replace(/-/g, " "), keyword) ? "pass" : "warn",
      hint: "Use keyword terms in the slug where natural.",
    },
    {
      id: "keyword-in-intro",
      label: "Primary keyword appears in opening paragraph",
      ok: includesKeyword(intro, keyword),
      severity: includesKeyword(intro, keyword) ? "pass" : "warn",
      hint: "Mention the primary topic early in the first paragraph.",
    },
    {
      id: "slug",
      label: input.slug.trim() ? `URL /blog/${input.slug.trim()}/` : "URL slug",
      ok: Boolean(input.slug.trim()),
      severity: input.slug.trim() ? "pass" : "error",
    },
    {
      id: "sections",
      label: `Structured sections (${sectionCount})`,
      ok: sectionCount >= 2,
      severity: sectionCount >= 2 ? "pass" : "warn",
      hint: "Use at least two ## headings in the body for scannable structure.",
    },
    {
      id: "internal-links",
      label: `Internal links in body (${countInternalLinks(input.sections)})`,
      ok: countInternalLinks(input.sections) >= 2,
      severity: countInternalLinks(input.sections) >= 2 ? "pass" : "warn",
      hint: "Add at least 2 links to programme or funnel pages. See docs/CONTENT_INTERNAL_LINKS.md.",
    },
    {
      id: "category",
      label: input.categorySlug ? `Category: ${input.categorySlug}` : "Category selected",
      ok: Boolean(input.categorySlug),
      severity: input.categorySlug ? "pass" : "error",
    },
    {
      id: "tags",
      label: input.tagSlugs.length ? `Tags (${input.tagSlugs.length})` : "At least one tag",
      ok: input.tagSlugs.length > 0,
      severity: input.tagSlugs.length > 0 ? "pass" : "warn",
      hint: "Add comma-separated tag slugs for related topics.",
    },
    {
      id: "hero-alt",
      label: `Hero image alt text (${heroAltLen} chars)`,
      ok: heroAltLen >= HERO_ALT_MIN,
      severity: heroAltLen >= HERO_ALT_MIN ? "pass" : "error",
      hint: `Write descriptive alt text (at least ${HERO_ALT_MIN} characters).`,
    },
  ];

  if (keyword && heroAltLen >= HERO_ALT_MIN) {
    items.push({
      id: "keyword-in-hero-alt",
      label: "Primary keyword appears in hero alt text",
      ok: includesKeyword(input.heroArtAlt, keyword),
      severity: includesKeyword(input.heroArtAlt, keyword) ? "pass" : "warn",
      hint: "Include the topic naturally in the hero image alt text.",
    });
  }

  return items;
}

export function isSeoChecklistReady(items: SeoChecklistItem[]): boolean {
  return items.every((item) => item.severity !== "error");
}

export function countSeoChecklistIssues(items: SeoChecklistItem[]): { errors: number; warnings: number } {
  return items.reduce(
    (counts, item) => {
      if (item.severity === "error") counts.errors += 1;
      if (item.severity === "warn") counts.warnings += 1;
      return counts;
    },
    { errors: 0, warnings: 0 },
  );
}
