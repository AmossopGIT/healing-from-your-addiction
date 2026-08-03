/**
 * Workflow for future blog chunks:
 * 1. Add page ids/slugs to blog-chunk-pages.mjs
 * 2. BLOG_CHUNK=3 node tools/site-archiver/scripts/extract-blog-chunk.mjs
 * 3. Add metaBySlug for the chunk below, then:
 *    BLOG_CHUNK=3 node tools/site-archiver/scripts/generate-blog-chunk-ts.mjs
 * 4. Import blogPostsChunkN in content/blog.ts and generate blog-{slug} watercolor images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const chunk = process.env.BLOG_CHUNK || "3";
const data = JSON.parse(fs.readFileSync(path.resolve(__dirname, `../chunk${chunk}-blog-data.json`), "utf8"));

const metaByChunk = {
  2: {
    "signs-of-behavioral-addictions": {
      categorySlug: "addiction-recovery",
      tagSlugs: ["addiction-recovery", "hypnotherapy", "relapse-prevention", "south-africa", "behavioral-addictions"],
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
      tagSlugs: ["addiction-recovery", "physical-dependence", "psychological-dependence", "south-africa", "substance-addictions"],
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
      tagSlugs: ["healing-program", "hypnotherapy", "addiction-recovery", "relapse-prevention", "addiction-model"],
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
      tagSlugs: ["healing-program", "addiction-recovery", "hypnotherapy", "relapse-prevention", "core-pattern"],
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
  },
  3: {
    "cross-addictions": {
      categorySlug: "addiction-recovery",
      tagSlugs: ["addiction-recovery", "cross-addictions", "relapse-prevention", "hypnotherapy"],
      primaryKeyword: "cross addictions explained",
      secondaryKeywords: [
        "substitution addiction patterns",
        "multiple addiction loops",
        "behavioral and substance cross addiction",
        "addiction transfer patterns",
      ],
      publishedAt: "2026-05-12",
    },
    "hypnotherapy-addiction-healing-model-hahm-model": {
      categorySlug: "healing-program",
      tagSlugs: ["healing-program", "hypnotherapy", "hahm-model", "addiction-model"],
      primaryKeyword: "HAHM hypnotherapy addiction healing model",
      secondaryKeywords: [
        "hypnotherapy addiction healing model",
        "structured addiction hypnotherapy program",
        "4 week addiction healing sessions",
        "subconscious addiction pattern support",
      ],
      publishedAt: "2026-05-10",
    },
    "hypnotherapy-addiction-teaching-and-education-model-htem-model": {
      categorySlug: "healing-program",
      tagSlugs: ["healing-program", "hypnotherapy", "htem-model", "addiction-model"],
      primaryKeyword: "HTEM hypnotherapy addiction education model",
      secondaryKeywords: [
        "hypnotherapy addiction teaching model",
        "addiction education framework",
        "understanding addiction patterns",
        "client education addiction recovery",
      ],
      publishedAt: "2026-05-08",
    },
    "core-themes-in-website-healing-from-your-addiction-using-hypnotherapy": {
      categorySlug: "hypnotherapy",
      tagSlugs: ["hypnotherapy", "healing-program", "addiction-recovery", "core-pattern"],
      primaryKeyword: "hypnotherapy for addiction patterns",
      secondaryKeywords: [
        "subconscious addiction patterns",
        "addiction as learned pattern",
        "pattern focused hypnotherapy support",
        "craving and habit loop hypnotherapy",
      ],
      publishedAt: "2026-05-06",
    },
    "core-topics-covered-in-the-website-healing-from-your-addiction-using-hypnotherapy": {
      categorySlug: "hypnotherapy",
      tagSlugs: ["hypnotherapy", "healing-program", "addiction-recovery", "south-africa"],
      primaryKeyword: "addiction hypnotherapy core topics",
      secondaryKeywords: [
        "addiction support topics",
        "hypnotherapy addiction education topics",
        "behavioral and substance addiction help topics",
        "recovery and trigger awareness topics",
      ],
      publishedAt: "2026-05-04",
    },
    "gambling-addiction-gambling-disorder-healing-program": {
      categorySlug: "healing-program",
      tagSlugs: ["healing-program", "hypnotherapy", "gambling-program", "relapse-prevention"],
      primaryKeyword: "gambling disorder hypnotherapy healing program",
      secondaryKeywords: [
        "gambling addiction healing program",
        "8 session gambling hypnotherapy program",
        "betting urge support South Africa",
        "gambling pattern interruption program",
      ],
      publishedAt: "2026-05-02",
    },
  },
};

const metaBySlug = metaByChunk[chunk];
if (!metaBySlug) {
  throw new Error(`Missing metaByChunk[${chunk}] in generate-blog-chunk-ts.mjs`);
}

function excerptFrom(post) {
  const intro = post.sections.find((s) => s.h2 === "Overview")?.paragraphs?.[0];
  if (intro) return intro.replace(/\*\*/g, "").slice(0, 220);
  return post.description;
}

const posts = data.map((post) => {
  const meta = metaBySlug[post.slug];
  if (!meta) {
    throw new Error(`Missing meta for slug: ${post.slug}`);
  }
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

/** Archive-imported posts (chunk ${chunk}). */
export const blogPostsChunk${chunk}: BlogPost[] = ${JSON.stringify(posts, null, 2)} as BlogPost[];
`;

fs.writeFileSync(path.resolve(__dirname, `../../../content/blogArchiveChunk${chunk}.ts`), out);
console.log(`Wrote content/blogArchiveChunk${chunk}.ts`);
