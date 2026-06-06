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
});
