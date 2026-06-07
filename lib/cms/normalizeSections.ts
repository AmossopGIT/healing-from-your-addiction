import type { BlogSection } from "@/content/blog";

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function normalizeSection(section: unknown): BlogSection | null {
  if (!section || typeof section !== "object") return null;

  const raw = section as Partial<BlogSection>;
  const paragraphs = normalizeStringArray(raw.paragraphs);
  const h3Items = Array.isArray(raw.h3Items)
    ? raw.h3Items
        .filter((item): item is { h3: string; body: string } => Boolean(item && typeof item === "object"))
        .map((item) => ({
          h3: typeof item.h3 === "string" ? item.h3 : "",
          body: typeof item.body === "string" ? item.body : "",
        }))
    : undefined;

  const bullets = raw.bullets ? normalizeStringArray(raw.bullets) : undefined;

  return {
    h2: typeof raw.h2 === "string" ? raw.h2 : "",
    paragraphs: paragraphs.length ? paragraphs : [""],
    h3Items: h3Items?.length ? h3Items : undefined,
    bullets: bullets?.length ? bullets : undefined,
    video: raw.video,
    artId: typeof raw.artId === "string" ? raw.artId : undefined,
  };
}

export function normalizeBlogSections(value: unknown): BlogSection[] {
  if (!Array.isArray(value)) return [];
  return value.map(normalizeSection).filter((section): section is BlogSection => section !== null);
}
