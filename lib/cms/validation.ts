import type { BlogSection } from "@/content/blog";
import type { CaseStudyType } from "@/content/caseStudies";
import {
  HERO_ALT_MIN,
  META_DESC_MAX,
  META_DESC_PUBLISH_MIN,
  META_TITLE_MAX,
} from "@/lib/cms/seoChecklist";
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

function sectionHasBodyCopy(section: BlogSection) {
  const hasParagraphs = (section.paragraphs ?? []).some((paragraph) => paragraph.trim());
  const hasBullets = (section.bullets ?? []).some((bullet) => bullet.trim());
  const hasH3Items = (section.h3Items ?? []).some((item) => item.h3.trim() && item.body.trim());
  return hasParagraphs || hasBullets || hasH3Items;
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
    // Listicles from ChatGPT often use bullets without paragraphs — that is valid body copy.
    if (!sectionHasBodyCopy(section)) {
      errors.push(`Section ${index + 1} needs at least one paragraph, bullet list, or H3 subsection.`);
    }
  }
}

function validateSeoAndArt(input: PublishableBlogInput, errors: string[]) {
  if (!input.slug.trim() || !slugPattern(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }
  if (!input.title.trim()) errors.push("Title is required.");
  const titleLen = input.title.trim().length;
  // Short titles are allowed to publish; SEO checklist still warns below META_TITLE_MIN.
  if (titleLen > META_TITLE_MAX) {
    errors.push(`Title is too long (${titleLen} chars). Keep the article title under ${META_TITLE_MAX} characters.`);
  }
  if (!input.description.trim()) errors.push("Meta description is required.");
  const descriptionLen = (input.metaDescription?.trim() || input.description.trim()).length;
  if (descriptionLen < META_DESC_PUBLISH_MIN) {
    errors.push(`Meta description is too short — write at least ${META_DESC_PUBLISH_MIN} characters.`);
  }
  if (descriptionLen > META_DESC_MAX) {
    errors.push(`Meta description must be ${META_DESC_MAX} characters or fewer (currently ${descriptionLen}).`);
  }
  if (!input.excerpt.trim()) errors.push("Excerpt is required.");
  if (!input.h1.trim()) errors.push("H1 is required.");
  if (!input.primaryKeyword.trim()) errors.push("Primary keyword is required.");
  if (!input.heroArtId.trim()) errors.push("Hero art ID is required.");
  if (!input.heroArtSrc.trim()) errors.push("Hero image path is required.");
  if (!input.heroArtAlt.trim()) errors.push("Hero image alt text is required.");
  if (input.heroArtAlt.length < HERO_ALT_MIN) {
    errors.push(`Hero image alt text should be descriptive (at least ${HERO_ALT_MIN} characters).`);
  }
}

export function validateBlogDraft(input: PublishableBlogInput): CmsValidationResult {
  const errors: string[] = [];
  if (!input.slug.trim()) errors.push("Slug is required.");
  else if (!slugPattern(input.slug)) {
    errors.push("Slug must use lowercase letters, numbers, and hyphens only.");
  }
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
      const paragraphs = (section as BlogSection).paragraphs;
      if (paragraphs === undefined) {
        (section as BlogSection).paragraphs = [];
      } else if (!Array.isArray(paragraphs)) {
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
