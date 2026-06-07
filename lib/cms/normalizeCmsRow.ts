import { normalizeBlogSections } from "@/lib/cms/normalizeSections";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

export function normalizeCmsBlogPostRow(row: CmsBlogPostRow): CmsBlogPostRow {
  return {
    ...row,
    sections: normalizeBlogSections(row.sections),
    secondary_keywords: Array.isArray(row.secondary_keywords) ? row.secondary_keywords : [],
    tag_slugs: Array.isArray(row.tag_slugs) ? row.tag_slugs : [],
    hero_art_palette: Array.isArray(row.hero_art_palette) ? row.hero_art_palette : [],
  };
}

export function normalizeCmsCaseStudyRow(row: CmsCaseStudyRow): CmsCaseStudyRow {
  return {
    ...row,
    sections: normalizeBlogSections(row.sections),
    secondary_keywords: Array.isArray(row.secondary_keywords) ? row.secondary_keywords : [],
    tag_slugs: Array.isArray(row.tag_slugs) ? row.tag_slugs : [],
    hero_art_palette: Array.isArray(row.hero_art_palette) ? row.hero_art_palette : [],
  };
}
