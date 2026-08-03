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
  category: "behavioral" | "substance";
};

function programme(
  slug: string,
  title: string,
  concern: string,
  description: string,
  options: {
    path?: string;
    status?: Programme["status"];
    indexablePillar?: boolean;
    category: Programme["category"];
  },
): Programme {
  const path = options.path ?? `/addictions/${slug}-addiction-help/`;
  return {
    slug,
    title,
    concern,
    description,
    primaryHref: path,
    pillarHref: path,
    canonicalHref: path,
    indexablePillar: options.indexablePillar ?? false,
    href: path,
    status: options.status ?? "enquire",
    category: options.category,
  };
}

export const programmes: Programme[] = [
  programme("gambling", "Gambling Addiction", "Gambling", "Support for betting urges, chasing losses, online gambling triggers, shame, secrecy and financial pressure.", {
    path: "/addictions/gambling-addiction-help/",
    status: "active",
    indexablePillar: true,
    category: "behavioral",
  }),
  programme("food-binge-eating", "Food Addiction / Binge Eating", "Food / binge eating", "Support for emotional eating, sugar cravings, late-night eating, binge patterns and loss of control around food.", {
    path: "/addictions/food-addiction-binge-eating-help/",
    status: "active",
    indexablePillar: true,
    category: "behavioral",
  }),
  programme("alcohol", "Alcohol Addiction", "Alcohol", "Pattern-focused support for alcohol cravings and emotional triggers. Medical detox may be required first.", {
    path: "/addictions/alcohol-addiction-help/",
    status: "enquire",
    indexablePillar: true,
    category: "substance",
  }),
  programme("cannabis", "Cannabis Addiction", "Cannabis", "Support for cannabis habit loops, emotional dependence, routines and trigger awareness.", {
    path: "/addictions/cannabis-addiction-help/",
    status: "enquire",
    indexablePillar: true,
    category: "substance",
  }),
  programme("nicotine", "Nicotine Addiction", "Nicotine", "Support for smoking or vaping patterns, cravings, identity shifts and daily reinforcement.", {
    path: "/addictions/nicotine-addiction-help/",
    status: "enquire",
    indexablePillar: true,
    category: "substance",
  }),
  programme("pornography", "Pornography Addiction", "Pornography", "Confidential support for compulsive pornography patterns, triggers and emotional regulation.", {
    path: "/addictions/pornography-addiction-help/",
    status: "enquire",
    indexablePillar: true,
    category: "behavioral",
  }),
  programme("social-media", "Social Media Addiction", "Social media", "Support for scrolling patterns, dopamine loops, avoidance and healthier digital boundaries.", {
    path: "/addictions/social-media-addiction-help/",
    status: "coming-soon",
    category: "behavioral",
  }),
  programme("gaming", "Gaming Addiction", "Gaming", "Support for gaming habit loops, escape patterns, routine change and emotional triggers.", {
    path: "/addictions/gaming-addiction-help/",
    status: "coming-soon",
    category: "behavioral",
  }),
  programme("adrenaline", "Adrenaline Addiction", "Adrenaline / thrill-seeking", "Support for thrill-seeking loops, impulsive risk, and finding excitement through purpose instead of danger.", {
    category: "behavioral",
  }),
  programme("attention", "Attention Addiction", "Attention / validation", "Support for constant approval-seeking, comparison loops, and rebuilding worth from within.", {
    category: "behavioral",
  }),
  programme("dopamine", "Dopamine / Reward-Seeking", "Dopamine / reward-seeking", "Support for compulsive novelty and instant-gratification loops, with steadier reward systems.", {
    category: "behavioral",
  }),
  programme("exercise", "Exercise Addiction", "Exercise", "Support for compulsive exercise patterns, overtraining, and restoring balance with the body.", {
    category: "behavioral",
  }),
  programme("internet", "Internet Addiction", "Internet", "Support for compulsive online use, attention fragmentation, and reclaiming real-life presence.", {
    category: "behavioral",
  }),
  programme("inhalant", "Inhalant Abuse", "Inhalants", "Support for inhalant dependence patterns with clear medical-safety escalation guidance.", {
    category: "substance",
  }),
  programme("opioid", "Opioid Addiction", "Opioids", "Support for opioid recovery patterns alongside medical care, safety planning, and accountability.", {
    category: "substance",
  }),
  programme("prescription-drug", "Prescription Drug Addiction", "Prescription drugs", "Support for benzodiazepine and sleeping-pill dependence patterns with taper-aware safety guidance.", {
    category: "substance",
  }),
  programme("relationship", "Relationship Addiction / Codependency", "Relationships / codependency", "Support for codependent patterns, boundaries, and rebuilding a steady sense of self.", {
    category: "behavioral",
  }),
  programme("sex", "Sex Addiction", "Sex / compulsive sexual behaviour", "Confidential support for compulsive sexual behaviour patterns, urge cycles, and integrity repair.", {
    category: "behavioral",
  }),
  programme("shopping", "Shopping Addiction", "Shopping / compulsive buying", "Support for compulsive buying loops, emotional spending, and steadier financial choices.", {
    category: "behavioral",
  }),
  programme("smartphone", "Smartphone Addiction", "Smartphone", "Support for phone checking loops, attention capture, and healthier device boundaries.", {
    category: "behavioral",
  }),
  programme("stimulant", "Stimulant Addiction", "Stimulants", "Support for cocaine or methamphetamine recovery patterns with medical-safety escalation guidance.", {
    category: "substance",
  }),
  programme("streaming-tv", "Streaming & TV Addiction", "Streaming / TV", "Support for binge-watching loops, escape patterns, and reclaiming time and energy.", {
    category: "behavioral",
  }),
  programme("work", "Work Addiction / Workaholism", "Work / workaholism", "Support for overwork loops, identity fusion with productivity, and restoring balance.", {
    category: "behavioral",
  }),
];

export const programmeBySlug = new Map(programmes.map((item) => [item.slug, item] as const));
