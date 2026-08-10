import { blogCategoryBySlug, blogPosts } from "@/content/blog";
import { caseStudies } from "@/content/caseStudies";

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
  "gambling-addiction": "a subtle card or chip shape with a circular loop and pause point",
  "food-addiction": "a bowl and spoon outline with a gentle loop and pause point",
  "eft-tapping": "two calm hands near a gentle loop with soft fingertip tap points",
  "triggers-cravings": "a smooth river stone with a ripple ring and inward spiral toward a pause point",
  "family-support": "two simple anonymous figures with gentle space between them and a connecting loop",
};

const blogAltBySlug: Record<string, string> = {
  "signs-of-behavioral-addictions":
    "Minimal watercolor illustration of a seated anonymous figure beside a loop with dice, cards, and a pause point, suggesting behavioral addiction patterns.",
  "signs-of-substance-addictions":
    "Minimal watercolor illustration of an anonymous figure beside an unlabeled glass within a broken circle and gold pause point, suggesting substance dependence signs.",
  "one-unified-model-of-addiction":
    "Minimal watercolor illustration of a circular habit loop with symbolic nodes and a gold pause point, suggesting a unified model of addiction patterns.",
  "the-core-pattern-behind-all-addictions":
    "Minimal watercolor illustration of a figure beside a circular stone path with one gold pause stone, suggesting the core pattern behind addictions.",
  "addictions-develop-from-a-combination-of-biological-psychological-and-environmental-factors":
    "Minimal watercolor illustration of a stone with ripple rings, leaves, and a path, suggesting biological, psychological, and environmental addiction factors.",
  "when-you-decide-to-heal-gambling":
    "Minimal watercolor illustration of an anonymous figure beside a gentle loop and gold pause stone, suggesting the decision to heal from gambling addiction.",
  "how-to-quit-gambling-when-youve-tried-everything":
    "Minimal watercolor illustration of a hand pausing before dice and cards, suggesting help to quit gambling when previous attempts failed.",
  "chasing-losses-why-the-gambling-loop-keeps-running":
    "Minimal watercolor illustration of a circular loop with a downward spiral, suggesting the chasing-losses gambling pattern.",
  "introduction-to-hypnotherapy-for-gambling-addiction":
    "Minimal watercolor illustration of a calm head outline with an inner loop, suggesting hypnotherapy support for gambling addiction.",
  "what-happens-after-a-gambling-support-enquiry":
    "Minimal watercolor illustration of stepping stones along a path, suggesting the next step after a confidential gambling support enquiry.",
  "when-you-decide-to-heal-food-addiction":
    "Minimal watercolor illustration of an anonymous figure beside a bowl and pause point, suggesting the decision to heal from food addiction.",
  "emotional-eating-at-night-triggers-and-pause":
    "Minimal watercolor illustration of a bowl and hand with a pause line, suggesting emotional eating at night and a calmer response.",
  "food-addiction-vs-binge-eating-understanding-the-pattern":
    "Minimal watercolor illustration of overlapping gentle spirals near a bowl, suggesting food addiction and binge eating patterns.",
  "eft-for-food-cravings-a-gentle-first-step":
    "Minimal watercolor illustration of calm hands near a bowl with a soft loop, suggesting EFT support for food cravings.",
  "preparing-for-the-four-week-food-addiction-programme":
    "Minimal watercolor illustration of stepping stones and a folder-like shape, suggesting preparation for a structured food addiction programme.",
};

