import type { BlogSection } from "@/content/blog";

const INTERNAL_LINK_PATTERN = /\[([^\]]+)\]\(\/[^)]+\)/g;

export function extractInternalLinksFromText(text: string): string[] {
  const links: string[] = [];
  for (const match of text.matchAll(INTERNAL_LINK_PATTERN)) {
    const hrefMatch = match[0].match(/\]\((\/[^)]+)\)/);
    if (hrefMatch?.[1]) links.push(hrefMatch[1]);
  }
  return links;
}

export function allSectionText(sections: BlogSection[]): string {
  const chunks: string[] = [];
  for (const section of sections) {
    chunks.push(section.h2);
    chunks.push(...(section.paragraphs ?? []));
    if (section.bullets) chunks.push(...section.bullets);
    if (section.h3Items) {
      for (const item of section.h3Items) {
        chunks.push(item.h3, item.body);
      }
    }
  }
  return chunks.join("\n");
}

export function countInternalLinks(sections: BlogSection[]): number {
  return extractInternalLinksFromText(allSectionText(sections)).length;
}

export function hasMinimumInternalLinks(sections: BlogSection[], minimum = 2): boolean {
  return countInternalLinks(sections) >= minimum;
}
