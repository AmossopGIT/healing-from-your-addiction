import { INTERACTIVE_PROGRAMME_SLUGS, getInteractiveProgramme } from "@/content/interactiveProgrammes";
import { buildProgrammeDocs } from "@/content/programmeDocs/buildProgrammeDocs";
import { gamblingProgrammeDocs } from "@/content/programmeDocs/gambling";
import type { ProgrammeDocModule } from "@/content/programmeDocs/types";
import { programmeBySlug } from "@/content/programmes";

export type { ProgrammeDocModule } from "@/content/programmeDocs/types";

const EXPECTED_DOC_SLUGS = ["overview", "week-1-guide", "homework-sheet"] as const;

/** Authored gambling pack, or generated calm template for every other interactive slug. */
export function getProgrammeDocModules(addictionSlug: string): ProgrammeDocModule[] {
  if (addictionSlug === "gambling") {
    return gamblingProgrammeDocs;
  }

  const interactive = getInteractiveProgramme(addictionSlug);
  if (!interactive) return [];

  const marketing = programmeBySlug.get(addictionSlug);
  return buildProgrammeDocs({
    slug: interactive.slug,
    title: interactive.title,
    category: interactive.category,
    concern: marketing?.concern,
  });
}

export function getProgrammeDocModule(addictionSlug: string, slug: string) {
  return getProgrammeDocModules(addictionSlug).find((doc) => doc.slug === slug) ?? null;
}

/** Expected guide count for catalogue UI chips. */
export function expectedProgrammeDocCount() {
  return EXPECTED_DOC_SLUGS.length;
}

/** All interactive slugs that should receive the 3-guide pack when seeding. */
export function listProgrammeDocSlugs() {
  return [...INTERACTIVE_PROGRAMME_SLUGS];
}

export function countProgrammeDocModules(addictionSlug: string) {
  return getProgrammeDocModules(addictionSlug).length;
}
