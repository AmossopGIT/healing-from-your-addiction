import {
  blogCategoryBySlug,
  blogCategoryPath,
  blogPath,
  blogPostBySlug,
  blogTagBySlug,
  blogTagPath,
} from "@/content/blog";

export type SeoPageType =
  | "home"
  | "programme"
  | "programme-overview"
  | "about"
  | "contact"
  | "conversion"
  | "blog"
  | "blog-category"
  | "blog-tag"
  | "blog-post";

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
    path: "/gambling-addiction-help/",
    title: "Gambling Addiction Help South Africa | Healing From Your Addiction",
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
    path: "/food-addiction-binge-eating-help/",
    title: "Food Addiction & Binge Eating Help South Africa | Healing From Your Addiction",
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
    path: "/addiction-healing-programmes/",
    title: "Addiction Healing Programmes | Healing From Your Addiction",
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
  blog: {
    path: "/blog/",
    title: "Addiction Recovery Blog | Healing From Your Addiction",
    description:
      "Read addiction recovery and hypnotherapy blog articles from Healing From Your Addiction, with category pillars and tagged educational content for better indexing.",
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
    path: "/addiction-help/alcohol/",
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
    path: "/addiction-help/cannabis/",
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
    path: "/addiction-help/nicotine/",
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
    path: "/addiction-help/pornography/",
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
    path: "/addiction-help/social-media/",
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
    path: "/addiction-help/gaming/",
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

  return undefined;
}

export function keywordsForMetadata(page: SeoPageRecord) {
  return [page.primaryKeyword, ...page.secondaryKeywords];
}
