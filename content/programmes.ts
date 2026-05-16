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
    primaryHref: "/gambling-addiction-help/",
    pillarHref: "/addiction-help/gambling/",
    canonicalHref: "/gambling-addiction-help/",
    indexablePillar: false,
    href: "/gambling-addiction-help/",
    status: "active",
  },
  {
    slug: "food-binge-eating",
    title: "Food Addiction / Binge Eating",
    concern: "Food / binge eating",
    description:
      "Support for emotional eating, sugar cravings, late-night eating, binge patterns and loss of control around food.",
    primaryHref: "/food-addiction-binge-eating-help/",
    pillarHref: "/addiction-help/food-binge-eating/",
    canonicalHref: "/food-addiction-binge-eating-help/",
    indexablePillar: false,
    href: "/food-addiction-binge-eating-help/",
    status: "active",
  },
  {
    slug: "alcohol",
    title: "Alcohol Addiction",
    concern: "Alcohol",
    description: "Pattern-focused support for alcohol cravings and emotional triggers. Medical detox may be required first.",
    primaryHref: "/addiction-help/alcohol/",
    pillarHref: "/addiction-help/alcohol/",
    canonicalHref: "/addiction-help/alcohol/",
    indexablePillar: true,
    href: "/addiction-help/alcohol/",
    status: "enquire",
  },
  {
    slug: "cannabis",
    title: "Cannabis Addiction",
    concern: "Cannabis",
    description: "Support for cannabis habit loops, emotional dependence, routines and trigger awareness.",
    primaryHref: "/addiction-help/cannabis/",
    pillarHref: "/addiction-help/cannabis/",
    canonicalHref: "/addiction-help/cannabis/",
    indexablePillar: true,
    href: "/addiction-help/cannabis/",
    status: "enquire",
  },
  {
    slug: "nicotine",
    title: "Nicotine Addiction",
    concern: "Nicotine",
    description: "Support for smoking or vaping patterns, cravings, identity shifts and daily reinforcement.",
    primaryHref: "/addiction-help/nicotine/",
    pillarHref: "/addiction-help/nicotine/",
    canonicalHref: "/addiction-help/nicotine/",
    indexablePillar: true,
    href: "/addiction-help/nicotine/",
    status: "enquire",
  },
  {
    slug: "pornography",
    title: "Pornography Addiction",
    concern: "Pornography",
    description: "Confidential support for compulsive pornography patterns, triggers and emotional regulation.",
    primaryHref: "/addiction-help/pornography/",
    pillarHref: "/addiction-help/pornography/",
    canonicalHref: "/addiction-help/pornography/",
    indexablePillar: true,
    href: "/addiction-help/pornography/",
    status: "enquire",
  },
  {
    slug: "social-media",
    title: "Social Media Addiction",
    concern: "Social media",
    description: "Support for scrolling patterns, dopamine loops, avoidance and healthier digital boundaries.",
    primaryHref: "/addiction-help/social-media/",
    pillarHref: "/addiction-help/social-media/",
    canonicalHref: "/addiction-help/social-media/",
    indexablePillar: false,
    href: "/addiction-help/social-media/",
    status: "coming-soon",
  },
  {
    slug: "gaming",
    title: "Gaming Addiction",
    concern: "Gaming",
    description: "Support for gaming habit loops, escape patterns, routine change and emotional triggers.",
    primaryHref: "/addiction-help/gaming/",
    pillarHref: "/addiction-help/gaming/",
    canonicalHref: "/addiction-help/gaming/",
    indexablePillar: false,
    href: "/addiction-help/gaming/",
    status: "coming-soon",
  },
];

export const programmeBySlug = new Map(programmes.map((programme) => [programme.slug, programme] as const));
