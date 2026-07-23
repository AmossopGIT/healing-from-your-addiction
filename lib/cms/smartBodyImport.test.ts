import { describe, expect, it } from "vitest";
import {
  bodyHasReplaceableContent,
  isDraftPlaceholderSections,
  parseSmartBodyImport,
} from "@/lib/cms/smartBodyImport";

describe("parseSmartBodyImport", () => {
  it("parses markdown ## sections without touching title fields", () => {
    const { result, error } = parseSmartBodyImport(`## Why it feels like weakness

People often blame willpower.

## What actually drives the loop

- Stress
- Habit pathways
`);

    expect(error).toBeUndefined();
    expect(result?.source).toBe("markdown");
    expect(result?.sections).toHaveLength(2);
    expect(result?.sections[0].h2).toBe("Why it feels like weakness");
    expect(result?.sections[0].paragraphs[0]).toContain("willpower");
    expect(result?.sections[1].bullets).toEqual(["Stress", "Habit pathways"]);
  });

  it("extracts only the BODY block from a writer template paste", () => {
    const { result, error } = parseSmartBodyImport(`TITLE:
Ignored title

META DESCRIPTION:
Ignored

--- BODY ---

## Introduction

Real opening copy.

## Causes

More body.

--- END BODY ---
`);

    expect(error).toBeUndefined();
    expect(result?.source).toBe("template-body");
    expect(result?.sections.map((section) => section.h2)).toEqual(["Introduction", "Causes"]);
  });

  it("returns an error for empty paste", () => {
    const { result, error } = parseSmartBodyImport("   ");
    expect(result).toBeNull();
    expect(error).toMatch(/Paste article body/i);
  });
});

describe("placeholder body detection", () => {
  it("treats draft placeholder as not replaceable content", () => {
    const placeholder = [
      {
        h2: "Introduction",
        paragraphs: [
          "Draft article about why addiction is not about weakness: understanding the real causes — add your opening paragraphs here.",
        ],
      },
    ];

    expect(isDraftPlaceholderSections(placeholder)).toBe(true);
    expect(bodyHasReplaceableContent(placeholder)).toBe(false);
  });

  it("asks to confirm when real body exists", () => {
    const real = [{ h2: "Introduction", paragraphs: ["Real copy staff already wrote."] }];
    expect(isDraftPlaceholderSections(real)).toBe(false);
    expect(bodyHasReplaceableContent(real)).toBe(true);
  });
});
