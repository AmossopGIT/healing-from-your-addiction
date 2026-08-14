import { bodyTextToSections } from "@/lib/cms/bodyToSections";
import { blogCategories, blogTags } from "@/content/blog";
import { cmsFieldMaxLengths } from "@/lib/cms/formValidation";
import { slugifyTitle } from "@/lib/cms/slugify";
import { parseBlogTemplateDocument, type BlogTemplateImportData } from "@/lib/cms/templateImport";

export type SmartBlogImportKind = "template" | "article";

export type SmartBlogImportResult = {
  kind: SmartBlogImportKind;
  data: BlogTemplateImportData;
};

const DEFAULT_SEARCH_INTENT = "Read an educational addiction recovery article.";
const DEFAULT_CONVERSION_GOAL = "Move readers toward a relevant programme page or confidential enquiry.";
const DEFAULT_AUTHOR = "Editorial Team";
const DEFAULT_AUTHOR_ROLE = "Content team";

/** True when paste looks like the labeled writer template. */
export function looksLikeBlogTemplate(source: string): boolean {
  const text = source.replace(/\r\n/g, "\n");
  const hasTitleLabel = /^\s*TITLE\s*:/im.test(text);
  const hasBodyMarker = /^---\s*BODY\s*---$/im.test(text);
  return hasTitleLabel || hasBodyMarker;
}

function stripMarkdownInline(text: string): string {
  return text
    .replace(/!\[[^\]]*]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitleAndBody(source: string): { title: string; bodyText: string } {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let title = "";
  let bodyStart = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match && !trimmed.startsWith("##")) {
      title = stripMarkdownInline(h1Match[1]);
      bodyStart = i + 1;
      break;
    }

    // Plain first line as title when it looks like a short headline
    if (!trimmed.startsWith("#") && !trimmed.startsWith("-") && !trimmed.startsWith("*") && trimmed.length <= 120) {
      title = stripMarkdownInline(trimmed);
      bodyStart = i + 1;
      break;
    }

    break;
  }

  const bodyText = lines.slice(bodyStart).join("\n").trim();
  return { title, bodyText };
}

