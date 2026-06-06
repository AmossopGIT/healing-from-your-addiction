import { describe, expect, it } from "vitest";
import { bodyTextToSections } from "@/lib/cms/bodyToSections";
import { slugifyTitle } from "@/lib/cms/slugify";
import { parseBlogTemplateDocument } from "@/lib/cms/templateImport";

const SAMPLE = `TITLE:
Signs of Behavioral Addictions in Daily Life

SLUG:


META DESCRIPTION:
Learn the common signs of behavioral addictions, how triggers show up in daily routines, and when to seek confidential support in South Africa.

SEO KEYWORDS:
signs of behavioral addictions, behavioral addiction triggers, addiction recovery support

H1:
Signs of Behavioral Addictions

EXCERPT:
Recognize the early signs of behavioral addictions and understand when pattern-focused support may help.

CATEGORY:
addiction-recovery

TAGS:
addiction-recovery, behavioral-addictions, relapse-prevention

PUBLISH DATE:
2026-06-01

AUTHOR:
Editorial Team

AUTHOR ROLE:
Content team

--- BODY ---

## Opening section

First paragraph with **bold** and [internal links](/contact/).

## Next section

More content here.

- Bullet one
- Bullet two

--- END BODY ---

INTERNAL NOTES (not published):
For June newsletter
`;

describe("slugifyTitle", () => {
  it("creates a URL-safe slug from a title", () => {
    expect(slugifyTitle("Signs of Behavioral Addictions!")).toBe("signs-of-behavioral-addictions");
  });
});

describe("bodyTextToSections", () => {
  it("maps markdown headings and bullets into structured sections", () => {
    const sections = bodyTextToSections(`## Opening section

First paragraph.

## Next section

Second paragraph.

- Bullet one
- Bullet two`);

    expect(sections).toHaveLength(2);
    expect(sections[0].h2).toBe("Opening section");
    expect(sections[0].paragraphs[0]).toContain("First paragraph.");
    expect(sections[1].bullets).toEqual(["Bullet one", "Bullet two"]);
  });
});

describe("parseBlogTemplateDocument", () => {
  it("parses labeled template fields and body", () => {
    const { data, error } = parseBlogTemplateDocument(SAMPLE);
    expect(error).toBeUndefined();
    expect(data?.title).toContain("Signs of Behavioral Addictions");
    expect(data?.slug).toBe("signs-of-behavioral-addictions-in-daily-life");
    expect(data?.primaryKeyword).toBe("signs of behavioral addictions");
    expect(data?.secondaryKeywords).toEqual(["behavioral addiction triggers", "addiction recovery support"]);
    expect(data?.categorySlug).toBe("addiction-recovery");
    expect(data?.tagSlugs).toEqual(["addiction-recovery", "behavioral-addictions", "relapse-prevention"]);
    expect(data?.sections[0].paragraphs[0]).toContain("[internal links](/contact/)");
    expect(data?.internalNotes).toContain("June newsletter");
  });

  it("returns an error when title is missing", () => {
    const { data, error } = parseBlogTemplateDocument("META DESCRIPTION:\nTest\n\n--- BODY ---\n\nBody\n\n--- END BODY ---");
    expect(data).toBeNull();
    expect(error).toContain("Missing TITLE");
  });

  it("returns an error when body markers are missing", () => {
    const { data, error } = parseBlogTemplateDocument("TITLE:\nTest title\n\nMETA DESCRIPTION:\nDesc");
    expect(data).toBeNull();
    expect(error).toContain("Missing body");
  });

  it("skips placeholder values", () => {
    const { data } = parseBlogTemplateDocument(`TITLE:
Real Article Title Here For Testing Purposes

SLUG:
(optional-url-slug-or-leave-blank-to-auto-generate)

META DESCRIPTION:
This is a valid meta description long enough for search previews and social cards in Google results for readers.

SEO KEYWORDS:
behavioral addiction, recovery support

--- BODY ---

## Section one

Paragraph text.

--- END BODY ---`);

    expect(data?.slug).toBe("real-article-title-here-for-testing-purposes");
  });
});
