import { describe, expect, it } from "vitest";
import { INTERACTIVE_PROGRAMME_SLUGS } from "@/content/interactiveProgrammes";
import { buildProgrammeDocs } from "@/content/programmeDocs/buildProgrammeDocs";
import {
  expectedProgrammeDocCount,
  getProgrammeDocModules,
  listProgrammeDocSlugs,
} from "@/content/programmeDocs";

describe("programme docs registry", () => {
  it("returns three guides for every interactive programme slug", () => {
    expect(listProgrammeDocSlugs()).toEqual([...INTERACTIVE_PROGRAMME_SLUGS]);
    expect(expectedProgrammeDocCount()).toBe(3);

    for (const slug of INTERACTIVE_PROGRAMME_SLUGS) {
      const docs = getProgrammeDocModules(slug);
      expect(docs).toHaveLength(3);
      expect(docs.map((doc) => doc.slug)).toEqual(["overview", "week-1-guide", "homework-sheet"]);
      expect(docs.every((doc) => doc.addictionSlug === slug)).toBe(true);
    }
  });

  it("keeps the authored gambling overview title", () => {
    const docs = getProgrammeDocModules("gambling");
    expect(docs[0]?.title).toBe("Gambling programme overview");
    expect(docs[0]?.bodyMarkdown).toContain("not a medical diagnosis or a cure claim");
  });

  it("generates an overview that names the programme and avoids cure claims", () => {
    const docs = buildProgrammeDocs({
      slug: "alcohol",
      title: "Alcohol Addiction (Alcohol Use Disorder)",
      category: "substance",
      concern: "Alcohol",
    });
    expect(docs[0]?.bodyMarkdown).toContain("Alcohol Addiction (Alcohol Use Disorder) overview");
    expect(docs[0]?.bodyMarkdown).toContain("not a medical diagnosis or a cure claim");
    expect(docs[0]?.bodyMarkdown).toContain("qualified clinician");
    expect(docs[1]?.bodyMarkdown.toLowerCase()).toContain("alcohol");
  });
});
