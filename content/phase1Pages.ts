import { seoPages, type SeoPageRecord } from "@/content/seo";

export type PageLink = {
  label: string;
  href: string;
  artSlug?: string;
  linkArtId?: string;
};

export type ContentSection = {
  eyebrow?: string;
  title: string;
  body: string;
  bullets?: string[];
  artId?: string;
};

export type Phase1Page = {
  seo: SeoPageRecord;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta?: string;
    secondaryCta?: string;
    secondaryHref?: string;
  };
  defaultConcern?: string;
  artId?: string;
  heroArtId?: string;
  sections: ContentSection[];
  links: PageLink[];
  showLeadForm?: boolean;
  finalCta?: {
    title: string;
    body: string;
    button: string;
    href?: string;
  };
};

export const addictionMoneyLinks: PageLink[] = [
  { label: "Gambling Addiction Healing Program", href: seoPages.gambling.path, artSlug: "gambling" },
  { label: "Food Addiction / Binge Eating Healing Program", href: seoPages.food.path, artSlug: "food-binge-eating" },
  { label: "Alcohol Addiction Support", href: seoPages.alcohol.path, artSlug: "alcohol" },
  { label: "Cannabis Addiction Support", href: seoPages.cannabis.path, artSlug: "cannabis" },
  { label: "Nicotine Addiction Support", href: seoPages.nicotine.path, artSlug: "nicotine" },
  { label: "Pornography Addiction Support", href: seoPages.pornography.path, artSlug: "pornography" },
  { label: "Social Media Addiction Support", href: seoPages.socialMedia.path, artSlug: "social-media" },
  { label: "Gaming Addiction Support", href: seoPages.gaming.path, artSlug: "gaming" },
];

export const gamblingSupportLinks: PageLink[] = [
  { label: "How to Stop Gambling", href: seoPages.howToStopGambling.path },
  { label: "Stop Chasing Losses", href: seoPages.stopChasingLosses.path },
  { label: "Gambling Urges Help", href: seoPages.gamblingUrges.path },
  { label: "Hypnotherapy for Addiction", href: seoPages.hypnotherapyForAddiction.path },
  { label: "4-Week Addiction Healing Program", href: seoPages.fourWeekProgram.path },
];

export const foodSupportLinks: PageLink[] = [
  { label: "How to Stop Binge Eating", href: seoPages.howToStopBingeEating.path },
  { label: "Emotional Eating Help", href: seoPages.emotionalEatingHelp.path },
  { label: "Sugar Cravings Help", href: seoPages.sugarCravingsHelp.path },
  { label: "EFT Tapping for Cravings", href: seoPages.eftTappingForCravings.path },
  { label: "4-Week Addiction Healing Program", href: seoPages.fourWeekProgram.path },
];

