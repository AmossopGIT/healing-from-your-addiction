import { homeFaqs } from "@/content/faqs";
import { foodContent } from "@/content/food";
import { gamblingContent } from "@/content/gambling";
import { programmeBySlug, type Programme } from "@/content/programmes";
import { getSeoByPath } from "@/content/seo";
import type { LandingPageContent } from "@/content/types";

const activeContentBySlug: Record<string, LandingPageContent> = {
  gambling: gamblingContent,
  "food-binge-eating": foodContent,
};

function programmeFaqs(programme: Programme) {
  const concernLower = programme.concern.toLowerCase();
  return [
    ...homeFaqs,
    {
      question: `Can this support help with ${concernLower} patterns?`,
      answer:
        "This support is pattern-focused and may help with urge awareness, emotional triggers and response change. It is not a medical cure and does not replace emergency, psychiatric or specialist treatment where required.",
    },
  ];
}

function generatedPillarContent(programme: Programme): LandingPageContent {
  const pageSeo = getSeoByPath(programme.pillarHref);
  const title = pageSeo?.title ?? `${programme.title} Support South Africa | Healing From Your Addiction`;
  const description =
    pageSeo?.description ??
    `${programme.description} Confidential pattern-focused support with hypnotherapy and EFT-informed methods in South Africa.`;
  const comingSoon = programme.status === "coming-soon";

  return {
    path: programme.pillarHref,
    breadcrumbLabel: programme.title,
    defaultConcern: programme.concern,
    seo: {
      title,
      description,
    },
    hero: {
      eyebrow: "Confidential addiction support in South Africa",
      title: `${programme.title} support focused on the behaviour pattern`,
      description: programme.description,
      primaryCta: `Start a Confidential ${programme.title} Enquiry`,
    },
    painSection: {
      title: `When ${programme.concern.toLowerCase()} becomes repetitive, change can feel difficult alone`,
      intro:
        "Patterns are often reinforced by stress, emotional relief, routine cues and automatic responses. The first step is understanding how your loop is working now.",
      points: [
        { text: "Repeated urges in high-stress moments" },
        { text: "Short relief followed by regret or pressure" },
        { text: "Automatic routines that feel difficult to interrupt" },
        { text: "Emotional triggers that restart the cycle" },
        { text: "Attempts to stop that do not hold for long" },
      ],
    },
    programme: {
      title: comingSoon ? "Programme launch in progress" : "A structured support framework",
      body: comingSoon
        ? `This dedicated ${programme.title.toLowerCase()} pillar page is being expanded. You can still make a confidential enquiry now and Gerald can advise on next steps.`
        : "The work focuses on identifying trigger loops, creating pause before action, strengthening emotional regulation and reinforcing practical daily changes between sessions.",
      points: comingSoon
        ? ["Private enquiry is open now", "Support direction can be discussed confidentially", "Further page detail is being prepared"]
        : ["Pattern and trigger mapping", "Urge and response interruption", "Emotional regulation support", "Daily reinforcement planning"],
    },
    education: [
      {
        title: "Why repetitive addiction patterns can persist",
        body:
          "Many patterns become automatic when stress, anticipation, reward and relief are linked to a repeated behaviour. Sustainable change often needs both awareness and new practiced responses.",
      },
      {
        title: "How hypnotherapy and EFT-informed work may help",
        body:
          "Hypnotherapy and EFT-informed methods may support calmer response states, trigger awareness and behavioural rehearsal. This is supportive work and does not guarantee outcomes.",
      },
    ],
    sessionFocus: [
      {
        label: "Stage 1",
        title: "Pattern mapping",
        body: "Identify high-risk windows, emotional states and behaviour loops.",
      },
      {
        label: "Stage 2",
        title: "Trigger response reset",
        body: "Build practical alternatives and pause anchors for urges.",
      },
      {
        label: "Stage 3",
        title: "Reinforcement",
        body: "Strengthen daily routines that support consistency and control.",
      },
      {
        label: "Stage 4",
        title: "Integration",
        body: "Plan for setbacks and maintain behaviour change momentum.",
      },
    ],
    dailySteps: [
      "Track urges and trigger context each day.",
      "Use a short pause before high-risk actions.",
      "Reduce exposure to your strongest triggers where possible.",
      "Use one replacement action when urge intensity rises.",
      "Review wins and pressure points weekly.",
    ],
    trust: {
      title: "Private, respectful support",
      body:
        "Gerald Crawford works with pattern-focused hypnotherapy and EFT-informed support. The enquiry process is confidential, non-judgemental and focused on practical change.",
    },
    faqs: programmeFaqs(programme),
    finalCta: {
      title: `Start a confidential ${programme.title.toLowerCase()} enquiry`,
      body: "If you are ready to discuss support options, you can begin with a private enquiry and choose your preferred contact method.",
      button: `Book a Confidential ${programme.title} Enquiry`,
    },
  };
}

export function getPillarLandingContent(slug: string): LandingPageContent | null {
  const programme = programmeBySlug.get(slug);
  if (!programme) return null;

  const active = activeContentBySlug[slug];
  if (active) {
    return {
      ...active,
      path: programme.pillarHref,
      breadcrumbLabel: programme.title,
    };
  }

  return generatedPillarContent(programme);
}
