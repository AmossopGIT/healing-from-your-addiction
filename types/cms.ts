import type { BlogSection } from "@/content/blog";
import type { CaseStudyType } from "@/content/caseStudies";

export type CmsWorkflowStatus = "draft" | "in_review" | "approved" | "scheduled" | "published" | "archived";

export type CmsContentType = "blog_post" | "case_study";

export type CmsHeroArt = {
  heroArtId: string;
  heroArtSrc: string;
  heroArtAlt: string;
  heroArtPrompt: string | null;
  heroArtPalette: string[];
};

export type CmsSeoFields = {
  metaTitle: string | null;
  metaDescription: string | null;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string | null;
  conversionGoal: string | null;
  canonicalPath: string | null;
  noindex: boolean;
  ogImageAlt: string | null;
};

export type CmsBlogPostRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  h1: string;
  meta_title: string | null;
  meta_description: string | null;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string | null;
  conversion_goal: string | null;
  canonical_path: string | null;
  noindex: boolean;
  og_image_alt: string | null;
  category_slug: string;
  tag_slugs: string[];
  sections: BlogSection[];
  hero_art_id: string;
  hero_art_src: string;
  hero_art_alt: string;
  hero_art_prompt: string | null;
  hero_art_palette: string[];
  workflow_status: CmsWorkflowStatus;
  published_at: string | null;
  scheduled_for: string | null;
  review_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsCaseStudyRow = {
  id: string;
  slug: string;
  legacy_slug: string;
  archive_page_id: string | null;
  title: string;
  description: string;
  excerpt: string;
  h1: string;
  meta_title: string | null;
  meta_description: string | null;
  primary_keyword: string;
  secondary_keywords: string[];
  search_intent: string | null;
  conversion_goal: string | null;
  canonical_path: string | null;
  noindex: boolean;
  og_image_alt: string | null;
  case_study_type: CaseStudyType;
  addiction_slug: string;
  tag_slugs: string[];
  sections: BlogSection[];
  hero_art_id: string;
  hero_art_src: string;
  hero_art_alt: string;
  hero_art_prompt: string | null;
  hero_art_palette: string[];
  workflow_status: CmsWorkflowStatus;
  published_at: string | null;
  scheduled_for: string | null;
  review_notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CmsWorkflowEventRow = {
  id: string;
  content_type: CmsContentType;
  content_id: string;
  from_status: CmsWorkflowStatus | null;
  to_status: CmsWorkflowStatus;
  notes: string | null;
  actor_id: string | null;
  created_at: string;
};

export const cmsWorkflowStatusLabels: Record<CmsWorkflowStatus, string> = {
  draft: "Draft",
  in_review: "In review",
  approved: "Approved",
  scheduled: "Scheduled",
  published: "Published",
  archived: "Archived",
};

export const cmsWorkflowTransitions: Record<CmsWorkflowStatus, CmsWorkflowStatus[]> = {
  draft: ["in_review", "scheduled", "published"],
  in_review: ["draft", "approved", "scheduled", "published"],
  approved: ["draft", "scheduled", "published"],
  // `scheduled` includes itself so staff can reschedule without leaving the status.
  scheduled: ["draft", "approved", "published", "scheduled"],
  published: ["archived", "draft"],
  archived: ["draft"],
};
