import type { BlogSection } from "@/content/blog";
import { blogCategories, blogTags } from "@/content/blog";
import { bodyTextToSections } from "@/lib/cms/bodyToSections";
import { slugifyTitle } from "@/lib/cms/slugify";
import { parseSecondaryKeywords } from "@/lib/cms/validation";

export type BlogTemplateImportData = {
  title: string;
  slug: string;
  description: string;
  excerpt: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  categorySlug: string;
  tagSlugs: string[];
  searchIntent: string;
  conversionGoal: string;
  publishedAt: string;
  author: string;
  authorRole: string;
  sections: BlogSection[];
  internalNotes?: string;
};

type TemplateFieldKey =
  | "title"
  | "slug"
  | "description"
  | "excerpt"
  | "h1"
  | "primaryKeyword"
  | "secondaryKeywords"
  | "seoKeywords"
  | "categorySlug"
  | "tagSlugs"
  | "searchIntent"
  | "conversionGoal"
  | "publishedAt"
  | "author"
  | "authorRole";

const FIELD_ALIASES: Record<string, TemplateFieldKey> = {
  title: "title",
  slug: "slug",
  "meta description": "description",
  description: "description",
  excerpt: "excerpt",
  h1: "h1",
  "primary keyword": "primaryKeyword",
  "secondary keywords": "secondaryKeywords",
  "seo keywords": "seoKeywords",
  keywords: "seoKeywords",
  category: "categorySlug",
  tags: "tagSlugs",
  "search intent": "searchIntent",
  "conversion goal": "conversionGoal",
  "publish date": "publishedAt",
  "date published": "publishedAt",
  author: "author",
  "author role": "authorRole",
};

const DEFAULT_SEARCH_INTENT = "Read an educational addiction recovery article.";
const DEFAULT_CONVERSION_GOAL = "Move readers toward a relevant programme page or confidential enquiry.";
const DEFAULT_AUTHOR = "Editorial Team";
const DEFAULT_AUTHOR_ROLE = "Content team";

const allowedCategorySlugs = new Set(blogCategories.map((category) => category.slug));
const allowedTagSlugs = new Set(blogTags.map((tag) => tag.slug));

function normalizeLabel(line: string): string | null {
  const match = line.trim().match(/^([A-Za-z0-9][A-Za-z0-9\s]*):\s*$/);
  if (!match) return null;
  return match[1].trim().toLowerCase();
}

function isBodyStart(line: string): boolean {
  return /^---\s*BODY\s*---$/i.test(line.trim());
}

function isBodyEnd(line: string): boolean {
  return /^---\s*END\s*BODY\s*---$/i.test(line.trim());
}

function isPlaceholder(value: string): boolean {
  const trimmed = value.trim();
  return !trimmed || trimmed.startsWith("(");
}

function sanitizeCategorySlug(raw: string): string {
  const normalized = raw.trim().toLowerCase().replace(/\s+/g, "-");
  return allowedCategorySlugs.has(normalized) ? normalized : "";
}

function sanitizeTagSlugs(raw: string): string[] {
  const parsed = parseSecondaryKeywords(raw)
    .map((tag) => tag.trim().toLowerCase().replace(/\s+/g, "-"))
    .filter((tag) => allowedTagSlugs.has(tag));
  return [...new Set(parsed)];
}

function firstParagraphText(sections: BlogSection[]): string {
  for (const section of sections) {
    for (const paragraph of section.paragraphs) {
      const text = paragraph.trim();
      if (text) return text;
    }
  }
  return "";
}

function buildExcerpt(description: string, sections: BlogSection[]): string {
  if (description.trim()) {
    return description.trim().slice(0, 280);
  }
  const first = firstParagraphText(sections);
  return first.slice(0, 280);
}

