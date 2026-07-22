import { blogCategories, blogTags, type BlogSection } from "@/content/blog";
import { caseStudies, caseStudyTypes, type CaseStudyType } from "@/content/caseStudies";
import { programmes } from "@/content/programmes";
import { slugifyTitle } from "@/lib/cms/slugify";
import { parseSecondaryKeywords, parseSectionsJson, parseTagSlugs } from "@/lib/cms/validation";
import type { CmsWorkflowStatus } from "@/types/cms";

export const cmsFieldMaxLengths = {
  slug: 120,
  title: 160,
  h1: 160,
  description: 320,
  excerpt: 600,
  metaTitle: 160,
  metaDescription: 320,
  keyword: 120,
  searchIntent: 160,
  conversionGoal: 160,
  ogImageAlt: 240,
  heroArtId: 160,
  heroArtSrc: 500,
  heroArtAlt: 240,
  workflowNotes: 500,
  sectionHeading: 160,
  sectionText: 2000,
  /** Compact JSON payload size for sections (was 50k and blocked typical ChatGPT articles). */
  sectionsJson: 250000,
  uploadAlt: 240,
} as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const allowedBlogCategorySlugs = new Set(blogCategories.map((category) => category.slug));
const allowedBlogTagSlugs = new Set(blogTags.map((tag) => tag.slug));
const allowedCaseStudyTypes = new Set<CaseStudyType>(caseStudyTypes);
const allowedAddictionSlugs = new Set<string>([
  ...programmes.map((programme) => programme.slug),
  ...caseStudies.map((study) => study.addictionSlug),
]);
const allowedWorkflowStatuses = new Set<CmsWorkflowStatus>([
  "draft",
  "in_review",
  "approved",
  "scheduled",
  "published",
  "archived",
]);
const allowedContentKinds = new Set(["blog", "case-study"]);

export function normalizeSingleLine(value: string | null | undefined) {
  return (value ?? "")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMultiline(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, "")
    .trim();
}

export function sanitizeUuid(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  return UUID_PATTERN.test(normalized) ? normalized : "";
}

export function sanitizeSlug(value: string | null | undefined) {
  // Always produce a URL-safe slug. Staff often paste titles or typed spaces into the slug field.
  return slugifyTitle(normalizeSingleLine(value)).slice(0, cmsFieldMaxLengths.slug);
}

export function sanitizeRequiredText(value: string | null | undefined, maxLength: number) {
  return normalizeSingleLine(value).slice(0, maxLength);
}

export function sanitizeOptionalText(value: string | null | undefined, maxLength: number) {
  const normalized = normalizeSingleLine(value).slice(0, maxLength);
  return normalized || null;
}

export function sanitizeOptionalMultiline(value: string | null | undefined, maxLength: number) {
  const normalized = normalizeMultiline(value).slice(0, maxLength);
  return normalized || undefined;
}

export function sanitizeHeroArtSrc(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value).slice(0, cmsFieldMaxLengths.heroArtSrc);
  if (!normalized) return "";
  if (normalized.startsWith("/") || normalized.startsWith("https://") || normalized.startsWith("http://")) {
    return normalized;
  }
  return "";
}

export function sanitizeBlogCategorySlug(value: string | null | undefined) {
  const normalized = sanitizeSlug(value);
  return allowedBlogCategorySlugs.has(normalized) ? normalized : "";
}

export function sanitizeTagSlugList(value: string | null | undefined) {
  const parsed = parseTagSlugs(String(value ?? ""));
  const unique: string[] = [];
  for (const tag of parsed) {
    const normalized = sanitizeSlug(tag);
    if (!allowedBlogTagSlugs.has(normalized) || unique.includes(normalized)) continue;
    unique.push(normalized);
  }
  return unique.slice(0, 12);
}

export function sanitizeSecondaryKeywordList(value: string | null | undefined) {
  return parseSecondaryKeywords(String(value ?? ""))
    .map((keyword) => sanitizeRequiredText(keyword, cmsFieldMaxLengths.keyword))
    .filter(Boolean)
    .slice(0, 12);
}

export function sanitizeCaseStudyType(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value) as CaseStudyType;
  return allowedCaseStudyTypes.has(normalized) ? normalized : "";
}

export function sanitizeAddictionSlug(value: string | null | undefined) {
  const normalized = sanitizeSlug(value);
  return allowedAddictionSlugs.has(normalized) ? normalized : "";
}

export function sanitizeWorkflowStatus(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value) as CmsWorkflowStatus;
  return allowedWorkflowStatuses.has(normalized) ? normalized : "";
}

export function sanitizeContentKind(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  return allowedContentKinds.has(normalized) ? normalized : "";
}

export function sanitizeScheduledFor(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  if (!DATETIME_LOCAL_PATTERN.test(normalized)) return "";
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function sanitizeSection(section: BlogSection): BlogSection {
  const paragraphs = section.paragraphs
    .map((paragraph) => normalizeMultiline(paragraph).slice(0, cmsFieldMaxLengths.sectionText))
    .filter(Boolean)
    .slice(0, 20);

  const bullets = section.bullets
    ?.map((bullet) => normalizeSingleLine(bullet).slice(0, cmsFieldMaxLengths.sectionText))
    .filter(Boolean)
    .slice(0, 20);

  const h3Items = section.h3Items
    ?.filter((item) => item && typeof item.h3 === "string" && typeof item.body === "string")
    .map((item) => ({
      h3: normalizeSingleLine(item.h3).slice(0, cmsFieldMaxLengths.sectionHeading),
      body: normalizeMultiline(item.body).slice(0, cmsFieldMaxLengths.sectionText),
    }))
    .filter((item) => item.h3 && item.body)
    .slice(0, 20);

  const video =
    section.video && typeof section.video.title === "string"
      ? (() => {
          const youtubeId =
            typeof section.video.youtubeId === "string"
              ? normalizeSingleLine(section.video.youtubeId).slice(0, 32)
              : undefined;
          const src =
            typeof section.video.src === "string"
              ? normalizeSingleLine(section.video.src).slice(0, 200)
              : undefined;
          if (!youtubeId && !src) return undefined;
          return {
            title: normalizeSingleLine(section.video.title).slice(0, cmsFieldMaxLengths.sectionHeading),
            description: section.video.description
              ? normalizeSingleLine(section.video.description).slice(0, cmsFieldMaxLengths.sectionText)
              : undefined,
            youtubeId,
            src,
            posterSrc: section.video.posterSrc
              ? normalizeSingleLine(section.video.posterSrc).slice(0, 200)
              : undefined,
          };
        })()
      : undefined;

  return {
    h2: normalizeSingleLine(section.h2).slice(0, cmsFieldMaxLengths.sectionHeading),
    paragraphs,
    bullets: bullets?.length ? bullets : undefined,
    h3Items: h3Items?.length ? h3Items : undefined,
    video,
  };
}

export function sanitizeSectionsJson(raw: string): { sections: BlogSection[] } | { error: string } {
  if (raw.length > cmsFieldMaxLengths.sectionsJson) {
    return { error: "Sections content is too large." };
  }

  const parsed = parseSectionsJson(raw);
  if ("error" in parsed) {
    return parsed;
  }

  return {
    sections: parsed.sections.slice(0, 20).map(sanitizeSection),
  };
}
