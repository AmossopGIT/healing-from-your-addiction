/**
 * Workflow for future blog chunks:
 * 1. Add page ids/slugs to extract-blog-chunk.mjs
 * 2. Run: node tools/site-archiver/scripts/extract-blog-chunk.mjs
 * 3. Update metaBySlug in this file, then run this script
 * 4. Import new chunk in content/blog.ts and generate watercolor images (blog-{slug})
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../chunk2-blog-data.json"), "utf8"));

const metaBySlug = {
  "signs-of-behavioral-addictions": {
    categorySlug: "addiction-recovery",
    tagSlugs: ["addiction-recovery", "hypnotherapy", "relapse-prevention", "south-africa"],
    primaryKeyword: "signs of behavioral addictions",
    secondaryKeywords: [
      "behavioral addiction symptoms",
      "process addiction signs",
      "gambling and social media addiction signs",
      "addiction pattern loop",
    ],
    publishedAt: "2026-04-28",
  },
  "signs-of-substance-addictions": {
    categorySlug: "addiction-recovery",
    tagSlugs: ["addiction-recovery", "physical-dependence", "psychological-dependence", "south-africa"],
    primaryKeyword: "signs of substance addictions",
    secondaryKeywords: [
      "substance addiction withdrawal signs",
      "physical dependence symptoms",
      "alcohol and nicotine addiction signs",
      "when to seek addiction help",
    ],
    publishedAt: "2026-04-26",
  },
  "one-unified-model-of-addiction": {
    categorySlug: "healing-program",
    tagSlugs: ["healing-program", "hypnotherapy", "addiction-recovery", "relapse-prevention"],
    primaryKeyword: "unified model of addiction",
    secondaryKeywords: [
      "addiction loop model",
      "trigger craving behavior reward",
      "behavioral and substance addiction patterns",
      "breaking addiction loops",
    ],
    publishedAt: "2026-04-22",
  },
  "the-core-pattern-behind-all-addictions": {
    categorySlug: "healing-program",
    tagSlugs: ["healing-program", "addiction-recovery", "hypnotherapy", "relapse-prevention"],
    primaryKeyword: "core pattern behind all addictions",
    secondaryKeywords: [
      "addiction habit loop",
      "trigger craving behavior relief repeat",
      "pattern focused addiction support",
      "how addictions reinforce",
    ],
    publishedAt: "2026-04-20",
  },
  "addictions-develop-from-a-combination-of-biological-psychological-and-environmental-factors": {
    categorySlug: "addiction-recovery",
    tagSlugs: ["addiction-recovery", "psychological-dependence", "south-africa", "eft"],
    primaryKeyword: "why addictions develop biological psychological environmental",
    secondaryKeywords: [
      "causes of addiction",
      "addiction risk factors",
      "trauma and addiction patterns",
      "habit loop and environment",
    ],
    publishedAt: "2026-04-18",
  },
};

function excerptFrom(post) {
  const intro = post.sections.find((s) => s.h2 === "Overview")?.paragraphs?.[0];
  if (intro) return intro.replace(/\*\*/g, "").slice(0, 220);
  return post.description;
}

const posts = data.map((post) => {
  const meta = metaBySlug[post.slug];
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    excerpt: excerptFrom(post),
    h1: post.h1,
    primaryKeyword: meta.primaryKeyword,
    secondaryKeywords: meta.secondaryKeywords,
    categorySlug: meta.categorySlug,
    tagSlugs: meta.tagSlugs,
    heroArtId: `blog-${post.slug}`,
    publishedAt: meta.publishedAt,
    sections: post.sections,
  };
});

const out = `import type { BlogPost } from "@/content/blog";

/** Archive-imported posts (chunk 2). */
export const blogPostsChunk2: BlogPost[] = ${JSON.stringify(posts, null, 2)} as BlogPost[];
`;

fs.writeFileSync(path.resolve(__dirname, "../../../content/blogArchiveChunk2.ts"), out);
console.log("Wrote content/blogArchiveChunk2.ts");
