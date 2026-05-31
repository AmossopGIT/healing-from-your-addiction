export type FAQ = {
  question: string;
  answer: string;
};

export type InfoBlock = {
  title: string;
  body: string;
  points?: string[];
};

export type SessionBlock = {
  label: string;
  title: string;
  body: string;
};

export type PainPoint = {
  text: string;
  artId?: string;
};

export type LandingPageContent = {
  path: string;
  breadcrumbLabel: string;
  defaultConcern: string;
  /** Watercolor artwork shown in the hero column when a form is present. */
  heroArtId?: string;
  seo: {
    title: string;
    description: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
  };
  painSection: {
    title: string;
    intro: string;
    points: PainPoint[];
  };
  programme: InfoBlock;
  education: InfoBlock[];
  sessionFocus: SessionBlock[];
  dailySteps: string[];
  trust: InfoBlock;
  faqs: FAQ[];
  finalCta: {
    title: string;
    body: string;
    button: string;
  };
};
