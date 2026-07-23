import type { BlogSection } from "@/content/blog";
import { bodyTextToSections, sectionsHaveContent } from "@/lib/cms/bodyToSections";

export type SmartBodyImportResult = {
  sections: BlogSection[];
  /** template-body = extracted from --- BODY --- markers; markdown = plain article body */
  source: "markdown" | "template-body";
};

function extractBodyBetweenMarkers(source: string): string | null {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  let inBody = false;
  const bodyLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^---\s*BODY\s*---$/i.test(trimmed)) {
      inBody = true;
      continue;
    }
    if (/^---\s*END\s*BODY\s*---$/i.test(trimmed)) {
      break;
    }
    if (inBody) bodyLines.push(line);
  }

  if (!inBody) return null;
  return bodyLines.join("\n").trim();
}

/** True when body is only the auto-generated draft placeholder intro. */
export function isDraftPlaceholderSections(sections: BlogSection[]): boolean {
  if (sections.length !== 1) return false;
  const section = sections[0];
  if (section.h2.trim() !== "Introduction") return false;
  if ((section.bullets ?? []).some((bullet) => bullet.trim())) return false;
  if ((section.h3Items ?? []).some((item) => item.h3.trim() || item.body.trim())) return false;

  const paragraphs = (section.paragraphs ?? []).map((paragraph) => paragraph.trim()).filter(Boolean);
  if (paragraphs.length !== 1) return false;

  return /^Draft article about .+ — add your opening paragraphs here\.$/i.test(paragraphs[0]);
}

/** True when the editor already has real body copy worth confirming before replace. */
export function bodyHasReplaceableContent(sections: BlogSection[]): boolean {
  return sectionsHaveContent(sections) && !isDraftPlaceholderSections(sections);
}

/**
 * Parse a body-only paste (markdown article or writer template BODY block)
 * into CMS sections. Does not touch title, SEO, tags, or other essentials.
 */
export function parseSmartBodyImport(source: string): { result: SmartBodyImportResult | null; error?: string } {
  const trimmed = source.replace(/\r\n/g, "\n").trim();
  if (!trimmed) {
    return { result: null, error: "Paste article body text first." };
  }

  const fromMarkers = extractBodyBetweenMarkers(trimmed);
  const bodyText = fromMarkers ?? trimmed;
  const sourceKind: SmartBodyImportResult["source"] = fromMarkers !== null ? "template-body" : "markdown";

  if (!bodyText.trim()) {
    return {
      result: null,
      error:
        sourceKind === "template-body"
          ? "BODY block is empty — add content between --- BODY --- and --- END BODY ---."
          : "Paste article body text first.",
    };
  }

  const sections = bodyTextToSections(bodyText);
  if (!sectionsHaveContent(sections)) {
    return { result: null, error: "Could not find headings or paragraphs in that paste." };
  }

  return { result: { sections, source: sourceKind } };
}
