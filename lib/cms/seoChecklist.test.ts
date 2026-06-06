import { describe, expect, it } from "vitest";
import { evaluateBlogSeoChecklist } from "@/lib/cms/seoChecklist";

describe("evaluateBlogSeoChecklist", () => {
  it("flags missing primary keyword and short meta description", () => {
    const items = evaluateBlogSeoChecklist({
      title: "Short",
      description: "Too short",
      h1: "Short",
      primaryKeyword: "",
      secondaryKeywords: [],
      slug: "short",
      categorySlug: "",
      tagSlugs: [],
      sections: [{ h2: "Intro", paragraphs: ["Body copy."] }],
      heroArtAlt: "Short alt",
    });

    const primaryKeyword = items.find((item) => item.id === "primary-keyword");
    const metaDescription = items.find((item) => item.id === "meta-description");
    expect(primaryKeyword?.severity).toBe("error");
    expect(metaDescription?.severity).toBe("error");
  });

  it("passes a well-formed SEO profile", () => {
    const items = evaluateBlogSeoChecklist({
      title: "Signs of Behavioral Addictions in Daily Life",
      description:
        "Learn the common signs of behavioral addictions, how triggers show up in daily routines, and when to seek confidential support in South Africa.",
      h1: "Signs of Behavioral Addictions",
      primaryKeyword: "signs of behavioral addictions",
      secondaryKeywords: ["behavioral addiction triggers"],
      slug: "signs-of-behavioral-addictions",
      categorySlug: "addiction-recovery",
      tagSlugs: ["addiction-recovery"],
      sections: [
        {
          h2: "Opening section",
          paragraphs: ["Signs of behavioral addictions often begin subtly in daily routines."],
        },
        {
          h2: "Next section",
          paragraphs: ["See our [contact page](/contact/) for confidential support."],
        },
      ],
      heroArtAlt: "Watercolor illustration showing signs of behavioral addictions and recovery support.",
    });

    expect(items.filter((item) => item.severity === "error")).toHaveLength(0);
  });
});
