import type { BlogSection } from "@/content/blog";
import type { CaseStudyType } from "@/content/caseStudies";
import type { CmsWorkflowStatus } from "@/types/cms";
import { cmsWorkflowTransitions } from "@/types/cms";

export type CmsValidationResult = { ok: true } | { ok: false; errors: string[] };

export type PublishableBlogInput = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  categorySlug: string;
  tagSlugs: string[];
  sections: BlogSection[];
  heroArtId: string;
  heroArtSrc: string;
  heroArtAlt: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  searchIntent?: string | null;
  conversionGoal?: string | null;
  ogImageAlt?: string | null;
};

export type PublishableCaseStudyInput = PublishableBlogInput & {
  legacySlug: string;
  caseStudyType: CaseStudyType;
  addictionSlug: string;
};

function slugPattern(value: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

function validateSections(sections: BlogSection[], errors: string[]) {
  if (!sections.length) {
    errors.push("At least one content section is required.");
    return;
  }

  for (const [index, section] of sections.entries()) {
    if (!section.h2.trim()) {
      errors.push(`Section ${index + 1} needs an H2 heading.`);
    }
    if (!section.paragraphs.length || section.paragraphs.every((p) => !p.trim())) {
      errors.push(`Section ${index + 1} needs at least one paragraph.`);
    }
  }
}

function validateSeoAndArt(input: PublishableBlogInput, errors: string[]) {
  if (!input.slug.trim() || !slugPattern(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }
  if (!input.title.trim()) errors.push("Title is required.");
  if (!input.description.trim()) errors.push("Meta description is required.");
  if (!input.excerpt.trim()) errors.push("Excerpt is required.");
  if (!input.h1.trim()) errors.push("H1 is required.");
  if (!input.primaryKeyword.trim()) errors.push("Primary keyword is required.");
  if (!input.heroArtId.trim()) errors.push("Hero art ID is required.");
  if (!input.heroArtSrc.trim()) errors.push("Hero image path is required.");
  if (!input.heroArtAlt.trim()) errors.push("Hero image alt text is required.");
  if (input.heroArtAlt.length < 20) {
    errors.push("Hero image alt text should be descriptive (at least 20 characters).");
  }
}

export function validateBlogDraft(input: PublishableBlogInput): CmsValidationResult {
  const errors: string[] = [];
  if (!input.slug.trim()) errors.push("Slug is required.");
  if (!input.title.trim()) errors.push("Title is required.");
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateBlogPublish(input: PublishableBlogInput): CmsValidationResult {
  const errors: string[] = [];
  validateSeoAndArt(input, errors);
  if (!input.categorySlug.trim()) errors.push("Category is required.");
  validateSections(input.sections, errors);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateCaseStudyDraft(input: PublishableCaseStudyInput): CmsValidationResult {
  const errors: string[] = [];
  if (!input.slug.trim()) errors.push("Slug is required.");
  if (!input.title.trim()) errors.push("Title is required.");
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function validateCaseStudyPublish(input: PublishableCaseStudyInput): CmsValidationResult {
  const errors: string[] = [];
  validateSeoAndArt(input, errors);
  if (!input.caseStudyType) errors.push("Case study type is required.");
  if (!input.addictionSlug.trim()) errors.push("Addiction slug is required.");
  validateSections(input.sections, errors);
  return errors.length ? { ok: false, errors } : { ok: true };
}

export function canTransitionWorkflow(from: CmsWorkflowStatus, to: CmsWorkflowStatus) {
  return cmsWorkflowTransitions[from].includes(to);
}

export function parseSectionsJson(raw: string): { sections: BlogSection[] } | { error: string } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return { error: "Sections must be a JSON array." };
    }
    for (const section of parsed) {
      if (typeof section !== "object" || section === null) {
        return { error: "Each section must be an object." };
      }
      if (typeof (section as BlogSection).h2 !== "string") {
        return { error: "Each section needs an h2 string." };
      }
      if (!Array.isArray((section as BlogSection).paragraphs)) {
        return { error: "Each section needs a paragraphs array." };
      }
    }
    return { sections: parsed as BlogSection[] };
  } catch {
    return { error: "Sections JSON is invalid." };
  }
}

export function parseTagSlugs(raw: string) {
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function parseSecondaryKeywords(raw: string) {
  return raw
    .split(",")
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}