/** Parse labeled blog template (Google Docs export, .md, or .txt). */
export function parseBlogTemplateDocument(source: string): { data: BlogTemplateImportData | null; error?: string } {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const values: Partial<Record<TemplateFieldKey, string>> = {};
  const valueBuffers = new Map<TemplateFieldKey, string[]>();

  let currentField: TemplateFieldKey | null = null;
  let bodyLines: string[] = [];
  let notesLines: string[] = [];
  let inBody = false;
  let inNotes = false;
  let bodyText = "";

  const flushField = () => {
    if (!currentField) return;
    const buffer = valueBuffers.get(currentField) ?? [];
    const value = buffer.join("\n").trim();
    if (!isPlaceholder(value)) {
      values[currentField] = value;
    }
    valueBuffers.delete(currentField);
    currentField = null;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (/^={3,}|^MONTHLY BLOG/i.test(trimmed) && !inBody) continue;

    if (isBodyStart(line)) {
      flushField();
      inBody = true;
      inNotes = false;
      currentField = null;
      continue;
    }

    if (isBodyEnd(line)) {
      inBody = false;
      bodyText = bodyLines.join("\n").trim();
      bodyLines = [];
      continue;
    }

    if (inBody) {
      bodyLines.push(line);
      continue;
    }

    const label = normalizeLabel(line);
    if (label === "internal notes" || label === "internal notes (not published)" || /^INTERNAL NOTES/i.test(trimmed)) {
      flushField();
      inNotes = true;
      notesLines = [];
      currentField = null;
      continue;
    }

    if (label === "hero image") {
      flushField();
      inNotes = false;
      currentField = null;
      continue;
    }

    if (label && FIELD_ALIASES[label]) {
      flushField();
      inNotes = false;
      currentField = FIELD_ALIASES[label];
      valueBuffers.set(currentField, []);
      continue;
    }

    if (inNotes) {
      notesLines.push(line);
      continue;
    }

    if (currentField) {
      const buffer = valueBuffers.get(currentField) ?? [];
      buffer.push(line);
      valueBuffers.set(currentField, buffer);
    }
  }

  flushField();
  if (!bodyText && bodyLines.length > 0) {
    bodyText = bodyLines.join("\n").trim();
  }

  const title = values.title?.trim() ?? "";
  if (!title) {
    return { data: null, error: "Missing TITLE — use the blog template labels." };
  }

  if (!bodyText.trim()) {
    return { data: null, error: "Missing body — add content between --- BODY --- and --- END BODY ---." };
  }

  const sections = bodyTextToSections(bodyText);
  const description = values.description?.trim() ?? "";
  const seoKeywords = values.seoKeywords?.trim() ?? "";
  const parsedKeywords = parseSecondaryKeywords(seoKeywords || values.primaryKeyword || "");
  const primaryKeyword = values.primaryKeyword?.trim() || parsedKeywords[0] || "";
  const secondaryKeywords = values.secondaryKeywords
    ? parseSecondaryKeywords(values.secondaryKeywords)
    : parsedKeywords.slice(primaryKeyword ? 1 : 0);

  let slug = values.slug?.trim() ?? "";
  if (!slug || isPlaceholder(slug)) {
    slug = slugifyTitle(title);
  }

  let publishedAt = values.publishedAt?.trim() || new Date().toISOString().slice(0, 10);
  const dateMatch = publishedAt.match(/(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) publishedAt = dateMatch[1];

  const data: BlogTemplateImportData = {
    title,
    slug,
    description,
    excerpt: buildExcerpt(values.excerpt?.trim() ?? "", sections),
    h1: values.h1?.trim() || title,
    primaryKeyword,
    secondaryKeywords,
    categorySlug: sanitizeCategorySlug(values.categorySlug ?? ""),
    tagSlugs: sanitizeTagSlugs(values.tagSlugs ?? ""),
    searchIntent: values.searchIntent?.trim() || DEFAULT_SEARCH_INTENT,
    conversionGoal: values.conversionGoal?.trim() || DEFAULT_CONVERSION_GOAL,
    publishedAt,
    author: values.author?.trim() || DEFAULT_AUTHOR,
    authorRole: values.authorRole?.trim() || DEFAULT_AUTHOR_ROLE,
    sections,
    internalNotes: notesLines.join("\n").trim() || undefined,
  };

  return { data };
}
