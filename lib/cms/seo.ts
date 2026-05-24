import { blogPath } from "@/content/blog";
import { caseStudyPath } from "@/content/caseStudies";
import type { SeoPageRecord } from "@/content/seo";
import type { CmsBlogPostRow, CmsCaseStudyRow } from "@/types/cms";

const defaultSearchIntent = {
  blog: "Read an educational addiction recovery article.",
  caseStudy: "Read an educational addiction case study or programme resource.",
} as const;

const defaultConversionGoal =
  "Move readers toward a relevant programme page or confidential enquiry.";

export function cmsBlogPostToSeoRecord(row: CmsBlogPostRow): SeoPageRecord {
  return {
    path: row.canonical_path ?? blogPath(row.slug),
    title: row.meta_title ?? `${row.title} | Healing From Your Addiction`,
    description: row.meta_description ?? row.description,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: row.secondary_keywords,
    searchIntent: row.search_intent ?? defaultSearchIntent.blog,
    pageType: "blog-post",
    conversionGoal: row.conversion_goal ?? defaultConversionGoal,
    canonicalPath: row.canonical_path ?? undefined,
    noIndex: row.noindex,
    ogImage: row.hero_art_src,
    ogImageAlt: row.og_image_alt ?? row.hero_art_alt ?? row.title,
  };
}

export function cmsCaseStudyToSeoRecord(row: CmsCaseStudyRow): SeoPageRecord {
  return {
    path: row.canonical_path ?? caseStudyPath(row.slug),
    title: row.meta_title ?? `${row.title} | Healing From Your Addiction`,
    description: row.meta_description ?? row.description,
    primaryKeyword: row.primary_keyword,
    secondaryKeywords: row.secondary_keywords,
    searchIntent: row.search_intent ?? defaultSearchIntent.caseStudy,
    pageType: "case-study",
    conversionGoal: row.conversion_goal ?? defaultConversionGoal,
    canonicalPath: row.canonical_path ?? undefined,
    noIndex: row.noindex,
    ogImage: row.hero_art_src,
    ogImageAlt: row.og_image_alt ?? row.hero_art_alt ?? row.title,
  };
}

export function cmsSeoKeywordRow(contentType: "blog" | "case-study", row: CmsBlogPostRow | CmsCaseStudyRow) {
  const path = contentType === "blog" ? blogPath((row as CmsBlogPostRow).slug) : caseStudyPath((row as CmsCaseStudyRow).slug);
  const seo = contentType === "blog" ? cmsBlogPostToSeoRecord(row as CmsBlogPostRow) : cmsCaseStudyToSeoRecord(row as CmsCaseStudyRow);
  return `| ${row.title} | ${path} | ${seo.primaryKeyword} | ${seo.secondaryKeywords.join(", ")} | ${seo.searchIntent} | ${seo.conversionGoal} |`;
}