export const phase1Pages: Record<string, Phase1Page> = {
  addictions: {
    seo: seoPages.addictions,
    hero: {
      eyebrow: "Addiction support hub",
      title: "Addiction help that starts with the pattern",
      description:
        "Explore support pages for gambling, food, alcohol, cannabis, nicotine, pornography, social media and gaming addiction patterns. Each page connects the condition, triggers, programme structure and next enquiry step.",
      primaryCta: "Start Your Healing Program",
      secondaryCta: "View the 4-Week Program",
      secondaryHref: seoPages.fourWeekProgram.path,
    },
    heroArtId: "pattern-map",
    artId: "pattern-map",
    sections: [
      {
        eyebrow: "How addiction is framed here",
        title: "Trigger, craving, behaviour, relief and repetition",
        artId: "pattern-loop",
        body:
          "Healing From Your Addiction treats addiction as a repeated pattern that can involve stress, anticipation, emotional relief, reward and automatic response. The goal is to understand the loop and build more choice before action.",
      },
      {
        eyebrow: "Commercial pages",
        title: "Start with the addiction type",
        body:
          "The strongest current programmes are gambling addiction and food addiction / binge eating. Other addiction pages are structured for enquiry and future campaign expansion.",
      },
    ],
    links: addictionMoneyLinks,
    showLeadForm: true,
  },
  fourWeekProgram: {
    seo: seoPages.fourWeekProgram,
    hero: {
      eyebrow: "4-week custom healing program",
      title: "A structured 8-session addiction healing program",
      description:
        "The core programme runs over 4 weeks with 8 support sessions, daily reinforcement and careful safety boundaries. The current programme price is R12,000.",
      primaryCta: "Start Your Healing Program",
      secondaryCta: "Compare Addiction Pages",
      secondaryHref: seoPages.addictions.path,
    },
    artId: "programme-overview",
    sections: [
      {
        eyebrow: "Programme rhythm",
        title: "8 sessions over 4 weeks",
        body:
          "The programme is designed to repeat and reinforce change. Early sessions map the pattern, middle sessions work with cravings and emotional triggers, and later sessions focus on integration and relapse prevention.",
        bullets: ["Pattern mapping", "Craving and trigger support", "Hypnotherapy and EFT-informed work", "Daily reinforcement", "Relapse prevention planning"],
      },
      {
        eyebrow: "Fit",
        title: "Who this may support",
        body:
          "This is for people seeking structured support for psychological and behavioural patterns. It is not emergency care, medical detox, psychiatric treatment or a replacement for rehabilitation where those services are required.",
      },
      {
        eyebrow: "Investment",
        title: "Program price",
        body:
          "The current 4-week, 8-session programme is positioned at R12,000. The enquiry step is confidential and helps clarify whether the programme is appropriate before starting.",
      },
    ],
    links: [
      { label: seoPages.gambling.title.replace(" | Healing From Your Addiction", ""), href: seoPages.gambling.path, artSlug: "gambling" },
      { label: seoPages.food.title.replace(" | Healing From Your Addiction", ""), href: seoPages.food.path, artSlug: "food-binge-eating" },
      { label: seoPages.hypnotherapyForAddiction.title.replace(" | Healing From Your Addiction", ""), href: seoPages.hypnotherapyForAddiction.path, linkArtId: "approach-subconscious" },
      { label: seoPages.eftTappingForCravings.title.replace(" | Healing From Your Addiction", ""), href: seoPages.eftTappingForCravings.path, linkArtId: "approach-emotional" },
    ],
    showLeadForm: true,
  },
  hypnotherapyForAddiction: {
    seo: seoPages.hypnotherapyForAddiction,
    hero: {
      eyebrow: "Treatment method",
      title: "Hypnotherapy for addiction patterns and cravings",
      description:
        "Hypnotherapy may support addiction recovery by working with subconscious associations, emotional triggers, urge states and new response rehearsal.",
      primaryCta: "Ask About Hypnotherapy Support",
      secondaryCta: "View Addiction Pages",
      secondaryHref: seoPages.addictions.path,
    },
    heroArtId: "approach-subconscious",
    artId: "approach-subconscious",
    sections: [
      {
        title: "Why subconscious pattern work matters",
        body:
          "Many addiction loops happen quickly. A trigger activates emotion, expectation or discomfort, and the familiar behaviour can feel automatic. Hypnotherapy is used here to support calmer response states and rehearse different choices.",
        artId: "approach-subconscious",
      },
      {
        title: "Where hypnotherapy fits",
        body:
          "This support is most relevant for cravings, habits, emotional triggers and behavioural loops. It does not replace medical detox, psychiatric treatment, emergency care or licensed rehabilitation where those are required.",
        artId: "approach-emotional",
      },
    ],
    links: [
      { label: seoPages.gambling.title.replace(" | Healing From Your Addiction", ""), href: seoPages.gambling.path, artSlug: "gambling" },
      { label: seoPages.food.title.replace(" | Healing From Your Addiction", ""), href: seoPages.food.path, artSlug: "food-binge-eating" },
      { label: seoPages.nicotine.title.replace(" | Healing From Your Addiction", ""), href: seoPages.nicotine.path, artSlug: "nicotine" },
      { label: seoPages.alcohol.title.replace(" | Healing From Your Addiction", ""), href: seoPages.alcohol.path, artSlug: "alcohol" },
      { label: seoPages.urgeSurfing.title.replace(" | Healing From Your Addiction", ""), href: seoPages.urgeSurfing.path, linkArtId: "pattern-craving" },
    ],
    showLeadForm: true,
  },
  eftTappingForCravings: {
    seo: seoPages.eftTappingForCravings,
    hero: {
      eyebrow: "Craving support method",
      title: "EFT tapping for addiction cravings and emotional triggers",
      description:
        "EFT-informed support may help calm emotional charge around cravings, urges and old trigger states before deeper pattern work.",
      primaryCta: "Ask About EFT Support",
      secondaryCta: "Read About Urge Surfing",
      secondaryHref: seoPages.urgeSurfing.path,
    },
    artId: "approach-emotional",
    sections: [
      {
        title: "Cravings often carry emotional charge",
        body:
          "Urges are rarely only logical. Stress, shame, tiredness, anticipation or pressure can intensify the pull toward old behaviour. EFT-informed work is used to support a calmer state and a stronger pause.",
      },
      {
        title: "How this supports the programme",
        body:
          "EFT can be combined with hypnotherapy, daily reinforcement and practical trigger planning. It is supportive work, not a guaranteed cure.",
      },
    ],
    links: [seoPages.gamblingUrges, seoPages.sugarCravingsHelp, seoPages.food, seoPages.gambling].map((page) => ({
      label: page.title.replace(" | Healing From Your Addiction", ""),
      href: page.path,
    })),
    showLeadForm: true,
  },
  urgeSurfing: {
    seo: seoPages.urgeSurfing,
    hero: {
      eyebrow: "Cravings hub",
      title: "Urge surfing: create a pause before acting",
      description:
        "Urge surfing is the practice of noticing a craving as it rises, peaks and falls instead of treating it as a command that must be obeyed.",
      primaryCta: "Get Help With Cravings",
      secondaryCta: "Explore Addiction Support",
      secondaryHref: seoPages.addictions.path,
    },
    artId: "pattern-craving",
    sections: [
      {
        title: "Cravings rise and fall",
        body:
          "A craving can feel urgent, but it usually changes in intensity. Learning to pause, track the trigger and ride the wave can help create space before the old behaviour happens.",
      },
      {
        title: "Where support can help",
        body:
          "Support can help identify high-risk cues, build a repeatable pause routine and reinforce new responses across gambling, food and other addiction patterns.",
      },
    ],
    links: [seoPages.gamblingUrges, seoPages.sugarCravingsHelp, seoPages.hypnotherapyForAddiction, seoPages.eftTappingForCravings].map((page) => ({
      label: page.title.replace(" | Healing From Your Addiction", ""),
      href: page.path,
    })),
    showLeadForm: true,
  },
  howToStopGambling: {
    seo: seoPages.howToStopGambling,
    hero: {
      eyebrow: "Gambling support",
      title: "How to stop gambling when the urge feels automatic",
      description:
        "Stopping gambling starts with reducing access, interrupting the urge loop and getting support for the emotional pressure behind the next bet.",
      primaryCta: "Start Your Gambling Recovery Enquiry",
      secondaryCta: "View Gambling Program",
      secondaryHref: seoPages.gambling.path,
    },
    defaultConcern: "Gambling",
    artId: "gambling",
    sections: [
      {
        title: "Make access harder first",
        body:
          "Blocking gambling apps, reducing easy access to betting funds and creating accountability can lower immediate risk while deeper pattern work begins.",
      },
      {
        title: "Work with the trigger-to-bet loop",
        body:
          "The loop often moves from stress or anticipation into a bet, short relief and regret. Support focuses on creating a pause before the betting behaviour.",
      },
      {
        title: "Use structured support",
        body:
          "The gambling programme focuses on urges, chasing losses, emotional triggers, financial pressure and relapse prevention over 8 sessions.",
      },
    ],
    links: gamblingSupportLinks,
    showLeadForm: true,
  },
  stopChasingLosses: {
    seo: seoPages.stopChasingLosses,
    hero: {
      eyebrow: "Gambling support",
      title: "Stop chasing losses before the next bet",
      description:
        "Chasing losses can make gambling feel urgent and logical in the moment, even when it increases pressure and harm.",
      primaryCta: "Ask About Gambling Support",
      secondaryCta: "View Gambling Program",
      secondaryHref: seoPages.gambling.path,
    },
    defaultConcern: "Gambling",
    artId: "gambling-pain-chasing-losses",
    sections: [
      {
        title: "Why chasing losses is so powerful",
        body:
          "The mind can frame the next bet as a rescue attempt. Unpredictable reward, near-misses and financial pressure keep the loop emotionally charged.",
      },
      {
        title: "The support goal",
        body:
          "The goal is to create enough pause to step out of the rescue story, reduce access and work with the shame or pressure that restarts the pattern.",
      },
    ],
    links: gamblingSupportLinks,
    showLeadForm: true,
  },
  gamblingUrges: {
    seo: seoPages.gamblingUrges,
    hero: {
      eyebrow: "Gambling cravings",
      title: "Gambling urges are signals, not commands",
      description:
        "Betting cravings can feel fast and convincing. Support focuses on noticing the urge state, calming the trigger and choosing a different response.",
      primaryCta: "Get Help With Gambling Urges",
      secondaryCta: "Read About Urge Surfing",
      secondaryHref: seoPages.urgeSurfing.path,
    },
    defaultConcern: "Gambling",
    artId: "pattern-craving",
    sections: [
      {
        title: "What an urge can feel like",
        body:
          "An urge may include body tension, racing thoughts, financial rescue thinking, boredom or the belief that one bet will create relief.",
      },
      {
        title: "How support works with urges",
        body:
          "Hypnotherapy, EFT-informed support and daily reinforcement can help build a calmer pause between the urge and the action.",
      },
    ],
    links: gamblingSupportLinks,
    showLeadForm: true,
  },
  howToStopBingeEating: {
    seo: seoPages.howToStopBingeEating,
    hero: {
      eyebrow: "Food and binge eating support",
      title: "How to stop binge eating without shame or extreme restriction",
      description:
        "Binge eating support starts with understanding triggers, reducing all-or-nothing cycles and rebuilding choice around food.",
      primaryCta: "Start Your Food Recovery Enquiry",
      secondaryCta: "View Food Program",
      secondaryHref: seoPages.food.path,
    },
    defaultConcern: "Food / binge eating",
    artId: "food-binge-eating",
    sections: [
      {
        title: "Restriction can intensify the loop",
        body:
          "Food cannot be removed from daily life. The goal is not punishment or extreme restriction. The goal is control, balance and a healthier relationship with eating.",
      },
      {
        title: "Separate hunger, emotion and habit",
        body:
          "Support focuses on noticing whether the urge is physical hunger, emotional relief, routine, stress or rebound from restriction.",
      },
    ],
    links: foodSupportLinks,
    showLeadForm: true,
  },
  emotionalEatingHelp: {
    seo: seoPages.emotionalEatingHelp,
    hero: {
      eyebrow: "Food addiction support",
      title: "Emotional eating help for stress, comfort and craving patterns",
      description:
        "Emotional eating can become a relief loop. Support focuses on calming triggers and creating more choice before eating.",
      primaryCta: "Ask About Emotional Eating Support",
      secondaryCta: "View Food Program",
      secondaryHref: seoPages.food.path,
    },
    defaultConcern: "Food / binge eating",
    artId: "food-pain-not-hungry",
    sections: [
      {
        title: "Emotional eating is not weakness",
        body:
          "Stress, loneliness, boredom, fatigue and pressure can all make food feel like the fastest relief. The work starts by reducing shame and understanding the pattern.",
      },
      {
        title: "Build non-food regulation options",
        body:
          "The programme supports awareness, emotional regulation and daily reinforcement so food is not the only response when discomfort rises.",
      },
    ],
    links: foodSupportLinks,
    showLeadForm: true,
  },
  sugarCravingsHelp: {
    seo: seoPages.sugarCravingsHelp,
    hero: {
      eyebrow: "Food craving support",
      title: "Sugar cravings help for automatic food urges",
      description:
        "Sugar and processed-food cravings can become linked to stress, reward and routine. Support focuses on awareness, steadiness and choice.",
      primaryCta: "Get Help With Food Cravings",
      secondaryCta: "View Food Program",
      secondaryHref: seoPages.food.path,
    },
    defaultConcern: "Food / binge eating",
    artId: "food-pain-sugar-cravings",
    sections: [
      {
        title: "Cravings can be learned patterns",
        body:
          "Specific foods can become linked to comfort, reward, stress relief or end-of-day decompression. The urge can then feel automatic before you have time to choose.",
      },
      {
        title: "Control without punishment",
        body:
          "The food programme focuses on practical trigger planning, emotional regulation and calmer eating choices rather than harsh restriction.",
      },
    ],
    links: foodSupportLinks,
    showLeadForm: true,
  },
  medicalDisclaimer: {
    seo: seoPages.medicalDisclaimer,
    hero: {
      eyebrow: "Safety first",
      title: "Medical disclaimer and safety boundaries",
      description:
        "Healing From Your Addiction is supportive hypnotherapy, EFT-informed work and education. It is not emergency care, medical detox, psychiatric treatment or a replacement for rehab.",
      primaryCta: "Contact for a Non-Emergency Enquiry",
      secondaryCta: "View FAQs",
      secondaryHref: seoPages.faqs.path,
    },
    artId: "confidential-enquiry",
    sections: [
      {
        title: "When this support is not enough",
        body:
          "If there is overdose risk, suicidal thoughts, severe withdrawal, dangerous debt pressure, psychosis, medical instability or immediate safety risk, contact emergency services or an appropriate medical professional.",
      },
      {
        title: "Alcohol and substance withdrawal",
        body:
          "Alcohol and some substance withdrawal can be medically dangerous. Detox and medical supervision may be required before or alongside any supportive pattern work.",
      },
    ],
    links: [{ label: "Contact", href: seoPages.contact.path }, { label: "FAQs", href: seoPages.faqs.path }],
  },
  privacyPolicy: {
    seo: seoPages.privacyPolicy,
    hero: {
      eyebrow: "Privacy",
      title: "Privacy policy for confidential enquiries",
      description:
        "This page explains how enquiry information is used to respond to you and support confidential addiction-related communication.",
      primaryCta: "Start a Confidential Enquiry",
      secondaryCta: "Contact Page",
      secondaryHref: seoPages.contact.path,
    },
    artId: "confidential-enquiry",
    sections: [
      {
        title: "What information is collected",
        body:
          "The enquiry form may collect your name, email address, phone number, addiction concern, preferred contact method and message so Gerald can respond appropriately.",
      },
      {
        title: "How information is used",
        body:
          "Information is used to respond to your enquiry and understand the support request. Do not send emergency medical information through the form.",
      },
    ],
    links: [{ label: "Medical Disclaimer", href: seoPages.medicalDisclaimer.path }, { label: "Contact", href: seoPages.contact.path }],
  },
};

export const supportPageByPath = new Map(Object.values(phase1Pages).map((page) => [page.seo.path, page] as const));