function blogAltText(categorySlug: string, slug?: string) {
  if (slug && blogAltBySlug[slug]) {
    return blogAltBySlug[slug];
  }

  if (categorySlug === "hypnotherapy") {
    return "Minimal watercolor illustration of a calm head outline with an inner loop, suggesting hypnotherapy pattern support.";
  }

  if (categorySlug === "healing-program") {
    return "Minimal watercolor illustration of stepping stones and a folder-like shape, suggesting structured healing program progress.";
  }

  if (categorySlug === "gambling-addiction") {
    return "Minimal watercolor illustration of dice inside a gentle loop, suggesting gambling habit patterns.";
  }

  if (categorySlug === "food-addiction") {
    return "Minimal watercolor illustration of a bowl and spoon with a pause point, suggesting food addiction and emotional eating patterns.";
  }

  if (categorySlug === "eft-tapping") {
    return "Minimal watercolor illustration of calm hands near a gentle loop, suggesting EFT tapping and emotional regulation support.";
  }

  if (categorySlug === "triggers-cravings") {
    return "Minimal watercolor illustration of a stone with ripples and a spiral, suggesting addiction triggers and cravings awareness.";
  }

  if (categorySlug === "family-support") {
    return "Minimal watercolor illustration of two figures beside a gentle loop, suggesting support for family and loved ones affected by addiction.";
  }

  return "Minimal watercolor illustration of a winding path and pause point, suggesting steady addiction recovery progress.";
}

const caseStudyTypeSymbol: Record<string, string> = {
  outcome: "stepping stones on a path with a calm pause point",
  script: "two calm hands near a gentle loop suggesting EFT or script work",
  questions: "a small stack of cards or list shapes suggesting intake questions",
  affirmations: "a single figure beside a soft upward path and pause marker",
  programme: "a folder-like shape with stepping stones suggesting a structured programme",
};

const caseStudyAddictionSymbol: Record<string, string> = {
  gambling: "a subtle card or chip shape without logos",
  "food-binge-eating": "a bowl and glass outline",
  alcohol: "a glass outline with a pause loop",
  cannabis: "a simple leaf silhouette with a loop",
  pornography: "a privacy screen shape with a loop",
  sex: "two abstract figures with space between them",
  shopping: "a small bag shape with a loop",
  gaming: "a simple controller outline",
  nicotine: "a small cigarette-shaped line with loop",
  "social-media": "a phone rectangle with looping dots",
  internet: "a browser window shape with a loop",
  unknown: "a calm loop and pathway",
};

function caseStudyAltText(study: (typeof caseStudies)[number]) {
  const topic = study.addictionSlug.replace(/-/g, " ");
  const type = study.caseStudyType;
  if (type === "outcome") {
    return `Minimal watercolor illustration of a gentle path and pause point, suggesting ${topic} addiction recovery progress.`;
  }
  if (type === "script") {
    return `Minimal watercolor illustration of calm hands near a loop, suggesting an EFT or hypnotherapy script for ${topic} patterns.`;
  }
  return `Minimal watercolor illustration with symbolic shapes, suggesting a ${topic} addiction support resource.`;
}

const caseStudyArtEntries: ArtGalleryItem[] = caseStudies.map((study) => {
  const typeSymbol = caseStudyTypeSymbol[study.caseStudyType] ?? caseStudyTypeSymbol.outcome;
  const addictionSymbol =
    caseStudyAddictionSymbol[study.addictionSlug] ?? caseStudyAddictionSymbol.unknown;

  return {
    id: study.heroArtId,
    title: `Case Study - ${study.title}`,
    category: `case-study-${study.addictionSlug}`,
    src: `/art/watercolor/art-watercolor-${study.heroArtId}.png`,
    alt: caseStudyAltText(study),
    prompt: `${basePrompt} Create artwork for case study "${study.title}" (${study.caseStudyType}). Show ${typeSymbol} and ${addictionSymbol}. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: `Hero artwork for case study: ${study.title}.`,
  };
});

const blogArtEntries: ArtGalleryItem[] = blogPosts.map((post) => {
  const category = blogCategoryBySlug.get(post.categorySlug);
  const symbol = blogCategorySymbolBySlug[post.categorySlug] ?? "a calm loop, pathway, and pause point";

  return {
    id: post.heroArtId,
    title: `Blog Hero - ${post.title}`,
    category: `blog-${post.categorySlug}`,
    src: `/art/watercolor/art-watercolor-${post.heroArtId}.png`,
    alt: blogAltText(post.categorySlug, post.slug),
    prompt: `${basePrompt} Create artwork for the article theme "${post.title}" in category "${category?.title ?? post.categorySlug}". Show ${symbol}. Keep it symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: `Primary hero artwork for blog article: ${post.title}.`,
  };
});

