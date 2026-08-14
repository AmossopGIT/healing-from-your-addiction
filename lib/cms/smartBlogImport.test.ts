import { describe, expect, it } from "vitest";
import { looksLikeBlogTemplate, parseSmartBlogImport } from "@/lib/cms/smartBlogImport";

const TEMPLATE = `TITLE:
Signs of Behavioral Addictions in Daily Life

META DESCRIPTION:
Learn the common signs of behavioral addictions and when to seek support.

SEO KEYWORDS:
signs of behavioral addictions, behavioral addiction triggers

CATEGORY:
addiction-recovery

TAGS:
addiction-recovery, behavioral-addictions

--- BODY ---

## Opening section

First paragraph with detail.

## Next section

More content.

--- END BODY ---
`;

const CHATGPT_ARTICLE = `# Why People Notice Pattern Loops Early

Many people notice small changes in routine before they have a name for what is happening.

## What support can look like

Calm support often starts with naming the pattern without shame.

- Point one
- Point two

## A next step

Confidential guidance can help when the loop starts to dominate the day.
`;

describe("looksLikeBlogTemplate", () => {
  it("detects labeled templates", () => {
    expect(looksLikeBlogTemplate(TEMPLATE)).toBe(true);
    expect(looksLikeBlogTemplate("TITLE:\nHello\n\n--- BODY ---\n\nHi\n")).toBe(true);
  });

  it("rejects plain markdown articles", () => {
    expect(looksLikeBlogTemplate(CHATGPT_ARTICLE)).toBe(false);
  });
});

describe("parseSmartBlogImport", () => {
  it("parses labeled writer templates", () => {
    const { result, error } = parseSmartBlogImport(TEMPLATE);
    expect(error).toBeUndefined();
    expect(result?.kind).toBe("template");
    expect(result?.data.title).toContain("Signs of Behavioral Addictions");
    expect(result?.data.categorySlug).toBe("addiction-recovery");
    expect(result?.data.sections.length).toBeGreaterThanOrEqual(2);
  });

  it("parses plain ChatGPT-style markdown into form fields", () => {
    const { result, error } = parseSmartBlogImport(CHATGPT_ARTICLE);
    expect(error).toBeUndefined();
    expect(result?.kind).toBe("article");
    expect(result?.data.title).toBe("Why People Notice Pattern Loops Early");
    expect(result?.data.slug).toBe("why-people-notice-pattern-loops-early");
    expect(result?.data.h1).toBe("Why People Notice Pattern Loops Early");
    expect(result?.data.excerpt).toContain("Many people notice small changes");
    expect(result?.data.description).toContain("Many people notice small changes");
    expect(result?.data.tagSlugs).toEqual([]);
    expect(result?.data.categorySlug).toBe("");
    expect(result?.data.sections.some((section) => section.h2 === "What support can look like")).toBe(true);
  });

  it("suggests SEO fields for a plain article when the topic is clear", () => {
    const { result, error } = parseSmartBlogImport(`# Signs of Behavioral Addictions

    Behavioral addictions can affect routines, relationships, and wellbeing. Understanding the pattern is a useful first step.

## Finding support

    Confidential support for behavioral addictions can help you explore practical next steps.
`);
    expect(error).toBeUndefined();
    expect(result?.data.primaryKeyword).toBe("behavioral addictions support");
    expect(result?.data.categorySlug).toBe("behavioral-addictions");
    expect(result?.data.tagSlugs).toContain("behavioral-addictions");
    expect(result?.data.description.length).toBeGreaterThan(100);
  });

  it("uses a plain first line as title when there is no H1", () => {
    const { result, error } = parseSmartBlogImport(`Calm Support Starts With Naming the Loop

An opening paragraph after the headline.

## Second section

Body copy.`);
    expect(error).toBeUndefined();
    expect(result?.kind).toBe("article");
    expect(result?.data.title).toBe("Calm Support Starts With Naming the Loop");
    expect(result?.data.excerpt).toContain("opening paragraph");
  });

  it("returns an error for empty paste", () => {
    const { result, error } = parseSmartBlogImport("   ");
    expect(result).toBeNull();
    expect(error).toContain("empty");
  });
});
