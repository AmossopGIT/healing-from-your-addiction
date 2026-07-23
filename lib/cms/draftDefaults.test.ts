import { describe, expect, it } from "vitest";
import { withDraftDefaults } from "@/lib/cms/draftDefaults";

describe("withDraftDefaults", () => {
  it("fills required database fields for minimal draft input", () => {
    const result = withDraftDefaults({
      slug: "my-new-post",
      title: "My New Post Title For Draft Testing",
      description: "",
      excerpt: "",
      h1: "",
      primaryKeyword: "",
      secondaryKeywords: [],
      categorySlug: "",
      tagSlugs: [],
      sections: [],
      heroArtId: "",
      heroArtSrc: "",
      heroArtAlt: "",
    });

    expect(result.description).toContain("My New Post Title");
    expect(result.h1).toBe("My New Post Title For Draft Testing");
    expect(result.categorySlug).toBe("addiction-recovery");
    expect(result.heroArtSrc).toContain("/art/watercolor/");
    expect(result.sections.length).toBeGreaterThan(0);
  });

  it("keeps bullet-only listicle sections instead of replacing with placeholder", () => {
    const sections = [
      {
        h2: "Genetic Causes",
        paragraphs: [] as string[],
        bullets: ["Family history of addiction", "Inherited susceptibility"],
      },
    ];

    const result = withDraftDefaults({
      slug: "addiction-caused-by",
      title: "Addiction Caused By Common Factors",
      description: "Discover the real causes of addiction and how healing begins.",
      excerpt: "Discover the real causes of addiction.",
      h1: "Addiction Caused By Common Factors",
      primaryKeyword: "addiction causes",
      secondaryKeywords: [],
      categorySlug: "addiction-recovery",
      tagSlugs: ["addiction-recovery"],
      sections,
      heroArtId: "blog-addiction-caused-by",
      heroArtSrc: "/art/watercolor/art-watercolor-home-hero.png",
      heroArtAlt: "Minimal watercolor illustration for addiction causes.",
    });

    expect(result.sections).toEqual(sections);
    expect(result.sections[0].paragraphs.join("")).not.toContain("Draft article about");
  });
});