export const artGallery: readonly ArtGalleryItem[] = [
  {
    id: "gerald-crawford",
    title: "Gerald Crawford Portrait — Teal and Gold",
    category: "about",
    src: "/art/watercolor/art-watercolor-gerald-crawford.png",
    alt: "Watercolor portrait of Gerald Crawford, hypnotherapist, in calm professional attire with soft teal washes and a muted gold sun accent.",
    prompt:
      "Warm watercolor portrait of Gerald Crawford, hypnotherapist with salt-and-pepper beard and blue glasses, navy suit and blue tie, gentle professional smile, soft teal and muted gold sun background washes on warm cream paper, calm confidential mood, no text, no logos.",
    palette: sharedPalette,
    usage: "Default About Gerald Crawford portrait, OG image, and primary practitioner introduction.",
  },
  {
    id: "gerald-crawford-pattern-loop",
    title: "Gerald Crawford Portrait — Pattern Loop",
    category: "about",
    src: "/art/watercolor/art-watercolor-gerald-crawford-pattern-loop.png",
    alt: "Watercolor portrait of Gerald Crawford with a soft teal habit loop and gold pause point behind him, suggesting pattern-focused support.",
    prompt:
      "Watercolor portrait of Gerald Crawford with salt-and-pepper beard, blue glasses, navy suit and blue tie, gentle smile, large soft teal habit loop circle behind shoulders and one muted gold pause dot, warm cream paper, calm pattern-focused mood, no text, no logos.",
    palette: sharedPalette,
    usage: "Approach, programmes, and education sections where pattern-loop language fits.",
  },
  {
    id: "gerald-crawford-recovery-path",
    title: "Gerald Crawford Portrait — Recovery Path",
    category: "about",
    src: "/art/watercolor/art-watercolor-gerald-crawford-recovery-path.png",
    alt: "Watercolor portrait of Gerald Crawford with soft teal pathway washes and stepping stones, suggesting steady recovery progress.",
    prompt:
      "Watercolor portrait of Gerald Crawford with blue glasses, navy suit and blue tie, gentle smile, soft horizontal teal washes and subtle stepping-stone path motif with muted gold sun accent on warm cream paper, recovery peace aesthetic, no text, no logos.",
    palette: sharedPalette,
    usage: "Recovery stories, case studies, blog addiction-recovery category, and progress-themed CTAs.",
  },
  {
    id: "gerald-crawford-warm-gold",
    title: "Gerald Crawford Portrait — Warm Gold",
    category: "about",
    src: "/art/watercolor/art-watercolor-gerald-crawford-warm-gold.png",
    alt: "Watercolor portrait of Gerald Crawford on a warm cream and gold wash background, suggesting trust and understanding.",
    prompt:
      "Watercolor portrait of Gerald Crawford with salt-and-pepper beard, blue glasses, navy suit and blue tie, warm approachable smile, predominantly cream and gold wash background with only whisper of teal at edges, trust and understanding mood, no text, no logos.",
    palette: sharedPalette,
    usage: "Contact, thank-you, enquiry, and trust-building sections where warmth should lead.",
  },
  {
    id: "hfya-logo",
    title: "HFYA Brand Logo",
    category: "brand",
    src: "/art/watercolor/art-watercolor-hfya-logo.png",
    alt: "Watercolor Healing From Your Addiction logo with a profile outline, soft teal washes, and muted gold accent on warm cream paper.",
    prompt:
      "Existing watercolor logo asset for Healing From Your Addiction with profile outline, HFYA letterform, and calm botanical elements on warm cream paper.",
    palette: sharedPalette,
    usage: "Brand-led hero artwork where the logo should appear instead of a practitioner portrait.",
  },
  {
    id: "contact-whatsapp",
    title: "WhatsApp Contact",
    category: "shared",
    src: "/art/watercolor/art-watercolor-contact-whatsapp.png",
    alt: "Minimal watercolor illustration of a phone with a soft message bubble, suggesting a private first message on WhatsApp.",
    prompt: `${basePrompt} Show a simple phone outline with one gentle teal message bubble and a small gold pause dot, suggesting a private direct first message.`,
    palette: sharedPalette,
    usage: "Contact page WhatsApp card artwork.",
  },
  {
    id: "contact-email",
    title: "Email Contact",
    category: "shared",
    src: "/art/watercolor/art-watercolor-contact-email.png",
    alt: "Minimal watercolor illustration of a sealed envelope with soft teal wash, suggesting a confidential email enquiry.",
    prompt: `${basePrompt} Show a simple sealed envelope with soft teal wash and restrained gold accent, suggesting a confidential written enquiry.`,
    palette: sharedPalette,
    usage: "Contact page email card artwork.",
  },
  {
    id: "contact-phone",
    title: "Phone Contact",
    category: "shared",
    src: "/art/watercolor/art-watercolor-contact-phone.png",
    alt: "Minimal watercolor illustration of a classic handset with a calm pause mark, suggesting a phone enquiry.",
    prompt: `${basePrompt} Show a simple classic phone handset with soft teal wash and one gold pause point, suggesting a calm phone enquiry.`,
    palette: sharedPalette,
    usage: "Contact page phone card artwork.",
  },
  {
    id: "about-qualifications",
    title: "Qualifications",
    category: "about",
    src: "/art/watercolor/art-watercolor-about-qualifications.png",
    alt: "Minimal watercolor illustration of an open book with a soft pause point, suggesting clinical education and practitioner qualifications.",
    prompt: `${basePrompt} Show a simple open book with soft stacked pages and one gold pause dot beside a loose teal pathway to suggest qualifications and pattern-focused education.`,
    palette: sharedPalette,
    usage: "About Gerald Crawford qualifications info card.",
  },
  {
    id: "about-approach",
    title: "Approach",
    category: "about",
    src: "/art/watercolor/art-watercolor-about-approach.png",
    alt: "Minimal watercolor illustration of a figure beside a gentle habit loop with a gold pause point, suggesting understanding triggers and rehearsing new responses.",
    prompt: `${basePrompt} Show an anonymous black figure beside a gentle teal habit loop and one gold pause point to suggest understanding the loop and rehearsing change.`,
    palette: sharedPalette,
    usage: "About Gerald Crawford approach info card.",
  },
  {
    id: "about-what-to-expect",
    title: "What to Expect",
    category: "about",
    src: "/art/watercolor/art-watercolor-about-what-to-expect.png",
    alt: "Minimal watercolor illustration of two facing chairs with a calm boundary line, suggesting a private conversation with clear boundaries.",
    prompt: `${basePrompt} Show two simple facing chair silhouettes with a soft curved boundary line and one gold pause dot to suggest a private structured conversation.`,
    palette: sharedPalette,
    usage: "About Gerald Crawford what to expect info card.",
  },
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
    usage: "Process step artwork for pattern mapping, awareness, and the Addiction Healing Readiness Assessment.",
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
    id: "food-pain-not-hungry",
    title: "Food Pain - Not Physically Hungry",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-not-hungry.png",
    alt: "Minimal watercolor illustration of an empty bowl with a hovering hand, suggesting eating when not physically hungry.",
    prompt: `${basePrompt} Show an empty bowl with a hand hovering nearby and a small hollow circle to suggest eating when not physically hungry. Avoid body imagery and shame.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: eating when you are not physically hungry.",
  },
  {
    id: "food-pain-sugar-cravings",
    title: "Food Pain - Sugar Cravings",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-sugar-cravings.png",
    alt: "Minimal watercolor illustration of a spoon with soft crystal dots and a gentle swirl, suggesting sugar cravings or processed-food urges.",
    prompt: `${basePrompt} Show a simple spoon with soft crystal-like dots and a gentle swirl to suggest sugar cravings or processed-food urges.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: sugar cravings or processed-food urges.",
  },
  {
    id: "food-pain-late-night",
    title: "Food Pain - Late Night Eating",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-late-night.png",
    alt: "Minimal watercolor illustration of a crescent moon above a small bowl, suggesting late-night eating or secret eating.",
    prompt: `${basePrompt} Show a crescent moon above a small bowl with a soft curtain-like line to suggest late-night eating or secret eating.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: late-night eating or secret eating.",
  },
  {
    id: "food-pain-binge-shame",
    title: "Food Pain - Binge And Shame",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-binge-shame.png",
    alt: "Minimal watercolor illustration of a bowl with a soft downward spiral, suggesting binge episodes followed by shame without stigma.",
    prompt: `${basePrompt} Show a bowl with a soft downward spiral and distant bowed figure to suggest binge episodes followed by shame. Avoid shaming imagery.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: binge episodes followed by shame.",
  },
  {
    id: "food-pain-dieting-cycles",
    title: "Food Pain - Dieting Cycles",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-dieting-cycles.png",
    alt: "Minimal watercolor illustration of two swinging paths around a plate, suggesting all-or-nothing dieting cycles.",
    prompt: `${basePrompt} Show two curved arrows swinging between strict and loose paths around a small plate to suggest all-or-nothing dieting cycles. Avoid diet labels.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: all-or-nothing dieting cycles.",
  },
  {
    id: "food-pain-loss-of-control",
    title: "Food Pain - Loss Of Control",
    category: "food-pain",
    src: "/art/watercolor/art-watercolor-food-pain-loss-of-control.png",
    alt: "Minimal watercolor illustration of a hand reaching toward a bowl inside a tightening loop, suggesting a loss of control around certain foods.",
    prompt: `${basePrompt} Show a hand reaching toward a bowl inside a tightening spiral loop with one gold pause point to suggest loss of control around certain foods.`,
    palette: sharedPalette,
    usage: "Food landing page pain card: feeling a loss of control around certain foods.",
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
  {
    id: "testimonies-shared-stories",
    title: "Shared Stories",
    category: "trust",
    src: "/art/watercolor/art-watercolor-testimonies-shared-stories.png",
    alt: "Minimal watercolor illustration of two anonymous figures beside a gentle loop, suggesting shared recovery stories.",
    prompt: `${basePrompt} Show two simple anonymous black ink figures standing near a gentle loop and pause point to suggest shared stories without faces or drama.`,
    palette: sharedPalette,
    usage: "Testimonies page hero and trust content.",
  },
  {
    id: "gerald-crawford-books",
    title: "Gerald Crawford Books",
    category: "trust",
    src: "/art/watercolor/art-watercolor-gerald-crawford-books.png",
    alt: "Minimal watercolor illustration of a small stack of open books with soft teal wash, suggesting published works by Gerald Crawford.",
    prompt: `${basePrompt} Show a small stack of open books with soft teal wash and ink linework, no readable text on pages, calm scholarly mood.`,
    palette: sharedPalette,
    usage: "Other books page hero and book list section.",
  },
  {
    id: "terms-site-use",
    title: "Site Use Boundaries",
    category: "trust",
    src: "/art/watercolor/art-watercolor-terms-site-use.png",
    alt: "Minimal watercolor illustration of a gentle path ending at a pause stone, suggesting clear website boundaries.",
    prompt: `${basePrompt} Show a simple path ending at a pause stone with soft teal wash to suggest clear boundaries and calm site use.`,
    palette: sharedPalette,
    usage: "Terms and conditions page hero artwork.",
  },
  {
    id: "blog-signs-of-behavioral-addictions-recovery-path",
    title: "Behavioral Addictions — Recovery Path",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-signs-of-behavioral-addictions-recovery-path.png",
    alt: "Minimal watercolor illustration of a figure beside a winding path and golden pause stone, suggesting a pause before behavioral addiction patterns.",
    prompt: `${basePrompt} Create artwork for behavioral addiction recovery. Show an anonymous figure beside a winding stepping-stone path with one muted gold pause point and soft teal washes. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Supplementary artwork for Signs of Behavioral Addictions blog article — road and pause point motif.",
  },
  {
    id: "blog-gambling-addiction-support",
    title: "Gambling Addiction Blog Category",
    category: "blog-gambling-addiction",
    src: "/art/watercolor/art-watercolor-blog-gambling-addiction-support.png",
    alt: "Minimal watercolor illustration of dice inside a gentle loop, suggesting gambling habit patterns.",
    prompt: `${basePrompt} Create artwork for the Gambling Addiction blog category. Show a subtle card or chip shape with a circular loop and one muted gold pause point. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Hero artwork for Gambling Addiction blog category hub and cards.",
  },
  {
    id: "blog-food-addiction-emotional-eating",
    title: "Food Addiction Blog Category",
    category: "blog-food-addiction",
    src: "/art/watercolor/art-watercolor-blog-food-addiction-emotional-eating.png",
    alt: "Minimal watercolor illustration of a bowl and spoon with a pause point, suggesting food addiction and emotional eating patterns.",
    prompt: `${basePrompt} Create artwork for the Food Addiction blog category. Show a bowl and spoon outline with a gentle loop and one muted gold pause point. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Hero artwork for Food Addiction blog category hub and cards.",
  },
  {
    id: "blog-eft-tapping-addiction-support",
    title: "EFT and Tapping Blog Category",
    category: "blog-eft-tapping",
    src: "/art/watercolor/art-watercolor-blog-eft-tapping-addiction-support.png",
    alt: "Minimal watercolor illustration of calm hands near a gentle loop, suggesting EFT tapping and emotional regulation support.",
    prompt: `${basePrompt} Create artwork for the EFT and Tapping blog category. Show two calm hands near a gentle loop with soft fingertip tap points and one muted gold pause marker. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Hero artwork for EFT and Tapping blog category hub and cards.",
  },
  {
    id: "blog-understanding-addiction-triggers",
    title: "Triggers and Cravings Blog Category",
    category: "blog-triggers-cravings",
    src: "/art/watercolor/art-watercolor-blog-understanding-addiction-triggers.png",
    alt: "Minimal watercolor illustration of a stone with ripples and a spiral, suggesting addiction triggers and cravings awareness.",
    prompt: `${basePrompt} Create artwork for the Triggers and Cravings blog category. Show a smooth river stone with a small ripple ring and a soft inward spiral toward a muted gold pause point. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Hero artwork for Triggers and Cravings blog category hub and cards.",
  },
  {
    id: "blog-supporting-loved-one-addiction",
    title: "Family and Loved Ones Blog Category",
    category: "blog-family-support",
    src: "/art/watercolor/art-watercolor-blog-supporting-loved-one-addiction.png",
    alt: "Minimal watercolor illustration of two figures beside a gentle loop, suggesting support for family and loved ones affected by addiction.",
    prompt: `${basePrompt} Create artwork for the Family and Loved Ones blog category. Show two simple anonymous figures with gentle space between them and a soft circular loop with one muted gold pause point. Keep symbolic, calm, and non-stigmatizing.`,
    palette: sharedPalette,
    usage: "Hero artwork for Family and Loved Ones blog category hub and cards.",
  },
  {
    id: "blog-self-awareness-the-beginning-of-healing-addiction",
    title: "Blog Hero - Self-Awareness: The Beginning of Healing Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-self-awareness-the-beginning-of-healing-addiction.png",
    alt: "Minimal watercolor illustration of an anonymous figure beside a gentle loop and a soft gold pause point, suggesting the start of self-awareness.",
    prompt: `${basePrompt} Show an anonymous black figure quietly noticing a loose teal circular pathway, with one clear muted gold pause point as the first moment of awareness.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Self-Awareness: The Beginning of Healing Addiction.",
  },
  {
    id: "blog-gambling-addiction-what-is-gambling-addiction",
    title: "Blog Hero - Gambling Addiction: What Is Gambling Addiction?",
    category: "blog-gambling-addiction",
    src: "/art/watercolor/art-watercolor-blog-gambling-addiction-what-is-gambling-addiction.png",
    alt: "Minimal watercolor illustration of simple dice inside a gentle loop, suggesting gambling habit patterns.",
    prompt: `${basePrompt} Show two simple dice inside a loose circular pathway and one clear gold pause point. Keep dice unmarked and non-sensational.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Gambling Addiction: What Is Gambling Addiction?",
  },
  {
    id: "blog-sex-addiction",
    title: "Blog Hero - Sex Addiction: Recovery Through Emotional Connection",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-sex-addiction.png",
    alt: "Minimal watercolor illustration of two simple facing forms with a soft boundary and gold pause point, suggesting emotional connection.",
    prompt: `${basePrompt} Show two anonymous facing silhouettes with a soft curved connection line, a gentle teal loop, and one muted gold pause point. Keep fully non-explicit.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Sex Addiction: Recovery Through Emotional Connection.",
  },
  {
    id: "blog-online-gambling-addiction-south-africa",
    title: "Blog Hero - Online Gambling Addiction in South Africa",
    category: "blog-gambling-addiction",
    src: "/art/watercolor/art-watercolor-blog-online-gambling-addiction-south-africa.png",
    alt: "Minimal watercolor illustration of a simple phone and card beside a gentle loop, suggesting online gambling habit awareness.",
    prompt: `${basePrompt} Show a simple phone rectangle and one plain playing card silhouette inside a loose teal circular pathway with one gold pause point.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Online Gambling Addiction in South Africa.",
  },
  {
    id: "blog-pornography-addiction-the-neuroscience-of-porn-addiction",
    title: "Blog Hero - Pornography Addiction: The Neuroscience of Porn Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-pornography-addiction-the-neuroscience-of-porn-addiction.png",
    alt: "Minimal watercolor illustration of a phone silhouette with soft pathway marks, suggesting habit patterns in the mind without explicit content.",
    prompt: `${basePrompt} Show a simple phone silhouette with a privacy screen, abstract soft teal pathway loops, and one muted gold pause point. No explicit content.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Pornography Addiction: The Neuroscience of Porn Addiction.",
  },
  {
    id: "blog-pornography-addiction-how-porn-changes-the-brain",
    title: "Blog Hero - Pornography Addiction: How Porn Changes the Brain",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-pornography-addiction-how-porn-changes-the-brain.png",
    alt: "Minimal watercolor illustration of an abstract soft pathway around a phone silhouette, suggesting changing habit loops without medical imagery.",
    prompt: `${basePrompt} Show a phone silhouette with a privacy screen, one abstract soft teal loop shifting into a calmer path, and one gold pause point. No brain diagrams.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Pornography Addiction: How Porn Changes the Brain.",
  },
  {
    id: "blog-pornography-addiction-healing-shame-after-porn-addiction",
    title: "Blog Hero - Pornography Addiction: Healing Shame After Porn Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-pornography-addiction-healing-shame-after-porn-addiction.png",
    alt: "Minimal watercolor illustration of an anonymous figure beside a soft loop and gold pause, suggesting relief from shame without dramatic emotion.",
    prompt: `${basePrompt} Show an anonymous black figure beside a gentle teal loop that softens into open space, with one muted gold pause point suggesting relief and dignity.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Pornography Addiction: Healing Shame After Porn Addiction.",
  },
  {
    id: "blog-pornography-addiction-restoring-intimacy-and-healthy-relationships",
    title: "Blog Hero - Pornography: Restoring Intimacy and Healthy Relationships",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-pornography-addiction-restoring-intimacy-and-healthy-relationships.png",
    alt: "Minimal watercolor illustration of two simple facing forms with a soft connection line, suggesting restored intimacy without explicit imagery.",
    prompt: `${basePrompt} Show two anonymous facing silhouettes with a soft connection line and one shared gold pause point, with a quiet teal pathway behind them.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Pornography: Restoring Intimacy and Healthy Relationships.",
  },
  {
    id: "blog-the-most-important-truths-about-addiction",
    title: "Blog Hero - The most important truths about Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-the-most-important-truths-about-addiction.png",
    alt: "Minimal watercolor illustration of a simple loop with a clear pause point, suggesting core truths about addiction patterns.",
    prompt: `${basePrompt} Show one clear circular pathway with several soft stepping marks and one strong muted gold pause point, suggesting essential pattern truths.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: The most important truths about Addiction.",
  },
  {
    id: "blog-comprehensive-addiction-recovery-programme-for-every-substance",
    title: "Blog Hero - Comprehensive addiction recovery programme for every substance",
    category: "blog-healing-program",
    src: "/art/watercolor/art-watercolor-blog-comprehensive-addiction-recovery-programme-for-every-substance.png",
    alt: "Minimal watercolor illustration of an anonymous figure beside a unified pathway and pause point, suggesting one recovery approach across patterns.",
    prompt: `${basePrompt} Show an anonymous black figure beside one unified teal pathway that gently gathers small symbolic forms into a single calm route with one gold pause point.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Comprehensive addiction recovery programme for every substance.",
  },
  {
    id: "blog-comprehensive-addiction-recovery-programme-no-single-therapy-works-for-every-substance",
    title: "Blog Hero - Comprehensive addiction recovery programme (integrated approach)",
    category: "blog-healing-program",
    src: "/art/watercolor/art-watercolor-blog-comprehensive-addiction-recovery-programme-no-single-therapy-works-for-every-substance.png",
    alt: "Minimal watercolor illustration of several soft path lines meeting one pause point, suggesting no single method fits every substance alone.",
    prompt: `${basePrompt} Show three soft teal pathway lines converging into one shared gold pause point beside an anonymous figure, suggesting integration rather than a single isolated method.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: Comprehensive addiction recovery programme (alternate slug).",
  },
  {
    id: "blog-the-spiritual-cause-of-addiction",
    title: "Blog Hero - The Spiritual Cause of Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-the-spiritual-cause-of-addiction.png",
    alt: "Minimal watercolor illustration of an anonymous figure beside a soft loop and quiet gold pause, suggesting inner stillness without religious icons.",
    prompt: `${basePrompt} Show an anonymous black figure beside a gentle circular pathway and a soft gold pause point suggesting inner stillness. No religious icons.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog: The Spiritual Cause of Addiction.",
  },
  {
    id: "blog-the-spiritual-causes-of-alcohol-addiction",
    title: "Blog Hero - The Spiritual Causes of Alcohol Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-the-spiritual-causes-of-alcohol-addiction.png",
    alt: "Minimal watercolor illustration of an unlabeled glass silhouette beside a gentle loop and pause point, suggesting spiritual awareness around alcohol patterns.",
    prompt: `${basePrompt} Show an unlabeled glass silhouette beside a loose teal circular pathway and one muted gold pause point. No bottle labels or religious icons.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog draft: The Spiritual Causes of Alcohol Addiction.",
  },
  {
    id: "blog-the-spiritual-causes-of-nicotine-addiction",
    title: "Blog Hero - The Spiritual Causes of Nicotine Addiction",
    category: "blog-addiction-recovery",
    src: "/art/watercolor/art-watercolor-blog-the-spiritual-causes-of-nicotine-addiction.png",
    alt: "Minimal watercolor illustration of a soft vapor curl with a pause break in a gentle loop, suggesting spiritual awareness around nicotine patterns.",
    prompt: `${basePrompt} Show a soft vapor curl or small stick silhouette with a clear pause/break line inside a gentle teal pathway, plus one muted gold pause point.`,
    palette: sharedPalette,
    usage: "Hero artwork for CMS blog draft: The Spiritual Causes of Nicotine Addiction.",
  },
  ...blogArtEntries,
  ...caseStudyArtEntries,
];

/** Gerald portrait backgrounds — swap `artId` on a page to match context. */
export const geraldPortraitArtIds = [
  "gerald-crawford",
  "gerald-crawford-pattern-loop",
  "gerald-crawford-recovery-path",
  "gerald-crawford-warm-gold",
] as const;

export const artGalleryById: ReadonlyMap<string, ArtGalleryItem> = new Map(artGallery.map((item) => [item.id, item]));
export const artGalleryByCategory: ReadonlyMap<string, ArtGalleryItem> = new Map(artGallery.map((item) => [item.category, item]));

const missingBlogArtwork = blogPosts.filter((post) => !artGalleryById.has(post.heroArtId)).map((post) => post.slug);
if (missingBlogArtwork.length) {
  throw new Error(`Missing watercolor artwork metadata for blog posts: ${missingBlogArtwork.join(", ")}`);
}

const missingCaseStudyArtwork = caseStudies
  .filter((study) => !artGalleryById.has(study.heroArtId))
  .map((study) => study.slug);
if (missingCaseStudyArtwork.length) {
  throw new Error(`Missing watercolor artwork metadata for case studies: ${missingCaseStudyArtwork.join(", ")}`);
}
