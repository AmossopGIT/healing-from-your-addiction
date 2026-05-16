import { blogCategoryBySlug, blogPosts } from "@/content/blog";

export type ArtGalleryItem = {
  id: string;
  title: string;
  category: string;
  src: string;
  alt: string;
  prompt: string;
  palette: readonly string[];
  usage: string;
};

export const watercolorPalette = {
  warmPaper: "#f7f3ea",
  surfaceCream: "#fffdfa",
  inkBlack: "#17231f",
  deepTeal: "#0a3f39",
  teal: "#0f5b52",
  softTeal: "#e2eeea",
  mutedGold: "#a87727",
  goldWash: "#f1e4cb",
} as const;

const sharedPalette = [
  watercolorPalette.warmPaper,
  watercolorPalette.surfaceCream,
  watercolorPalette.inkBlack,
  watercolorPalette.deepTeal,
  watercolorPalette.softTeal,
  watercolorPalette.mutedGold,
] as const;

const basePrompt =
  "Minimal watercolor illustration for Healing From Your Addiction, warm cream paper background, anonymous black ink main subject, soft teal watercolor wash, tiny muted gold pause point, rounded organic shapes, lots of negative space, calm confidential mood, hand-painted texture, no text, no logos, no realistic faces, no dramatic scene, no medical imagery, no stigma, flat composition, clean website artwork.";

const blogCategorySymbolBySlug: Record<string, string> = {
  "healing-program": "a pathway folder, stepping stones, and a pause point",
  hypnotherapy: "a calm head outline with an inner loop and one pause marker",
  "addiction-recovery": "a winding path with small stones and a stable pause point",
};

function blogAltText(categorySlug: string) {
  if (categorySlug === "hypnotherapy") {
    return "Minimal watercolor illustration of a calm head outline with an inner loop, suggesting hypnotherapy pattern support.";
  }

  if (categorySlug === "healing-program") {
    return "Minimal watercolor illustration of stepping stones and a folder-like shape, suggesting structured healing program progress.";
  }

  return "Minimal watercolor illustration of a winding path and pause point, suggesting steady addiction recovery progress.";
}

