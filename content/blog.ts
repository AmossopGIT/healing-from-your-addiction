import { blogPostsChunk2 } from "@/content/blogArchiveChunk2";
import { blogPostsChunk3 } from "@/content/blogArchiveChunk3";
import { blogPostsChunk4 } from "@/content/blogArchiveChunk4";

export type BlogCategory = {
  slug: string;
  title: string;
  description: string;
  primaryKeyword: string;
  heroArtId: string;
};

export type BlogSectionVideo = {
  title: string;
  description?: string;
  /** YouTube video ID (e.g. jv9ML5VchMY) — embed counts views on YouTube. */
  youtubeId?: string;
  /** Self-hosted MP4 when no youtubeId is set. */
  src?: string;
  posterSrc?: string;
};

export type BlogSectionImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type BlogSectionAudio = {
  title: string;
  src: string;
  description?: string;
};

export type BlogSection = {
  h2: string;
  paragraphs: string[];
  h3Items?: Array<{
    h3: string;
    body: string;
  }>;
  bullets?: string[];
  video?: BlogSectionVideo;
  image?: BlogSectionImage;
  audio?: BlogSectionAudio;
  /** Optional inline section artwork from the watercolor gallery. */
  artId?: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  h1: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  categorySlug: string;
  tagSlugs: string[];
  heroArtId: string;
  publishedAt: string;
  updatedAt?: string;
  sections: BlogSection[];
};

export type BlogTag = {
  slug: string;
  label: string;
};

function createBlogArtId(slug: string) {
  return `blog-${slug}`;
}

export const blogCategories: BlogCategory[] = [
  {
    slug: "healing-program",
    title: "Healing Program",
    description:
      "Pillar content about addiction healing programmes, weekly structure, and how pattern-focused support is delivered.",
    primaryKeyword: "addiction healing program South Africa",
    heroArtId: createBlogArtId("what-makes-hypnotherapy-programs-effective"),
  },
  {
    slug: "hypnotherapy",
    title: "Hypnotherapy",
    description:
      "Educational articles about hypnotherapy, subconscious pattern change, and where it fits in addiction recovery support.",
    primaryKeyword: "hypnotherapy for addiction support",
    heroArtId: createBlogArtId("how-hypnotherapy-works-in-addiction-support"),
  },
  {
    slug: "addiction-recovery",
    title: "Addiction Recovery",
    description:
      "Foundational guidance on recovery patterns, emotional triggers, and practical behaviour change in the South African context.",
    primaryKeyword: "addiction recovery South Africa",
    heroArtId: createBlogArtId("addiction-recovery-south-africa-core-approaches"),
  },
  {
    slug: "behavioral-addictions",
    title: "Behavioral Addictions",
    description:
      "Articles on gambling, shopping, gaming, and other behavioural addiction patterns, including early signs and support options.",
    primaryKeyword: "behavioral addictions support",
    heroArtId: createBlogArtId("signs-of-behavioral-addictions"),
  },
  {
    slug: "gambling-addiction",
    title: "Gambling Addiction",
    description:
      "Focused guidance on gambling addiction patterns, triggers, financial stress, and confidential recovery support.",
    primaryKeyword: "gambling addiction support South Africa",
    heroArtId: createBlogArtId("gambling-addiction-support"),
  },
  {
    slug: "food-addiction",
    title: "Food Addiction",
    description:
      "Educational content on emotional eating, food addiction loops, and calmer pattern-change support.",
    primaryKeyword: "food addiction support",
    heroArtId: createBlogArtId("food-addiction-emotional-eating"),
  },
  {
    slug: "eft-tapping",
    title: "EFT & Tapping",
    description:
      "Articles about EFT, tapping, and emotional regulation tools used alongside addiction recovery support.",
    primaryKeyword: "EFT for addiction support",
    heroArtId: createBlogArtId("eft-tapping-addiction-support"),
  },
  {
    slug: "triggers-cravings",
    title: "Triggers & Cravings",
    description:
      "Practical articles on triggers, cravings, urges, and pause strategies for addiction recovery.",
    primaryKeyword: "addiction triggers and cravings",
    heroArtId: createBlogArtId("understanding-addiction-triggers"),
  },
  {
    slug: "family-support",
    title: "Family & Loved Ones",
    description:
      "Supportive guidance for partners, family members, and loved ones affected by addiction patterns.",
    primaryKeyword: "supporting a loved one with addiction",
    heroArtId: createBlogArtId("supporting-loved-one-addiction"),
  },
  {
    slug: "programme-guides",
    title: "Programme Guides",
    description:
      "How the healing programme works, what to expect week by week, and how to choose the right support path.",
    primaryKeyword: "addiction healing programme guide",
    heroArtId: createBlogArtId("what-makes-hypnotherapy-programs-effective"),
  },
  {
    slug: "south-africa-resources",
    title: "South Africa Resources",
    description:
      "Local context, access, and practical recovery resources for people seeking addiction support in South Africa.",
    primaryKeyword: "addiction recovery resources South Africa",
    heroArtId: createBlogArtId("addiction-recovery-south-africa-core-approaches"),
  },
];

