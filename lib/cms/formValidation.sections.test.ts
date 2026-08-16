import { describe, expect, it } from "vitest";
import { cmsFieldMaxLengths, sanitizeSectionsJson } from "@/lib/cms/formValidation";

describe("sanitizeSectionsJson paragraph limits", () => {
  it("keeps a ~3000 character paragraph after raising the limit to 8000", () => {
    const longParagraph = "a".repeat(3000);
    const raw = JSON.stringify([{ h2: "Introduction", paragraphs: [longParagraph] }]);
    const result = sanitizeSectionsJson(raw);
    expect("error" in result).toBe(false);
    if ("error" in result) return;
    expect(result.sections[0].paragraphs[0]).toHaveLength(3000);
  });

  it("returns listed errors instead of truncating over-limit paragraphs", () => {
    const tooLong = "b".repeat(cmsFieldMaxLengths.sectionText + 50);
    const raw = JSON.stringify([{ h2: "Introduction", paragraphs: [tooLong] }]);
    const result = sanitizeSectionsJson(raw);
    expect("error" in result).toBe(true);
    if (!("error" in result)) return;
    expect(result.errors?.length).toBeGreaterThan(0);
    expect(result.errors?.[0]).toContain("too long");
    expect(result.error).toContain("too long");
  });
});