const blogArtEntries: ArtGalleryItem[] = blogPosts.map((post) => {
  const category = blogCategoryBySlug.get(post.categorySlug);
  const symbol = blogCategorySymbolBySlug[post.categorySlug] ?? "a calm loop, pathway, and pause point";

  return {
    id: post.heroArtId,
    title: `Blog Hero - ${post.title}`,
    category: `blog-${post.categorySlug}`,
    src: `/art/watercolor/art-watercolor-${post.heroArtId}.png`,
    alt: blogAltText(post.categorySlug),
    prompt: `${basePrompt} Create artwork for the article theme "${post.title}" in category "${category?.title ?? post.categorySlug}". Show ${symbol}. Keep it symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: `Primary hero artwork for blog article: ${post.title}.`,
  };
});

export const artGallery: readonly ArtGalleryItem[] = [
  {
    id: "home-hero",
    title: "Hero Habit Loop",
    category: "shared",
    src: "/art/watercolor/art-watercolor-home-hero.png",
    alt: "Minimal watercolor illustration of a black figure beside a large teal loop and gold pause point.",
    prompt: `${basePrompt} Show an anonymous black ink figure beside a large gentle teal habit loop and one gold pause point for the main hero artwork.`,
    palette: sharedPalette,
    usage: "Primary homepage hero artwork and broad brand introduction.",
  },
  {
    id: "pattern-loop",
    title: "Pattern Loop Pause",
    category: "shared",
    src: "/art/watercolor/art-watercolor-pattern-loop.png",
    alt: "Minimal watercolor illustration of a black figure beside a gentle loop, suggesting a pause in an addiction pattern.",
    prompt: `${basePrompt} Show a simple human silhouette beside a loose circular pathway to suggest an addiction pattern loop and a pause point.`,
    palette: sharedPalette,
    usage: "Shared hero, process, or educational artwork for pattern-focused sections.",
  },
  {
    id: "pattern-map",
    title: "Pattern Step Map",
    category: "shared",
    src: "/art/watercolor/art-watercolor-pattern-map.png",
    alt: "Minimal watercolor illustration of five stones on a winding path, suggesting the steps in an addiction pattern.",
    prompt: `${basePrompt} Show five small rounded stones on a winding ink path with a soft gold pause point to suggest trigger, craving, behaviour, relief, and repeat without using text.`,
    palette: sharedPalette,
    usage: "Homepage pattern section and any explanation of the addiction loop.",
  },
  {
    id: "pattern-trigger",
    title: "Pattern Step - Trigger",
    category: "pattern-step",
    src: "/art/watercolor/art-watercolor-pattern-trigger.png",
    alt: "Minimal watercolor illustration of a river stone with a small ripple, suggesting the trigger moment in an addiction pattern.",
    prompt: `${basePrompt} Show one smooth dark river stone with a small ripple ring and a thin wavy ink line arriving from the left to suggest the trigger step in a habit loop.`,
    palette: sharedPalette,
    usage: "Homepage addiction loop cards and educational trigger-step content.",
  },
  {
    id: "pattern-craving",
    title: "Pattern Step - Craving",
    category: "pattern-step",
    src: "/art/watercolor/art-watercolor-pattern-craving.png",
    alt: "Minimal watercolor illustration of a gentle inward spiral toward a stone, suggesting craving in an addiction pattern.",
    prompt: `${basePrompt} Show a soft inward spiral or pull line curving toward one small dark stone to suggest the craving step before behaviour.`,
    palette: sharedPalette,
    usage: "Homepage addiction loop cards and craving-awareness content.",
  },
  {
    id: "pattern-behaviour",
    title: "Pattern Step - Behaviour",
    category: "pattern-step",
    src: "/art/watercolor/art-watercolor-pattern-behaviour.png",
    alt: "Minimal watercolor illustration of a figure taking a step beside a stone on a path, suggesting behaviour in an addiction pattern.",
    prompt: `${basePrompt} Show a simple anonymous black ink figure taking one forward step beside a single smooth stone on a thin wavy path to suggest the behaviour step.`,
    palette: sharedPalette,
    usage: "Homepage addiction loop cards and behaviour-step educational content.",
  },
  {
    id: "pattern-relief",
    title: "Pattern Step - Relief Or Reward",
    category: "pattern-step",
    src: "/art/watercolor/art-watercolor-pattern-relief.png",
    alt: "Minimal watercolor illustration of a glowing gold circle with ripples between stones, suggesting relief or reward in an addiction pattern.",
    prompt: `${basePrompt} Show a muted gold circle with faint concentric ripples between two dark river stones on a thin wavy path to suggest relief or reward in the loop.`,
    palette: sharedPalette,
    usage: "Homepage addiction loop cards and relief-or-reward step content.",
  },
  {
    id: "pattern-repeat",
    title: "Pattern Step - Repeat",
    category: "pattern-step",
    src: "/art/watercolor/art-watercolor-pattern-repeat.png",
    alt: "Minimal watercolor illustration of stones in a circular loop, suggesting the repeat step in an addiction pattern.",
    prompt: `${basePrompt} Show small smooth river stones arranged in a gentle circular loop with a meandering ink line connecting back toward the start to suggest repetition.`,
    palette: sharedPalette,
    usage: "Homepage addiction loop cards and loop-repetition educational content.",
  },
  {
    id: "process-enquiry",
    title: "Confidential Enquiry",
    category: "process",
    src: "/art/watercolor/art-watercolor-process-enquiry.png",
    alt: "Minimal watercolor illustration of an envelope and chat bubbles, suggesting a confidential enquiry.",
    prompt: `${basePrompt} Show a simple envelope and small chat bubbles to suggest a private first enquiry.`,
    palette: sharedPalette,
    usage: "Process step artwork for confidential enquiry.",
  },
  {
    id: "process-understand",
    title: "Understand The Pattern",
    category: "process",
    src: "/art/watercolor/art-watercolor-process-understand.png",
    alt: "Minimal watercolor illustration of a magnifying glass over a gentle loop, suggesting understanding a pattern.",
    prompt: `${basePrompt} Show a magnifying glass over a gentle circular pathway to suggest understanding the pattern.`,
    palette: sharedPalette,
    usage: "Process step artwork for pattern mapping and awareness.",
  },
  {
    id: "process-support",
    title: "Structured Support",
    category: "process",
    src: "/art/watercolor/art-watercolor-process-support.png",
    alt: "Minimal watercolor illustration of hands holding a soft loop, suggesting structured support.",
    prompt: `${basePrompt} Show simple hands holding a small loop or circle to suggest structured support.`,
    palette: sharedPalette,
    usage: "Process step artwork for structured sessions and support.",
  },
  {
    id: "process-integration",
    title: "Integration",
    category: "process",
    src: "/art/watercolor/art-watercolor-process-integration.png",
    alt: "Minimal watercolor illustration of stepping stones and a sprout, suggesting integration and steady progress.",
    prompt: `${basePrompt} Show stepping stones and a small sprout beside a fading loop to suggest integration and steady progress.`,
    palette: sharedPalette,
    usage: "Process step artwork for integration and daily change.",
  },
  {
    id: "approach-subconscious",
    title: "Subconscious Patterns",
    category: "approach",
    src: "/art/watercolor/art-watercolor-approach-subconscious.png",
    alt: "Minimal watercolor illustration of a head outline with an inner spiral, suggesting subconscious patterns.",
    prompt: `${basePrompt} Show a simple head silhouette with a gentle inner spiral to suggest subconscious pattern work.`,
    palette: sharedPalette,
    usage: "Approach card artwork for subconscious patterns.",
  },
  {
    id: "approach-emotional",
    title: "Emotional Triggers",
    category: "approach",
    src: "/art/watercolor/art-watercolor-approach-emotional.png",
    alt: "Minimal watercolor illustration of an organic heart shape with soft ripple lines, suggesting emotional triggers calming.",
    prompt: `${basePrompt} Show an organic heart-like shape with soft ripple lines to suggest emotional triggers calming.`,
    palette: sharedPalette,
    usage: "Approach card artwork for emotional triggers and EFT awareness.",
  },
  {
    id: "approach-practical",
    title: "Practical Reinforcement",
    category: "approach",
    src: "/art/watercolor/art-watercolor-approach-practical.png",
    alt: "Minimal watercolor illustration of abstract checklist steps and a quiet path, suggesting practical reinforcement.",
    prompt: `${basePrompt} Show abstract checklist-like steps and a small path without readable text to suggest practical reinforcement.`,
    palette: sharedPalette,
    usage: "Approach card artwork for daily reinforcement and practical steps.",
  },
  {
    id: "confidential-enquiry",
    title: "Confidential Form",
    category: "shared",
    src: "/art/watercolor/art-watercolor-confidential-enquiry.png",
    alt: "Minimal watercolor illustration of a private form card and pen, suggesting a confidential enquiry.",
    prompt: `${basePrompt} Show a simple private form card and pen silhouette to suggest a confidential enquiry.`,
    palette: sharedPalette,
    usage: "Form sections, contact pages, and enquiry calls to action.",
  },
  {
    id: "programme-overview",
    title: "Programme Overview",
    category: "shared",
    src: "/art/watercolor/art-watercolor-programme-overview.png",
    alt: "Minimal watercolor illustration of an open folder with simple pathway cards, suggesting programme options.",
    prompt: `${basePrompt} Show an open folder with three soft pathway cards to suggest programme options.`,
    palette: sharedPalette,
    usage: "Programme overview sections and gallery cards.",
  },
  {
    id: "gambling-pain-chasing-losses",
    title: "Gambling Pain - Chasing Losses",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-chasing-losses.png",
    alt: "Minimal watercolor illustration of dice and a downward curve, suggesting chasing losses after a bad gambling session.",
    prompt: `${basePrompt} Show simple dice and a downward curved arrow to suggest chasing losses after a bad session. Avoid casino scenes and money piles.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: chasing losses after a bad session.",
  },
  {
    id: "gambling-pain-apps-reach",
    title: "Gambling Pain - Apps Within Reach",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-apps-reach.png",
    alt: "Minimal watercolor illustration of a phone with small app tiles, suggesting betting apps always within reach.",
    prompt: `${basePrompt} Show a simple phone with small app tile dots to suggest betting apps or online casinos always within reach. Avoid platform logos.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: betting apps or online casinos always within reach.",
  },
  {
    id: "gambling-pain-stress-shame",
    title: "Gambling Pain - Stress And Shame",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-stress-shame.png",
    alt: "Minimal watercolor illustration of a bowed figure with soft ripple lines, suggesting stress, secrecy and shame after gambling.",
    prompt: `${basePrompt} Show a bowed anonymous figure with soft ripple lines to suggest stress, secrecy and shame after gambling. Avoid shaming imagery.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: stress, secrecy and shame after gambling.",
  },
  {
    id: "gambling-pain-financial-pressure",
    title: "Gambling Pain - Financial Pressure",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-financial-pressure.png",
    alt: "Minimal watercolor illustration of stacked stones and a small circle mark, suggesting financial pressure and promises to stop.",
    prompt: `${basePrompt} Show stacked stones or simple ledger lines with a small promise mark to suggest financial pressure and promises to stop. Avoid money piles.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: financial pressure and promises to stop.",
  },
  {
    id: "gambling-pain-near-misses",
    title: "Gambling Pain - Near Misses",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-near-misses.png",
    alt: "Minimal watercolor illustration of an almost-complete circle with a gap, suggesting the pull of near-misses, bonuses and fast results.",
    prompt: `${basePrompt} Show an almost-complete circle with one gap and a small accent burst to suggest near-misses, bonuses and fast results. Avoid casino branding.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: the pull of near-misses, bonuses and fast results.",
  },
  {
    id: "gambling-pain-emotional-escape",
    title: "Gambling Pain - Emotional Escape",
    category: "gambling-pain",
    src: "/art/watercolor/art-watercolor-gambling-pain-emotional-escape.png",
    alt: "Minimal watercolor illustration of a figure stepping into a soft loop doorway, suggesting gambling as escape from emotion or pressure.",
    prompt: `${basePrompt} Show a figure stepping into a soft loop doorway to suggest using gambling as escape from emotion or pressure.`,
    palette: sharedPalette,
    usage: "Gambling landing page pain card: using gambling as escape from emotion or pressure.",
  },
  {
    id: "gambling",
    title: "Gambling Pattern Awareness",
    category: "gambling",
    src: "/art/watercolor/art-watercolor-gambling.png",
    alt: "Minimal watercolor illustration of dice and a playing card inside a gentle loop, suggesting gambling habit patterns.",
    prompt: `${basePrompt} Show simple dice and one playing card outline inside a loose circular pathway to suggest gambling habit awareness. Avoid casino scenes, money piles, and distress.`,
    palette: sharedPalette,
    usage: "Use on gambling addiction programme pages, ads, or gallery cards.",
  },
  {
    id: "food-binge-eating",
    title: "Food Pattern Awareness",
    category: "food-binge-eating",
    src: "/art/watercolor/art-watercolor-food-binge-eating.png",
    alt: "Simple watercolor artwork of a bowl and spoon inside a gentle loop, suggesting food and binge eating habit awareness.",
    prompt: `${basePrompt} Show a simple bowl and spoon with one loose circular pathway to suggest food and binge eating habit awareness. Avoid body imagery, dieting imagery, and shame.`,
    palette: sharedPalette,
    usage: "Use on food addiction, emotional eating, or binge eating support pages.",
  },
  {
    id: "alcohol",
    title: "Alcohol Pattern Awareness",
    category: "alcohol",
    src: "/art/watercolor/art-watercolor-alcohol.png",
    alt: "Minimal watercolor illustration of an unlabeled glass and ripple inside a soft loop, suggesting alcohol habit awareness.",
    prompt: `${basePrompt} Show an unlabeled glass silhouette and gentle ripple inside a loose circular pathway to suggest alcohol habit awareness. Avoid bottle labels, bar scenes, and distress.`,
    palette: sharedPalette,
    usage: "Use on alcohol support pages and future programme cards.",
  },
  {
    id: "cannabis",
    title: "Cannabis Pattern Awareness",
    category: "cannabis",
    src: "/art/watercolor/art-watercolor-cannabis.png",
    alt: "Minimal watercolor illustration of an abstract leaf and seated figure inside a gentle loop, suggesting cannabis habit awareness.",
    prompt: `${basePrompt} Show an abstract simple leaf beside one loose circular pathway to suggest cannabis habit awareness. Keep it non-promotional and avoid smoking scenes.`,
    palette: sharedPalette,
    usage: "Use on cannabis habit support pages or enquiry content.",
  },
  {
    id: "nicotine",
    title: "Nicotine Pattern Awareness",
    category: "nicotine",
    src: "/art/watercolor/art-watercolor-nicotine.png",
    alt: "Minimal watercolor illustration of a small figure and soft vapor curl forming a loop, suggesting nicotine habit awareness.",
    prompt: `${basePrompt} Show a simple small stick silhouette and soft vapor curl with a break line to suggest nicotine habit awareness. Avoid cigarette branding and smoke-filled scenes.`,
    palette: sharedPalette,
    usage: "Use on nicotine, smoking, or vaping support pages.",
  },
  {
    id: "pornography",
    title: "Private Digital Pattern Awareness",
    category: "pornography",
    src: "/art/watercolor/art-watercolor-pornography.png",
    alt: "Minimal watercolor illustration of a private browser window and pause symbol, suggesting confidential digital habit awareness.",
    prompt: `${basePrompt} Show a simple phone or browser window silhouette with a privacy screen shape to suggest confidential pornography habit awareness. Avoid explicit content, adult imagery, and shame.`,
    palette: sharedPalette,
    usage: "Use on confidential pornography support pages where privacy and discretion are important.",
  },
  {
    id: "social-media",
    title: "Social Media Pattern Awareness",
    category: "social-media",
    src: "/art/watercolor/art-watercolor-social-media.png",
    alt: "Simple watercolor artwork of a phone with looping dots, suggesting social media habit awareness.",
    prompt: `${basePrompt} Show a simple phone rectangle with looping dots to suggest social media habit awareness. Avoid platform logos and notification clutter.`,
    palette: sharedPalette,
    usage: "Use on social media habit support pages or digital boundary content.",
  },
  {
    id: "gaming",
    title: "Gaming Pattern Awareness",
    category: "gaming",
    src: "/art/watercolor/art-watercolor-gaming.png",
    alt: "Minimal watercolor illustration of a game controller and pause point inside a loop, suggesting gaming habit awareness.",
    prompt: `${basePrompt} Show a simple game controller outline with a pause loop to suggest gaming habit awareness. Avoid game branding and dramatic scenes.`,
    palette: sharedPalette,
    usage: "Use on gaming habit support pages and future programme artwork cards.",
  },
  ...blogArtEntries,
];

export const artGalleryById: ReadonlyMap<string, ArtGalleryItem> = new Map(artGallery.map((item) => [item.id, item]));
export const artGalleryByCategory: ReadonlyMap<string, ArtGalleryItem> = new Map(artGallery.map((item) => [item.category, item]));

const missingBlogArtwork = blogPosts.filter((post) => !artGalleryById.has(post.heroArtId)).map((post) => post.slug);
if (missingBlogArtwork.length) {
  throw new Error(`Missing watercolor artwork metadata for blog posts: ${missingBlogArtwork.join(", ")}`);
}
