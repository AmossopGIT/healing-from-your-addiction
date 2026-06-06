import type { BlogSection } from "@/content/blog";
import { cmsBlogHeroArtId } from "@/lib/cms/mappers";
import type { PublishableBlogInput } from "@/lib/cms/validation";

const DEFAULT_HERO_SRC = "/art/watercolor/art-watercolor-home-hero.png";

function defaultSections(title: string): BlogSection[] {
  return [
    {
      h2: "Introduction",
      paragraphs: [`Draft article about ${title.toLowerCase()} — add your opening paragraphs here.`],
    },
  ];
}

/** Fill required CMS database fields when saving an incomplete draft. */
export function withDraftDefaults(input: PublishableBlogInput): PublishableBlogInput {
  const title = input.title.trim();
  const slug = input.slug.trim();
  const description =
    input.description.trim() ||
    `${title} — educational addiction recovery guidance from Healing From Your Addiction.`;

  return {
    ...input,
    title,
    slug,
    description,
    excerpt: input.excerpt.trim() || description.slice(0, 280),
    h1: input.h1.trim() || title,
    primaryKeyword: input.primaryKeyword.trim() || slug.replace(/-/g, " "),
    categorySlug: input.categorySlug.trim() || "addiction-recovery",
    tagSlugs: input.tagSlugs.length ? input.tagSlugs : ["addiction-recovery"],
    heroArtId: input.heroArtId.trim() || cmsBlogHeroArtId(slug),
    heroArtSrc: input.heroArtSrc.trim() || DEFAULT_HERO_SRC,
    heroArtAlt:
      input.heroArtAlt.trim() ||
      `Minimal watercolor illustration introducing ${title.toLowerCase()} for readers seeking calm addiction recovery support.`,
    sections: input.sections.some((section) => section.h2.trim() || section.paragraphs.some((p) => p.trim()))
      ? input.sections
      : defaultSections(title),
  };
}
