export type Programme = {
  slug: string;
  title: string;
  concern: string;
  description: string;
  /** Backwards-compatible destination used by existing card/link code. */
  href: string;
  /** Primary canonical route for this programme. */
  primaryHref: string;
  /** New scalable pillar namespace route. */
  pillarHref: string;
  /** Canonical target used by metadata. */
  canonicalHref: string;
  /** Whether the pillar route should be indexed and included in sitemap. */
  indexablePillar: boolean;
  status: "active" | "enquire" | "coming-soon";
};

export const programmes: Programme[] = [
  {
    slug: "gambling",
    title: "Gambling Addiction",
    concern: "Gambling",
    description:
      "Support for betting urges, chasing losses, online gambling triggers, shame, secrecy and financial pressure.",
    primaryHref: "/addictions/gambling-addiction-help/",
    pillarHref: "/addictions/gambling-addiction-help/",
    canonicalHref: "/addictions/gambling-addiction-help/",
    indexablePillar: true,
    href: "/addictions/gambling-addiction-help/",
    status: "active",
  },
  {
    slug: "food-binge-eating",
    title: "Food Addiction / Binge Eating",
    concern: "Food / binge eating",
    description:
      "Support for emotional eating, sugar cravings, late-night eating, binge patterns and loss of control around food.",
    primaryHref: "/addictions/food-addiction-binge-eating-help/",
    pillarHref: "/addictions/food-addiction-binge-eating-help/",
    canonicalHref: "/addictions/food-addiction-binge-eating-help/",
    indexablePillar: true,
    href: "/addictions/food-addiction-binge-eating-help/",
    status: "active",
  },
  {
    slug: "alcohol",
    title: "Alcohol Addiction",
    concern: "Alcohol",
    description: "Pattern-focused support for alcohol cravings and emotional triggers. Medical detox may be required first.",
    primaryHref: "/addictions/alcohol-addiction-help/",
    pillarHref: "/addictions/alcohol-addiction-help/",
    canonicalHref: "/addictions/alcohol-addiction-help/",
    indexablePillar: true,
    href: "/addictions/alcohol-addiction-help/",
    status: "enquire",
  },
  {
    slug: "cannabis",
    title: "Cannabis Addiction",
    concern: "Cannabis",
    description: "Support for cannabis habit loops, emotional dependence, routines and trigger awareness.",
    primaryHref: "/addictions/cannabis-addiction-help/",
    pillarHref: "/addictions/cannabis-addiction-help/",
    canonicalHref: "/addictions/cannabis-addiction-help/",
    indexablePillar: true,
    href: "/addictions/cannabis-addiction-help/",
    status: "enquire",
  },
  {
    slug: "nicotine",
    title: "Nicotine Addiction",
    concern: "Nicotine",
    description: "Support for smoking or vaping patterns, cravings, identity shifts and daily reinforcement.",
    primaryHref: "/addictions/nicotine-addiction-help/",
    pillarHref: "/addictions/nicotine-addiction-help/",
    canonicalHref: "/addictions/nicotine-addiction-help/",
    indexablePillar: true,
    href: "/addictions/nicotine-addiction-help/",
    status: "enquire",
  },
  {
    slug: "pornography",
    title: "Pornography Addiction",
    concern: "Pornography",
    description: "Confidential support for compulsive pornography patterns, triggers and emotional regulation.",
    primaryHref: "/addictions/pornography-addiction-help/",
    pillarHref: "/addictions/pornography-addiction-help/",
    canonicalHref: "/addictions/pornography-addiction-help/",
    indexablePillar: true,
    href: "/addictions/pornography-addiction-help/",
    status: "enquire",
  },
  {
    slug: "social-media",
    title: "Social Media Addiction",
    concern: "Social media",
    description: "Support for scrolling patterns, dopamine loops, avoidance and healthier digital boundaries.",
    primaryHref: "/addictions/social-media-addiction-help/",
    pillarHref: "/addictions/social-media-addiction-help/",
    canonicalHref: "/addictions/social-media-addiction-help/",
    indexablePillar: false,
    href: "/addictions/social-media-addiction-help/",
    status: "coming-soon",
  },
  {
    slug: "gaming",
    title: "Gaming Addiction",
    concern: "Gaming",
    description: "Support for gaming habit loops, escape patterns, routine change and emotional triggers.",
    primaryHref: "/addictions/gaming-addiction-help/",
    pillarHref: "/addictions/gaming-addiction-help/",
    canonicalHref: "/addictions/gaming-addiction-help/",
    indexablePillar: false,
    href: "/addictions/gaming-addiction-help/",
    status: "coming-soon",
  },
];

export const programmeBySlug = new Map(programmes.map((programme) => [programme.slug, programme] as const));
