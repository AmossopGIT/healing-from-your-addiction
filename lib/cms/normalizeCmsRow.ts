import type { BlogSection } from "@/content/blog";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

function normalizeSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value.filter((section) => typeof section === "object" && section !== null) as BlogSection[];
}

export function normalizeCmsBlogPostRow(row: CmsBlogPostRow): CmsBlogPostRow {
  return {
    ...row,
    sections: normalizeSections(row.sections),
    secondary_keywords: Array.isArray(row.secondary_keywords) ? row.secondary_keywords : [],
    tag_slugs: Array.isArray(row.tag_slugs) ? row.tag_slugs : [],
    hero_art_palette: Array.isArray(row.hero_art_palette) ? row.hero_art_palette : [],
  };
}

export function normalizeCmsCaseStudyRow(row: CmsCaseStudyRow): CmsCaseStudyRow {
  return {
    ...row,
    sections: normalizeSections(row.sections),
    secondary_keywords: Array.isArray(row.secondary_keywords) ? row.secondary_keywords : [],
    tag_slugs: Array.isArray(row.tag_slugs) ? row.tag_slugs : [],
    hero_art_palette: Array.isArray(row.hero_art_palette) ? row.hero_art_palette : [],
  };
}