export const blogTags: BlogTag[] = [
  { slug: "addiction-recovery", label: "Addiction recovery" },
  { slug: "hypnotherapy", label: "Hypnotherapy" },
  { slug: "eft", label: "EFT" },
  { slug: "psychological-dependence", label: "Psychological dependence" },
  { slug: "physical-dependence", label: "Physical dependence" },
  { slug: "relapse-prevention", label: "Relapse prevention" },
  { slug: "south-africa", label: "South Africa" },
  { slug: "healing-program", label: "Healing program" },
  { slug: "behavioral-addictions", label: "Behavioral addictions" },
  { slug: "substance-addictions", label: "Substance addictions" },
  { slug: "addiction-model", label: "Addiction model" },
  { slug: "core-pattern", label: "Core pattern" },
  { slug: "cross-addictions", label: "Cross addictions" },
  { slug: "hahm-model", label: "HAHM model" },
  { slug: "htem-model", label: "HTEM model" },
  { slug: "gambling-program", label: "Gambling program" },
];

const blogPostsInitial: BlogPost[] = [
  {
    slug: "what-makes-hypnotherapy-programs-effective",
    title: "What Makes Hypnotherapy Programs Effective",
    description:
      "Learn the core elements of effective hypnotherapy addiction healing programs, including repetition, structured phases, and real-world integration.",
    excerpt:
      "Effective programmes do more than one session. They combine structure, repetition, and practical reinforcement so new responses become daily habits.",
    h1: "What Makes Hypnotherapy Programs Effective",
    primaryKeyword: "effective hypnotherapy addiction healing programs",
    secondaryKeywords: [
      "hypnotherapy addiction healing model",
      "structured addiction program",
      "subconscious reprogramming addiction support",
      "4 week addiction support program",
    ],
    categorySlug: "healing-program",
    tagSlugs: ["hypnotherapy", "healing-program", "addiction-recovery", "relapse-prevention", "south-africa"],
    heroArtId: createBlogArtId("what-makes-hypnotherapy-programs-effective"),
    publishedAt: "2026-05-01",
    updatedAt: "2026-05-12",
    sections: [
      {
        h2: "A program works when it changes the pattern, not just the mood",
        paragraphs: [
          "Many people feel temporary relief after one session, but old triggers can still reactivate the same behaviour loop. A stronger outcome usually comes from a structured programme that repeats key pattern interrupts over time.",
          "The focus is not perfect willpower. The focus is making the old trigger response weaker while making the new response easier to repeat in daily life.",
        ],
      },
      {
        h2: "Five elements that improve outcomes",
        paragraphs: ["The strongest recovery programmes usually include the same foundation elements:"],
        bullets: [
          "Repetition across multiple sessions, instead of one-off intervention.",
          "Work with both emotional triggers and automatic behavioural cues.",
          "Clear weekly phases with a defined goal for each phase.",
          "Subconscious reinforcement that supports calmer decision points.",
          "Practical integration tasks between sessions in real life contexts.",
        ],
      },
      {
        h2: "How weekly structure supports progress",
        paragraphs: [
          "A weekly rhythm allows each step to build on the previous one. Early sessions map triggers and urges, middle sessions reinforce pattern breaks, and later sessions focus on sustainability and relapse prevention.",
        ],
        h3Items: [
          {
            h3: "Week 1: Pattern mapping",
            body: "Identify personal trigger pathways, emotional load, and high-risk moments.",
          },
          {
            h3: "Week 2: Core interruption",
            body: "Practice new responses to cravings with guided subconscious and behavioural techniques.",
          },
          {
            h3: "Week 3: Consolidation",
            body: "Strengthen consistency in daily routines, especially under stress or social pressure.",
          },
          {
            h3: "Week 4: Future-proofing",
            body: "Build a sustainable relapse prevention plan and maintenance routine.",
          },
        ],
      },
    ],
  },
  {
    slug: "how-hypnotherapy-works-in-addiction-support",
    title: "How Hypnotherapy Works in Addiction Support",
    description:
      "Understand how hypnotherapy can support addiction recovery by targeting emotional cues, automatic loops, and subconscious associations.",
    excerpt:
      "Hypnotherapy does not replace medical care when detox is needed. It supports the psychological and behavioural loops that keep cravings active.",
    h1: "How Hypnotherapy Works in Addiction Support",
    primaryKeyword: "how hypnotherapy works in addiction support",
    secondaryKeywords: [
      "hypnotherapy for addiction cravings",
      "psychological dependence support",
      "subconscious addiction pattern change",
      "eft and hypnotherapy addiction support",
    ],
    categorySlug: "hypnotherapy",
    tagSlugs: ["hypnotherapy", "psychological-dependence", "addiction-recovery", "eft"],
    heroArtId: createBlogArtId("how-hypnotherapy-works-in-addiction-support"),
    publishedAt: "2026-04-24",
    sections: [
      {
        h2: "Hypnotherapy targets automatic responses",
        paragraphs: [
          "Addictive patterns are often maintained by fast automatic reactions to stress, emotion, or cues in the environment. Hypnotherapy can help slow this automatic response and build a more deliberate pause.",
          "When the pause gets stronger, people are more able to choose a different behaviour instead of repeating the familiar relief loop.",
        ],
      },
      {
        h2: "Psychological versus physical dependence",
        paragraphs: [
          "Physical dependence may require medical supervision and detox planning. Hypnotherapy support is most relevant for psychological dependence, including urge patterns, cue reactivity, and emotional avoidance.",
        ],
        h3Items: [
          {
            h3: "Physical dependence",
            body: "Often includes withdrawal risk and should be managed with medical guidance where required.",
          },
          {
            h3: "Psychological dependence",
            body: "Involves emotional cues, identity patterns, and learned relief pathways that can be retrained over time.",
          },
        ],
      },
      {
        h2: "Where EFT can strengthen hypnotherapy work",
        paragraphs: [
          "EFT-informed techniques can lower immediate emotional charge before deeper subconscious work. This combination can improve stability and make the process feel safer for clients who experience strong stress reactions.",
        ],
      },
    ],
  },
  {
    slug: "addiction-recovery-south-africa-core-approaches",
    title: "Addiction Recovery South Africa: Core Approaches",
    description:
      "A practical overview of addiction recovery approaches in South Africa, including pattern-focused support, emotional regulation, and long-term relapse prevention.",
    excerpt:
      "Recovery works best when clinical safety, emotional support, and practical daily structure are aligned to the real pressure points of life.",
    h1: "Addiction Recovery South Africa: Core Approaches",
    primaryKeyword: "addiction recovery South Africa core approaches",
    secondaryKeywords: [
      "addiction treatment options South Africa",
      "behavioural addiction support South Africa",
      "relapse prevention South Africa",
      "private addiction support South Africa",
    ],
    categorySlug: "addiction-recovery",
    tagSlugs: ["addiction-recovery", "south-africa", "relapse-prevention", "eft"],
    heroArtId: createBlogArtId("addiction-recovery-south-africa-core-approaches"),
    publishedAt: "2026-03-29",
    sections: [
      {
        h2: "Recovery is more than stopping one behaviour",
        paragraphs: [
          "Long-term change usually requires work across emotion regulation, coping routines, environment design, and support accountability. If one area is ignored, old patterns can return during stress.",
        ],
      },
      {
        h2: "Three layers that should work together",
        paragraphs: ["A stronger recovery plan typically includes three linked layers:"],
        bullets: [
          "Clinical safety planning for withdrawal risk and medical concerns.",
          "Psychological support for cravings, triggers, shame, and identity shifts.",
          "Daily structure with practical routines for high-risk moments.",
        ],
      },
      {
        h2: "South African context matters",
        paragraphs: [
          "Work pressure, travel distance, family roles, and confidentiality concerns can all affect treatment consistency. Flexible online and in-person support options can reduce dropout risk and improve follow-through.",
        ],
      },
    ],
  },
  {
    slug: "psychological-vs-physical-dependence",
    title: "Psychological vs Physical Dependence",
    description:
      "Understand the difference between psychological and physical dependence, and why this distinction matters for choosing effective support.",
    excerpt:
      "Not all dependence is the same. Knowing whether the main challenge is physical withdrawal, psychological triggers, or both helps shape the right support plan.",
    h1: "Psychological vs Physical Dependence",
    primaryKeyword: "psychological vs physical dependence addiction",
    secondaryKeywords: [
      "difference between psychological and physical dependence",
      "addiction craving triggers",
      "withdrawal versus habit loop",
      "addiction support plan",
    ],
    categorySlug: "addiction-recovery",
    tagSlugs: ["psychological-dependence", "physical-dependence", "addiction-recovery", "hypnotherapy"],
    heroArtId: createBlogArtId("psychological-vs-physical-dependence"),
    publishedAt: "2026-03-14",
    sections: [
      {
        h2: "Why this distinction is important",
        paragraphs: [
          "People often expect one approach to solve every kind of dependence. In practice, physical withdrawal and psychological habit loops may need different interventions at different times.",
        ],
      },
      {
        h2: "Physical dependence",
        paragraphs: [
          "Physical dependence involves body-level adaptation, and withdrawal can be medically significant. Clinical oversight may be essential depending on the substance and severity.",
        ],
      },
      {
        h2: "Psychological dependence",
        paragraphs: [
          "Psychological dependence is maintained by emotional cues, beliefs, routines, and environment triggers. Pattern-focused methods like hypnotherapy and EFT-informed support can be helpful in this layer.",
        ],
      },
      {
        h2: "Building a combined plan",
        paragraphs: [
          "When both types are present, recovery planning should sequence support clearly: medical safety first where needed, then ongoing psychological and behavioural reinforcement for long-term stability.",
        ],
      },
    ],
  },
];

