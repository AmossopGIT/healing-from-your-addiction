import type { BlogSection } from "@/content/blog";
import { caseStudyArchiveChunk1 } from "@/content/caseStudyArchiveChunk1";
import { caseStudyArchiveChunk2 } from "@/content/caseStudyArchiveChunk2";
import { caseStudyArchiveChunk3 } from "@/content/caseStudyArchiveChunk3";

export type CaseStudyType = "outcome" | "script" | "questions" | "affirmations" | "programme";

export type CaseStudy = {
  slug: string;
  legacySlug: string;
  archivePageId: string;
  title: string;
  description: string;
  excerpt: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  caseStudyType: CaseStudyType;
  addictionSlug: string;
  tagSlugs: string[];
  heroArtId: string;
  publishedAt: string;
  sections: BlogSection[];
};

export const caseStudyTypeLabels: Record<CaseStudyType, string> = {
  outcome: "Outcome story",
  script: "EFT / therapy script",
  questions: "Programme questions",
  affirmations: "Affirmations",
  programme: "Programme outline",
};

export const caseStudyTypes: CaseStudyType[] = ["outcome", "script", "programme", "questions", "affirmations"];

export const caseStudies: CaseStudy[] = [
  ...caseStudyArchiveChunk1,
  ...caseStudyArchiveChunk2,
  ...caseStudyArchiveChunk3,
].sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1));

export const caseStudyBySlug = new Map(caseStudies.map((study) => [study.slug, study] as const));
export const caseStudyByLegacySlug = new Map(caseStudies.map((study) => [study.legacySlug, study] as const));

export function caseStudyPath(slug: string) {
  return `/case-studies/${slug}/`;
}

export function getCaseStudiesByType(type: CaseStudyType) {
  return caseStudies.filter((study) => study.caseStudyType === type);
}

export function getCaseStudiesByAddiction(addictionSlug: string) {
  return caseStudies.filter((study) => study.addictionSlug === addictionSlug);
}

export function getFeaturedCaseStudies(limit = 3) {
  return getCaseStudiesByType("outcome").slice(0, limit);
}

const caseStudyHeroArtIds = new Set<string>();
for (const study of caseStudies) {
  if (caseStudyHeroArtIds.has(study.heroArtId)) {
    throw new Error(`Duplicate case study heroArtId detected: ${study.heroArtId}`);
  }
  caseStudyHeroArtIds.add(study.heroArtId);
  const expectedId = `case-study-${study.slug}`;
  if (study.heroArtId !== expectedId) {
    throw new Error(`Case study heroArtId must be "${expectedId}" for slug "${study.slug}".`);
  }
}
