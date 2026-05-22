import {
  blogCategoryBySlug,
  blogCategoryPath,
  blogPath,
  blogPostBySlug,
  blogTagBySlug,
  blogTagPath,
} from "@/content/blog";
import { caseStudyBySlug, caseStudyPath } from "@/content/caseStudies";

export type SeoPageType =
  | "home"
  | "programme"
  | "programme-overview"
  | "addiction-hub"
  | "support"
  | "method"
  | "cravings"
  | "trust"
  | "about"
  | "contact"
  | "conversion"
  | "blog"
  | "blog-category"
  | "blog-tag"
  | "blog-post"
  | "case-study-hub"
  | "case-study";

export type SeoPageRecord = {
  path: string;
  title: string;
  description: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  pageType: SeoPageType;
  conversionGoal: string;
  canonicalPath?: string;
  noIndex?: boolean;
  ogImage?: string;
  ogImageAlt?: string;
};

const defaultOgImage = "/og-default.svg";

export const seoPages = {
  home: {
    path: "/",
    title: "Healing From Your Addiction | Hypnotherapy Addiction Support South Africa",
    description:
      "Healing From Your Addiction offers confidential hypnotherapy and EFT-based support for addiction patterns, cravings, gambling addiction, food addiction and emotional triggers in South Africa.",
    primaryKeyword: "hypnotherapy addiction support South Africa",
    secondaryKeywords: [
      "addiction support South Africa",
      "hypnotherapy for addiction",
      "EFT addiction support",
      "addiction pattern support",
      "craving and trigger support",
    ],
    searchIntent: "Find confidential addiction pattern support and understand the service.",
    pageType: "home",
    conversionGoal: "Start a confidential enquiry or choose a programme page.",
    ogImage: defaultOgImage,
    ogImageAlt: "Healing From Your Addiction confidential addiction support in South Africa",
  },
  gambling: {
    path: "/addictions/gambling-addiction-help/",
    title: "Gambling Addiction Healing Program South Africa | Healing From Your Addiction",
    description:
      "Confidential gambling addiction support using hypnotherapy, EFT and behavioural pattern work. Get help for betting urges, chasing losses and gambling triggers.",
    primaryKeyword: "gambling addiction help South Africa",
    secondaryKeywords: [
      "stop gambling help",
      "how to stop gambling",
      "online gambling addiction help",
      "betting addiction support",
      "chasing losses gambling help",
      "hypnotherapy for gambling addiction",
    ],
    searchIntent: "Get private help for gambling urges, betting behaviour, and loss chasing.",
    pageType: "programme",
    conversionGoal: "Submit a gambling addiction enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Private gambling addiction help focused on triggers and betting urges",
  },
  food: {
    path: "/addictions/food-addiction-binge-eating-help/",
    title: "Food Addiction & Binge Eating Healing Program South Africa | Healing From Your Addiction",
    description:
      "Support for food addiction, binge eating, emotional eating and cravings through hypnotherapy, EFT and subconscious pattern work.",
    primaryKeyword: "food addiction and binge eating help South Africa",
    secondaryKeywords: [
      "food addiction help",
      "binge eating help",
      "emotional eating support",
      "how to stop emotional eating",
      "stress eating help",
      "food craving support",
      "hypnotherapy for food cravings",
    ],
    searchIntent: "Find support for emotional eating, food cravings, and binge patterns.",
    pageType: "programme",
    conversionGoal: "Submit a food addiction or binge eating enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Food addiction and binge eating support for emotional eating patterns",
  },
  programmes: {
    path: "/programs/",
    title: "Addiction Healing Programs | Healing From Your Addiction",
    description:
      "Explore confidential hypnotherapy and EFT-based support programmes for gambling addiction, food addiction, binge eating and future addiction support categories.",
    primaryKeyword: "addiction healing programmes South Africa",
    secondaryKeywords: [
      "addiction support programmes",
      "hypnotherapy addiction programmes",
      "EFT addiction programmes",
      "gambling and food addiction support",
      "confidential addiction enquiry",
    ],
    searchIntent: "Compare available addiction support programmes and choose a category.",
    pageType: "programme-overview",
    conversionGoal: "Move to a programme landing page or submit a general enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Addiction healing programme options for confidential support",
  },
  fourWeekProgram: {
    path: "/programs/4-week-addiction-healing-program/",
    title: "4-Week Addiction Healing Program South Africa | Healing From Your Addiction",
    description:
      "Learn how the structured 4-week, 8-session addiction healing program works, including hypnotherapy, EFT, daily reinforcement and confidential enquiry steps.",
    primaryKeyword: "4 week addiction healing program South Africa",
    secondaryKeywords: [
      "8 session hypnotherapy program",
      "addiction support program South Africa",
      "custom addiction recovery program",
      "hypnotherapy addiction program",
    ],
    searchIntent: "Understand the structure, pricing and fit of the 4-week addiction support program.",
    pageType: "programme-overview",
    conversionGoal: "Start a confidential programme enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "4-week addiction healing program with structured sessions and daily support",
  },
  addictions: {
    path: "/addictions/",
    title: "Addiction Help South Africa | Types of Addiction Support",
    description:
      "Explore confidential support for gambling, food, alcohol, cannabis, nicotine, pornography, social media and gaming addiction patterns in South Africa.",
    primaryKeyword: "addiction help South Africa",
    secondaryKeywords: [
      "types of addiction",
      "behavioural addiction help",
      "substance addiction support",
      "hypnotherapy addiction support",
      "addiction treatment support",
    ],
    searchIntent: "Compare addiction types and choose the most relevant support page.",
    pageType: "addiction-hub",
    conversionGoal: "Move visitors into a matching addiction money page or enquiry.",
    ogImage: "/art/watercolor/art-watercolor-pattern-map.png",
    ogImageAlt: "Addiction help overview for substance and behavioural addiction patterns",
  },
  about: {
    path: "/about-gerald-crawford/",
    title: "About Gerald Crawford | Healing From Your Addiction",
    description:
      "Learn about Gerald Crawford, his hypnotherapy background and his approach to supporting people with addictive patterns, cravings and emotional triggers.",
    primaryKeyword: "Gerald Crawford hypnotherapy addiction support",
    secondaryKeywords: [
      "Gerald Crawford hypnotherapy",
      "addiction pattern support practitioner",
      "EFT informed addiction support",
      "hypnotherapy background addiction",
    ],
    searchIntent: "Evaluate the practitioner, approach, and professional boundaries.",
    pageType: "about",
    conversionGoal: "Build trust before a confidential enquiry.",
    ogImage: "/art/watercolor/art-watercolor-gerald-crawford.png",
    ogImageAlt: "Watercolor portrait of Gerald Crawford, hypnotherapist, in calm professional attire.",
  },
  contact: {
    path: "/contact/",
    title: "Contact Healing From Your Addiction | Confidential Enquiry",
    description:
      "Contact Gerald Crawford for a confidential enquiry about hypnotherapy, EFT and addiction pattern support for gambling, food addiction, binge eating and other concerns.",
    primaryKeyword: "confidential addiction support enquiry",
    secondaryKeywords: [
      "contact addiction support South Africa",
      "private addiction enquiry",
      "hypnotherapy addiction enquiry",
      "WhatsApp addiction support enquiry",
    ],
    searchIntent: "Contact Gerald Crawford privately and choose a preferred response method.",
    pageType: "contact",
    conversionGoal: "Submit the enquiry form or click WhatsApp, email, or phone.",
    ogImage: defaultOgImage,
    ogImageAlt: "Contact Healing From Your Addiction for a confidential enquiry",
  },
  thankYou: {
    path: "/thank-you/",
    title: "Thank You | Healing From Your Addiction",
    description: "Thank you for your confidential enquiry. Gerald Crawford will respond as soon as possible.",
    primaryKeyword: "confidential addiction enquiry received",
    secondaryKeywords: ["addiction enquiry thank you", "Healing From Your Addiction thank you"],
    searchIntent: "Confirm successful form submission.",
    pageType: "conversion",
    conversionGoal: "Record lead conversion and offer follow-up contact options.",
    noIndex: true,
    ogImage: defaultOgImage,
    ogImageAlt: "Healing From Your Addiction confidential enquiry received",
  },
  caseStudies: {
    path: "/case-studies/",
    title: "Addiction Case Studies and Programme Resources | Healing From Your Addiction",
    description:
      "Browse anonymized outcome stories, EFT scripts, programme outlines, intake questions, and affirmations from Healing From Your Addiction support work.",
    primaryKeyword: "addiction hypnotherapy case studies South Africa",
    secondaryKeywords: [
      "addiction recovery case studies",
      "EFT tapping scripts addiction",
      "hypnotherapy programme examples",
      "addiction support resources",
    ],
    searchIntent: "Explore real-world style examples and structured programme resources by addiction topic.",
    pageType: "case-study-hub",
    conversionGoal: "Move readers into relevant programme pages or a confidential enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Case studies and programme resources for addiction pattern support",
  },
  blog: {
    path: "/blog/",
    title: "Addiction Recovery Resources | Healing From Your Addiction",
    description:
      "Browse addiction recovery articles, case studies, EFT scripts, and programme resources from Healing From Your Addiction — organised by topic for clearer discovery.",
    primaryKeyword: "addiction recovery blog South Africa",
    secondaryKeywords: [
      "hypnotherapy blog addiction support",
      "healing program articles",
      "addiction category pages",
      "tagged addiction resources",
    ],
    searchIntent: "Browse addiction recovery articles, category hubs, and tagged educational content.",
    pageType: "blog",
    conversionGoal: "Move readers from education into relevant programme or enquiry pages.",
    ogImage: defaultOgImage,
    ogImageAlt: "Blog and educational resources for addiction recovery support",
  },
  alcohol: {
    path: "/addictions/alcohol-addiction-help/",
    title: "Alcohol Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Pattern-focused support for alcohol cravings and emotional triggers with confidential hypnotherapy and EFT-informed methods in South Africa.",
    primaryKeyword: "alcohol addiction support South Africa",
    secondaryKeywords: [
      "alcohol cravings support",
      "stop drinking support",
      "hypnotherapy for alcohol cravings",
      "alcohol trigger support",
    ],
    searchIntent: "Ask about non-emergency support for alcohol craving and trigger patterns.",
    pageType: "programme",
    conversionGoal: "Submit an alcohol support enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Alcohol addiction support for cravings and emotional triggers",
  },
  cannabis: {
    path: "/addictions/cannabis-addiction-help/",
    title: "Cannabis Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Support for cannabis habit loops, emotional dependence, routines and trigger awareness through confidential pattern-focused support.",
    primaryKeyword: "cannabis addiction support South Africa",
    secondaryKeywords: [
      "cannabis habit support",
      "stop cannabis support",
      "marijuana addiction help",
      "cannabis dependence support",
    ],
    searchIntent: "Find private support for cannabis habits, routines, and emotional dependence.",
    pageType: "programme",
    conversionGoal: "Submit a cannabis support enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Cannabis addiction support for habit loops and triggers",
  },
  nicotine: {
    path: "/addictions/nicotine-addiction-help/",
    title: "Nicotine Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Support for smoking or vaping patterns, nicotine cravings, identity shifts and daily reinforcement with confidential pattern-focused care.",
    primaryKeyword: "nicotine addiction support South Africa",
    secondaryKeywords: [
      "stop smoking support",
      "vaping addiction help",
      "nicotine craving support",
      "hypnotherapy for smoking",
    ],
    searchIntent: "Find support for smoking, vaping, and nicotine craving patterns.",
    pageType: "programme",
    conversionGoal: "Submit a nicotine support enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Nicotine addiction support for smoking and vaping patterns",
  },
  pornography: {
    path: "/addictions/pornography-addiction-help/",
    title: "Pornography Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Confidential support for compulsive pornography patterns, triggers and emotional regulation through hypnotherapy and EFT-informed methods.",
    primaryKeyword: "pornography addiction support South Africa",
    secondaryKeywords: [
      "porn addiction help",
      "compulsive pornography support",
      "pornography trigger support",
      "private pornography addiction enquiry",
    ],
    searchIntent: "Find confidential support for compulsive pornography patterns.",
    pageType: "programme",
    conversionGoal: "Submit a pornography support enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Private pornography addiction support for triggers and emotional regulation",
  },
  socialMedia: {
    path: "/addictions/social-media-addiction-help/",
    title: "Social Media Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Support for scrolling patterns, dopamine loops, avoidance and healthier digital boundaries through confidential pattern-focused care.",
    primaryKeyword: "social media addiction support South Africa",
    secondaryKeywords: [
      "scrolling addiction help",
      "social media habit support",
      "digital addiction support",
      "phone addiction support",
    ],
    searchIntent: "Ask about support for social media habit loops and digital boundaries.",
    pageType: "programme",
    conversionGoal: "Register interest in social media addiction support.",
    noIndex: true,
    ogImage: defaultOgImage,
    ogImageAlt: "Social media addiction support for scrolling patterns and digital boundaries",
  },
  gaming: {
    path: "/addictions/gaming-addiction-help/",
    title: "Gaming Addiction Support South Africa | Healing From Your Addiction",
    description:
      "Support for gaming habit loops, escape patterns, routine change and emotional triggers through confidential pattern-focused care.",
    primaryKeyword: "gaming addiction support South Africa",
    secondaryKeywords: [
      "gaming addiction help",
      "video game addiction support",
      "gaming habit support",
      "online gaming addiction help",
    ],
    searchIntent: "Ask about support for gaming patterns, routine change, and emotional triggers.",
    pageType: "programme",
    conversionGoal: "Register interest in gaming addiction support.",
    noIndex: true,
    ogImage: defaultOgImage,
    ogImageAlt: "Gaming addiction support for habit loops and emotional triggers",
  },
  howToStopGambling: {
    path: "/addictions/gambling-addiction-help/how-to-stop-gambling/",
    title: "How to Stop Gambling | Gambling Addiction Support South Africa",
    description:
      "Learn practical steps to interrupt gambling urges, block high-risk access, stop chasing losses and start a confidential recovery enquiry.",
    primaryKeyword: "how to stop gambling",
    secondaryKeywords: ["stop gambling help", "quit gambling", "help me stop gambling", "gambling addiction support"],
    searchIntent: "Find practical help for stopping gambling behaviour.",
    pageType: "support",
    conversionGoal: "Move readers into the gambling recovery enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "How to stop gambling support with pause and trigger awareness",
  },
  stopChasingLosses: {
    path: "/addictions/gambling-addiction-help/stop-chasing-losses/",
    title: "Stop Chasing Losses | Gambling Addiction Help",
    description:
      "Understand why chasing losses keeps gambling loops active and how pattern-focused support can help create a pause before the next bet.",
    primaryKeyword: "stop chasing losses",
    secondaryKeywords: ["chasing losses gambling", "gambling debt pressure", "why do I keep chasing losses", "betting loss chasing"],
    searchIntent: "Understand and interrupt the loss-chasing gambling loop.",
    pageType: "support",
    conversionGoal: "Move readers into gambling programme support.",
    ogImage: defaultOgImage,
    ogImageAlt: "Gambling loss chasing loop with a clear pause point",
  },
  gamblingUrges: {
    path: "/addictions/gambling-addiction-help/gambling-urges/",
    title: "Gambling Urges Help | Manage Betting Cravings",
    description:
      "Learn how gambling urges build, why betting cravings can feel automatic and how hypnotherapy and EFT-informed support may help.",
    primaryKeyword: "gambling urges",
    secondaryKeywords: ["betting cravings", "gambling craving support", "urge to gamble", "gambling trigger help"],
    searchIntent: "Find help understanding and managing gambling urges.",
    pageType: "support",
    conversionGoal: "Move readers into a gambling support enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Gambling urge support with a trigger craving pause loop",
  },
  howToStopBingeEating: {
    path: "/addictions/food-addiction-binge-eating-help/how-to-stop-binge-eating/",
    title: "How to Stop Binge Eating | Food Addiction Support",
    description:
      "Learn how binge eating patterns can be supported with trigger awareness, craving control and a balanced non-restrictive approach.",
    primaryKeyword: "how to stop binge eating",
    secondaryKeywords: ["binge eating help", "stop binge eating support", "food addiction help", "loss of control eating"],
    searchIntent: "Find practical, non-shaming support for binge eating patterns.",
    pageType: "support",
    conversionGoal: "Move readers into a food addiction enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Binge eating support with a calm pause before eating",
  },
  emotionalEatingHelp: {
    path: "/addictions/food-addiction-binge-eating-help/emotional-eating-help/",
    title: "Emotional Eating Help South Africa | Food Addiction Support",
    description:
      "Understand emotional eating triggers and how hypnotherapy and EFT-informed support may help create more choice around food.",
    primaryKeyword: "emotional eating help",
    secondaryKeywords: ["emotional eating support", "comfort eating help", "how to stop emotional eating", "stress eating support"],
    searchIntent: "Find support for eating linked to emotion, stress and comfort.",
    pageType: "support",
    conversionGoal: "Move readers into the food addiction programme enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Emotional eating support with calm food trigger awareness",
  },
  sugarCravingsHelp: {
    path: "/addictions/food-addiction-binge-eating-help/sugar-cravings-help/",
    title: "Sugar Cravings Help | Food Addiction and Craving Support",
    description:
      "Learn why sugar cravings and processed-food urges can feel automatic and how pattern-focused support may help build more control.",
    primaryKeyword: "sugar cravings help",
    secondaryKeywords: ["food cravings help", "processed food cravings", "hypnotherapy for food cravings", "craving control support"],
    searchIntent: "Find help for sugar cravings and processed-food urges.",
    pageType: "support",
    conversionGoal: "Move readers into food craving and programme support.",
    ogImage: defaultOgImage,
    ogImageAlt: "Sugar craving support with a spoon and pause point",
  },
  hypnotherapyForAddiction: {
    path: "/hypnotherapy-for-addiction/",
    title: "Hypnotherapy for Addiction South Africa | Cravings and Habit Loops",
    description:
      "Learn how hypnotherapy may support addiction recovery by working with cravings, emotional triggers, subconscious patterns and behaviour loops.",
    primaryKeyword: "hypnotherapy for addiction South Africa",
    secondaryKeywords: ["hypnotherapy for cravings", "subconscious addiction patterns", "hypnotherapy addiction support", "hypnotherapy for gambling addiction"],
    searchIntent: "Understand whether hypnotherapy may support addiction patterns.",
    pageType: "method",
    conversionGoal: "Move readers into a relevant addiction page or enquiry.",
    ogImage: "/art/watercolor/art-watercolor-approach-subconscious.png",
    ogImageAlt: "Hypnotherapy for addiction support and subconscious pattern change",
  },
  eftTappingForCravings: {
    path: "/eft-tapping-for-cravings/",
    title: "EFT Tapping for Addiction Cravings | Healing From Your Addiction",
    description:
      "Learn how EFT tapping may support calmer responses to addiction cravings, emotional triggers, gambling urges and food cravings.",
    primaryKeyword: "EFT tapping for addiction cravings",
    secondaryKeywords: ["EFT for cravings", "EFT for gambling urges", "EFT for food cravings", "emotional trigger support"],
    searchIntent: "Understand EFT tapping as support for cravings and emotional triggers.",
    pageType: "method",
    conversionGoal: "Move readers into addiction support pages or enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "EFT tapping support for cravings and emotional triggers",
  },
  urgeSurfing: {
    path: "/cravings/urge-surfing/",
    title: "Urge Surfing for Addiction Cravings | Pause Before Acting",
    description:
      "Learn the idea of urge surfing, how cravings rise and fall, and how a pause can support gambling, food and other addiction patterns.",
    primaryKeyword: "urge surfing",
    secondaryKeywords: ["how to control cravings", "pause before acting", "addiction cravings", "trigger craving behaviour reward loop"],
    searchIntent: "Learn a practical craving-control concept before seeking support.",
    pageType: "cravings",
    conversionGoal: "Move readers into a relevant addiction or method page.",
    ogImage: defaultOgImage,
    ogImageAlt: "Urge surfing support with a craving wave and pause point",
  },
  faqs: {
    path: "/faqs/",
    title: "Addiction Hypnotherapy FAQs | Healing From Your Addiction",
    description:
      "Answers to common questions about addiction hypnotherapy, EFT, the 4-week program, confidentiality, medical safety and enquiries.",
    primaryKeyword: "addiction hypnotherapy FAQs",
    secondaryKeywords: ["gambling addiction FAQs", "food addiction FAQs", "hypnotherapy safety", "addiction program FAQs"],
    searchIntent: "Answer trust, safety and programme questions before enquiry.",
    pageType: "trust",
    conversionGoal: "Reduce uncertainty and move visitors into enquiry.",
    ogImage: defaultOgImage,
    ogImageAlt: "Frequently asked questions about addiction support",
  },
  medicalDisclaimer: {
    path: "/medical-disclaimer/",
    title: "Medical Disclaimer | Healing From Your Addiction",
    description:
      "Important medical and safety boundaries for Healing From Your Addiction, including when emergency, psychiatric, detox or rehab care may be required.",
    primaryKeyword: "addiction support medical disclaimer",
    secondaryKeywords: ["addiction emergency support", "medical detox warning", "hypnotherapy disclaimer", "addiction safety guidance"],
    searchIntent: "Understand professional boundaries and urgent-care situations.",
    pageType: "trust",
    conversionGoal: "Set safe expectations and direct urgent cases to appropriate care.",
    noIndex: false,
    ogImage: defaultOgImage,
    ogImageAlt: "Medical disclaimer and safety boundaries for addiction support",
  },
  privacyPolicy: {
    path: "/privacy-policy/",
    title: "Privacy Policy | Healing From Your Addiction",
    description:
      "Read how Healing From Your Addiction handles confidential enquiry information, contact details and privacy for addiction support enquiries.",
    primaryKeyword: "Healing From Your Addiction privacy policy",
    secondaryKeywords: ["private addiction enquiry", "confidential enquiry privacy", "POPIA addiction support"],
    searchIntent: "Understand privacy before submitting an enquiry.",
    pageType: "trust",
    conversionGoal: "Build trust around confidential enquiries.",
    ogImage: defaultOgImage,
    ogImageAlt: "Privacy policy for confidential addiction support enquiries",
  },
} satisfies Record<string, SeoPageRecord>;