function firstParagraphFromBody(bodyText: string): string {
  const blocks = bodyText
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((block) => {
      const lines = block
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      // Skip pure heading / list blocks for excerpt
      if (lines.every((line) => /^#{1,3}\s+/.test(line) || /^[-*•]\s+/.test(line) || /^\d+[.)]\s+/.test(line))) {
        return "";
      }
      return stripMarkdownInline(
        lines
          .filter((line) => !/^#{1,3}\s+/.test(line))
          .join(" "),
      );
    })
    .filter(Boolean);

  return blocks[0] ?? "";
}

function searchableText(title: string, bodyText: string): string {
  return stripMarkdownInline(`${title} ${bodyText}`)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, " ");
}

function inferPlainArticleSeo(title: string, bodyText: string): {
  primaryKeyword: string;
  secondaryKeywords: string[];
  categorySlug: string;
  tagSlugs: string[];
} {
  const text = searchableText(title, bodyText);
  const scoredCategories = blogCategories
    .map((category) => {
      const terms = [category.title, category.slug.replace(/-/g, " "), category.primaryKeyword]
        .map((term) => term.toLowerCase());
      const score = terms.reduce((total, term) => {
        if (text.includes(term)) return total + (term.includes(" ") ? 3 : 1);
        return total;
      }, 0);
      return { category, score };
    })
    .sort((a, b) => b.score - a.score);
  const bestCategory = scoredCategories[0]?.score ? scoredCategories[0].category : null;

  const matchedTags = blogTags
    .filter((tag) => text.includes(tag.label.toLowerCase()) || text.includes(tag.slug.replace(/-/g, " ")))
    .map((tag) => tag.slug)
    .slice(0, 4);
  if (bestCategory && blogTags.some((tag) => tag.slug === bestCategory.slug) && !matchedTags.includes(bestCategory.slug)) {
    matchedTags.unshift(bestCategory.slug);
  }

  return {
    primaryKeyword: bestCategory?.primaryKeyword || title.toLowerCase(),
    secondaryKeywords: matchedTags
      .map((slug) => blogTags.find((tag) => tag.slug === slug)?.label.toLowerCase() ?? slug.replace(/-/g, " ")),
    categorySlug: bestCategory?.slug ?? "",
    tagSlugs: matchedTags,
  };
}

function buildPlainArticleDescription(firstParagraph: string, bodyText: string): string {
  const paragraphs = bodyText
    .split(/\n\s*\n/)
    .map((paragraph) => stripMarkdownInline(paragraph))
    .filter(Boolean);
  const combined = [firstParagraph, ...paragraphs.filter((paragraph) => paragraph !== firstParagraph)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
  return combined.slice(0, cmsFieldMaxLengths.description);
}

function sectionsHaveCopy(sections: ReturnType<typeof bodyTextToSections>): boolean {
  return sections.some(
    (section) =>
      section.h2.trim() ||
      section.paragraphs.some((paragraph) => paragraph.trim()) ||
      (section.bullets ?? []).some((bullet) => bullet.trim()),
  );
}

function parsePlainArticle(source: string): { data: BlogTemplateImportData | null; error?: string } {
  const trimmed = source.trim();
  if (!trimmed) {
    return { data: null, error: "Paste is empty." };
  }

  const { title: extractedTitle, bodyText } = extractTitleAndBody(trimmed);
  const title = extractedTitle.trim();
  if (!title) {
    return { data: null, error: "Could not find a title. Start with # Title or a short headline line." };
  }

  // Prefer body after the title line; fall back to full paste if nothing remains
  const articleBody = bodyText.trim() || trimmed;
  const sections = bodyTextToSections(articleBody);

  if (!sectionsHaveCopy(sections)) {
    return { data: null, error: "Could not find article body content to turn into sections." };
  }

  const firstPara =
    firstParagraphFromBody(articleBody) ||
    sections.flatMap((section) => section.paragraphs).map((paragraph) => stripMarkdownInline(paragraph)).find(Boolean) ||
    "";

  const excerpt = firstPara.slice(0, cmsFieldMaxLengths.excerpt);
  const description = buildPlainArticleDescription(firstPara, articleBody);
  const inferredSeo = inferPlainArticleSeo(title, articleBody);

  const data: BlogTemplateImportData = {
    title: title.slice(0, cmsFieldMaxLengths.title),
    slug: slugifyTitle(title),
    description,
    excerpt,
    h1: title.slice(0, cmsFieldMaxLengths.h1),
    primaryKeyword: inferredSeo.primaryKeyword,
    secondaryKeywords: inferredSeo.secondaryKeywords,
    categorySlug: inferredSeo.categorySlug,
    tagSlugs: inferredSeo.tagSlugs,
    searchIntent: DEFAULT_SEARCH_INTENT,
    conversionGoal: DEFAULT_CONVERSION_GOAL,
    publishedAt: new Date().toISOString().slice(0, 10),
    author: DEFAULT_AUTHOR,
    authorRole: DEFAULT_AUTHOR_ROLE,
    sections,
  };

  return { data };
}

/**
 * Smart import: labeled writer template, or plain ChatGPT / Docs markdown article.
 */
export function parseSmartBlogImport(source: string): {
  result: SmartBlogImportResult | null;
  error?: string;
} {
  const trimmed = source.trim();
  if (!trimmed) {
    return { result: null, error: "Paste is empty." };
  }

  if (looksLikeBlogTemplate(trimmed)) {
    const { data, error } = parseBlogTemplateDocument(trimmed);
    if (!data) {
      return { result: null, error: error ?? "Could not parse template." };
    }
    return { result: { kind: "template", data } };
  }

  const { data, error } = parsePlainArticle(trimmed);
  if (!data) {
    return { result: null, error: error ?? "Could not parse article." };
  }
  return { result: { kind: "article", data } };
}