export const blogPosts: BlogPost[] = [...blogPostsInitial, ...blogPostsChunk2, ...blogPostsChunk3, ...blogPostsChunk4].sort((a, b) =>
  a.publishedAt < b.publishedAt ? 1 : -1
);

export const blogCategoryBySlug = new Map(blogCategories.map((category) => [category.slug, category] as const));
export const blogTagBySlug = new Map(blogTags.map((tag) => [tag.slug, tag] as const));
export const blogPostBySlug = new Map(blogPosts.map((post) => [post.slug, post] as const));

export function getPostsByCategory(categorySlug: string) {
  return blogPosts.filter((post) => post.categorySlug === categorySlug);
}

export function getPostsByTag(tagSlug: string) {
  return blogPosts.filter((post) => post.tagSlugs.includes(tagSlug));
}

export function blogPath(slug: string) {
  return `/blog/${slug}/`;
}

export function blogCategoryPath(slug: string) {
  return `/blog/category/${slug}/`;
}

export function blogTagPath(slug: string) {
  return `/blog/tag/${slug}/`;
}

const blogHeroArtIds = new Set<string>();
for (const post of blogPosts) {
  if (blogHeroArtIds.has(post.heroArtId)) {
    throw new Error(`Duplicate blog heroArtId detected: ${post.heroArtId}`);
  }

  blogHeroArtIds.add(post.heroArtId);

  const expectedId = createBlogArtId(post.slug);
  if (post.heroArtId !== expectedId) {
    throw new Error(`Blog heroArtId must be "${expectedId}" for post slug "${post.slug}".`);
  }
}

