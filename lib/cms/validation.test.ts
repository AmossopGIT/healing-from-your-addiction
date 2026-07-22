import { describe, expect, it } from "vitest";
import { sanitizeSlug } from "@/lib/cms/formValidation";
import { validateBlogPublish, type PublishableBlogInput } from "@/lib/cms/validation";

function baseInput(overrides: Partial<PublishableBlogInput> = {}): PublishableBlogInput {
  return {
    slug: "addiction-caused-by",
    title: "Addiction Caused By Common Factors",
    description: "Discover the real causes of addiction and how healing begins by treating the root cause with calm support.",
    excerpt: "Discover the real causes of addiction and how healing begins by treating the root cause.",
    h1: "Addiction Caused By Common Factors",
    primaryKeyword: "addiction causes",
    secondaryKeywords: ["recovery"],
    categorySlug: "addiction-recovery",
    tagSlugs: ["addiction-recovery"],
    sections: [
      {
        h2: "Introduction",
        paragraphs: ["Addiction rarely has a single cause."],
      },
      {
        h2: "Genetic Causes",
        paragraphs: [],
        bullets: ["Family history of addiction", "Inherited susceptibility"],
      },
    ],
    heroArtId: "blog-addiction-caused-by",
    heroArtSrc: "/art/watercolor/art-watercolor-home-hero.png",
    heroArtAlt: "Minimal watercolor illustration introducing addiction causes for calm recovery support.",
    ...overrides,
  };
}

describe("sanitizeSlug", () => {
  it("slugifies titles pasted into the slug field", () => {
    expect(sanitizeSlug("Addiction Caused By…")).toBe("addiction-caused-by");
    expect(sanitizeSlug("addiction caused by…")).toBe("addiction-caused-by");
  });

  it("keeps already-valid slugs", () => {
    expect(sanitizeSlug("addiction-caused-by")).toBe("addiction-caused-by");
  });
});

describe("validateBlogPublish", () => {
  it("allows bullet-only sections from listicle imports", () => {
    const result = validateBlogPublish(baseInput());
    expect(result).toEqual({ ok: true });
  });

  it("rejects sections with no body copy", () => {
    const result = validateBlogPublish(
      baseInput({
        sections: [{ h2: "Empty", paragraphs: [], bullets: [] }],
      }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.includes("paragraph, bullet list, or H3"))).toBe(true);
    }
  });

  it("rejects invalid slugs", () => {
    const result = validateBlogPublish(baseInput({ slug: "addiction caused by…" }));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((error) => error.toLowerCase().includes("slug"))).toBe(true);
    }
  });
});