export const seoPageList: SeoPageRecord[] = Object.values(seoPages);

export const seoByPath = new Map(seoPageList.map((page) => [page.path, page] as const));

export function getSeoByPath(path: string) {
  const exact = seoByPath.get(path);
  if (exact) return exact;

  const blogPostSlug = path.match(/^\/blog\/([^/]+)\/$/)?.[1];
  if (blogPostSlug) {
    const post = blogPostBySlug.get(blogPostSlug);
    if (post) {
      return {
        path: blogPath(post.slug),
        title: `${post.title} | Healing From Your Addiction`,
        description: post.description,
        primaryKeyword: post.primaryKeyword,
        secondaryKeywords: post.secondaryKeywords,
        searchIntent: "Read an educational addiction recovery article.",
        pageType: "blog-post",
        conversionGoal: "Move readers toward a relevant programme page or confidential enquiry.",
        ogImage: defaultOgImage,
        ogImageAlt: post.title,
      } satisfies SeoPageRecord;
    }
  }

  const blogCategorySlug = path.match(/^\/blog\/category\/([^/]+)\/$/)?.[1];
  if (blogCategorySlug) {
    const category = blogCategoryBySlug.get(blogCategorySlug);
    if (category) {
      return {
        path: blogCategoryPath(category.slug),
        title: `${category.title} Blog Articles | Healing From Your Addiction`,
        description: category.description,
        primaryKeyword: category.primaryKeyword,
        secondaryKeywords: [
          `${category.title.toLowerCase()} addiction articles`,
          "addiction blog category",
          "tagged addiction resources",
        ],
        searchIntent: "Browse a focused category of addiction recovery articles.",
        pageType: "blog-category",
        conversionGoal: "Move readers from a category hub into an article or programme page.",
        ogImage: defaultOgImage,
        ogImageAlt: `${category.title} addiction recovery articles`,
      } satisfies SeoPageRecord;
    }
  }

  const blogTagSlug = path.match(/^\/blog\/tag\/([^/]+)\/$/)?.[1];
  if (blogTagSlug) {
    const tag = blogTagBySlug.get(blogTagSlug);
    if (tag) {
      return {
        path: blogTagPath(tag.slug),
        title: `${tag.label} Articles | Healing From Your Addiction`,
        description: `Browse tagged blog articles for ${tag.label.toLowerCase()} from Healing From Your Addiction.`,
        primaryKeyword: `${tag.label.toLowerCase()} addiction articles`,
        secondaryKeywords: ["tagged addiction blog content", "addiction support educational tags"],
        searchIntent: "Browse related addiction recovery articles by topic tag.",
        pageType: "blog-tag",
        conversionGoal: "Move readers from a tag archive into an article or programme page.",
        ogImage: defaultOgImage,
        ogImageAlt: `${tag.label} tagged addiction recovery articles`,
      } satisfies SeoPageRecord;
    }
  }

  const caseStudySlug = path.match(/^\/case-studies\/([^/]+)\/$/)?.[1];
  if (caseStudySlug) {
    const study = caseStudyBySlug.get(caseStudySlug);
    if (study) {
      return {
        path: caseStudyPath(study.slug),
        title: `${study.title} | Healing From Your Addiction`,
        description: study.description,
        primaryKeyword: study.primaryKeyword,
        secondaryKeywords: study.secondaryKeywords,
        searchIntent: "Read an educational addiction case study or programme resource.",
        pageType: "case-study",
        conversionGoal: "Move readers toward a relevant programme page or confidential enquiry.",
        ogImage: defaultOgImage,
        ogImageAlt: study.title,
      } satisfies SeoPageRecord;
    }
  }

  return undefined;
}

export function keywordsForMetadata(page: SeoPageRecord) {
  return [page.primaryKeyword, ...page.secondaryKeywords];
}
