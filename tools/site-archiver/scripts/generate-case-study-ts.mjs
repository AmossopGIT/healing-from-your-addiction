import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunk = process.env.CASE_STUDY_CHUNK || "a";
const chunkLabel = { a: "1", b: "2", c: "3" }[chunk];
const data = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, `../chunk-${chunk}-case-study-data.json`), "utf8"),
);

function excerptFrom(post, description) {
  const intro = post.sections.find((s) => s.h2 === "Overview")?.paragraphs?.[0];
  const raw = intro || description;
  return raw.replace(/\*\*/g, "").replace(/^Case Study \d+[^.]*\.?\s*/i, "").slice(0, 220);
}

function cleanSections(sections, seoTitle) {
  return sections
    .filter((section) => {
      if (/^Case Study \d+/i.test(section.h2)) return false;
      if (section.h2 === "Overview" && !section.paragraphs.length && !section.h3Items?.length) {
        return false;
      }
      return true;
    })
    .map((section, index) => {
      if (index === 0 && section.h2 === "Overview") {
        return {
          ...section,
          h2: "Overview",
        };
      }
      return section;
    });
}

function primaryKeyword(reg) {
  const addiction = reg.addictionSlug.replace(/-/g, " ");
  const typeLabels = {
    outcome: "addiction recovery case study",
    script: "EFT tapping script addiction",
    questions: "hypnotherapy intake questions addiction",
    affirmations: "addiction recovery affirmations",
    programme: "4 week addiction healing program",
  };
  const base = typeLabels[reg.kind] || "addiction case study";
  return `${addiction} ${base}`.replace(/\s+/g, " ").trim();
}

function secondaryKeywords(reg) {
  const addiction = reg.addictionSlug.replace(/-/g, " ");
  const shared = [
    "hypnotherapy addiction support",
    "Healing From Your Addiction resources",
    "South Africa addiction support",
  ];
  const byKind = {
    outcome: ["real world recovery example", "HAHM model outcome", `${addiction} pattern change`],
    script: ["emotionally focused therapy script", "EFT for cravings", `${addiction} hypnotherapy script`],
    questions: ["custom healing program questions", "addiction assessment questions", `${addiction} hypnotherapy intake`],
    affirmations: ["daily affirmations addiction", "performance and coping affirmations", `${addiction} self talk support`],
    programme: ["structured addiction healing sessions", "4 week hypnotherapy program", `${addiction} program outline`],
  };
  return [...(byKind[reg.kind] || []), ...shared].slice(0, 5);
}

function tagSlugs(reg) {
  const tags = [reg.addictionSlug, reg.kind, "case-study", "hypnotherapy"];
  if (reg.kind === "outcome") tags.push("addiction-recovery", "healing-program");
  if (reg.kind === "script" || reg.kind === "affirmations") tags.push("eft");
  return [...new Set(tags)];
}

const studies = data.map((post) => {
  const reg = post.registry;
  const slug = reg.canonicalSlug;
  const title = reg.seoTitle;
  const description = reg.seoDescription || post.description.slice(0, 160);

  return {
    slug,
    legacySlug: reg.legacySlug,
    archivePageId: reg.id,
    title,
    description,
    excerpt: excerptFrom(post, description),
    h1: title,
    primaryKeyword: primaryKeyword(reg),
    secondaryKeywords: secondaryKeywords(reg),
    caseStudyType: reg.kind,
    addictionSlug: reg.addictionSlug,
    tagSlugs: tagSlugs(reg),
    heroArtId: `case-study-${slug}`,
    publishedAt: post.publishedAt,
    sections: cleanSections(post.sections, title),
  };
});

const out = `import type { CaseStudy } from "@/content/caseStudies";

/** Archive-imported case studies (batch ${chunk}). */
export const caseStudyArchiveChunk${chunkLabel}: CaseStudy[] = ${JSON.stringify(studies, null, 2)} as CaseStudy[];
`;

fs.writeFileSync(path.resolve(__dirname, `../../../content/caseStudyArchiveChunk${chunkLabel}.ts`), out);
console.log(`Wrote content/caseStudyArchiveChunk${chunkLabel}.ts (${studies.length} studies)`);
