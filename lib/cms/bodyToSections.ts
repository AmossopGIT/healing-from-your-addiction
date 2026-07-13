import type { BlogSection } from "@/content/blog";

const H1_PATTERN = /^#\s+(.+)$/;
const H2_PATTERN = /^##\s+(.+)$/;
const H3_PATTERN = /^###\s+(.+)$/;
const BULLET_PATTERN = /^[-*•]\s+(.+)$/;
const NUMBERED_PATTERN = /^\d+[.)]\s+(.+)$/;

function stripEmptyBullets(section: BlogSection): BlogSection {
  return {
    ...section,
    bullets: section.bullets?.length ? section.bullets : undefined,
    h3Items: section.h3Items?.length ? section.h3Items : undefined,
  };
}

/** Convert markdown-lite body text (ChatGPT / Docs / Word export) into structured CMS sections. */
export function bodyTextToSections(bodyText: string): BlogSection[] {
  const lines = bodyText.replace(/\r\n/g, "\n").split("\n");
  const sections: BlogSection[] = [];
  let currentSection: BlogSection | null = null;
  let currentH3: { h3: string; bodyLines: string[] } | null = null;
  let paragraphLines: string[] = [];

  const flushParagraph = () => {
    const text = paragraphLines.join("\n").trim();
    paragraphLines = [];
    if (!text) return;

    if (currentH3) {
      currentH3.bodyLines.push(text);
      return;
    }

    if (!currentSection) {
      currentSection = { h2: "Introduction", paragraphs: [], bullets: [] };
    }
    currentSection.paragraphs.push(text);
  };

  const flushH3 = () => {
    if (!currentH3 || !currentSection) return;
    const body = currentH3.bodyLines.join("\n\n").trim();
    if (body) {
      currentSection.h3Items = currentSection.h3Items ?? [];
      currentSection.h3Items.push({ h3: currentH3.h3, body });
    }
    currentH3 = null;
  };

  const flushSection = () => {
    flushParagraph();
    flushH3();
    if (!currentSection) return;
    if (currentSection.h2.trim() || currentSection.paragraphs.length || currentSection.bullets?.length) {
      sections.push(stripEmptyBullets(currentSection));
    }
    currentSection = null;
  };

  const startSection = (h2: string) => {
    flushSection();
    currentSection = { h2: h2.trim(), paragraphs: [], bullets: [] };
  };

  const ensureSection = () => {
    if (!currentSection) {
      currentSection = { h2: "Introduction", paragraphs: [], bullets: [] };
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // ChatGPT often starts with an H1 title — skip it; title lives in the form field above.
    if (trimmed.match(H1_PATTERN) && !trimmed.match(H2_PATTERN) && !trimmed.match(H3_PATTERN)) {
      flushParagraph();
      continue;
    }

    const h2Match = trimmed.match(H2_PATTERN);
    if (h2Match) {
      startSection(h2Match[1]);
      continue;
    }

    const h3Match = trimmed.match(H3_PATTERN);
    if (h3Match) {
      flushParagraph();
      flushH3();
      ensureSection();
      currentH3 = { h3: h3Match[1].trim(), bodyLines: [] };
      continue;
    }

    const bulletMatch = trimmed.match(BULLET_PATTERN) ?? trimmed.match(NUMBERED_PATTERN);
    if (bulletMatch) {
      flushParagraph();
      ensureSection();
      currentSection!.bullets = currentSection!.bullets ?? [];
      currentSection!.bullets.push(bulletMatch[1].trim());
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      continue;
    }

    paragraphLines.push(line);
  }

  flushSection();

  if (!sections.length) {
    const fallback = bodyText.trim();
    if (fallback) {
      return [{ h2: "Introduction", paragraphs: [fallback] }];
    }
  }

  return sections;
}

export function sectionsHaveContent(sections: BlogSection[]): boolean {
  return sections.some(
    (section) =>
      section.h2.trim() ||
      (section.paragraphs ?? []).some((paragraph) => paragraph.trim()) ||
      (section.bullets ?? []).some((bullet) => bullet.trim()) ||
      (section.h3Items ?? []).some((item) => item.h3.trim() || item.body.trim()),
  );
}
