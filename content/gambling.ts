import { gamblingFaqs } from "@/content/faqs";
import { seoPages } from "@/content/seo";
import type { LandingPageContent } from "@/content/types";

export const gamblingContent: LandingPageContent = {
  path: "/addictions/gambling-addiction-help/",
  breadcrumbLabel: "Gambling Addiction Healing Program",
  defaultConcern: "Gambling",
  seo: {
    title: seoPages.gambling.title,
    description: seoPages.gambling.description,
  },
  hero: {
    eyebrow: "Confidential gambling addiction support in South Africa",
    title: "Gambling Addiction Healing Program",
    description:
      "Support for betting urges, chasing losses, online gambling triggers, financial pressure and the emotional loop that keeps the behaviour repeating.",
    primaryCta: "Start Your Gambling Recovery Enquiry",
  },
  painSection: {
    title: "When gambling becomes a loop, logic alone may not feel strong enough",
    intro:
      "Gambling problems are often held in place by anticipation, stress relief, shame and the belief that one more bet could undo the damage.",
    points: [
      { text: "Chasing losses after a bad session", artId: "gambling-pain-chasing-losses" },
      { text: "Betting apps or online casinos always within reach", artId: "gambling-pain-apps-reach" },
      { text: "Stress, secrecy and shame after gambling", artId: "gambling-pain-stress-shame" },
      { text: "Financial pressure and promises to stop", artId: "gambling-pain-financial-pressure" },
      { text: "The pull of near-misses, bonuses and fast results", artId: "gambling-pain-near-misses" },
      { text: "Using gambling as escape from emotion or pressure", artId: "gambling-pain-emotional-escape" },
    ],
  },
  programme: {
    title: "A structured 8-session support process over 4 weeks",
    body:
      "The gambling programme is a 4-week, 8-session support process at R12,000. It is designed to help you understand the urge cycle, interrupt automatic responses and build practical reinforcement between sessions. It is supportive, confidential and focused on behaviour patterns rather than judgement.",
    points: [
      "Identify the trigger-to-bet loop",
      "Create pause before action",
      "Work with emotional and financial pressure triggers",
      "Build daily reinforcement and relapse-prevention habits",
    ],
  },
  education: [
    {
      title: "Why gambling addiction can feel so powerful",
      body:
        "Gambling can combine uncertainty, reward anticipation, near-misses, escape and loss chasing. The mind learns to associate the next bet with relief or possibility, even when the results are harmful.",
      points: ["Reward anticipation", "Loss chasing", "Near-miss reinforcement", "Illusion of control", "Emotional escape"],
    },
    {
      title: "How hypnotherapy and EFT may support behaviour change",
      body:
        "Hypnotherapy and EFT may help by supporting calm, pattern awareness, emotional regulation and new responses to old triggers. The aim is to create space between the urge and the action, not to promise instant or guaranteed recovery.",
      points: ["Urge awareness", "Subconscious pattern work", "Calming the nervous system", "New response rehearsal"],
    },
  ],
  sessionFocus: [
    {
      label: "Week 1",
      title: "Awareness and pattern break",
      body: "Map gambling triggers, identify urge states and begin building a pause anchor before betting behaviour.",
    },
    {
      label: "Week 2",
      title: "Craving control and trigger work",
      body: "Work with cravings, app triggers, emotional stress and the pull to chase losses.",
    },
    {
      label: "Week 3",
      title: "Emotional regulation and identity reset",
      body: "Support steadier responses to pressure, shame and the identity of being trapped in the gambling loop.",
    },
    {
      label: "Week 4",
      title: "Relapse prevention and integration",
      body: "Build a practical support rhythm for high-risk times and reinforce the new behaviour pattern.",
    },
  ],
  dailySteps: [
    "Block or limit access to gambling apps and websites where possible.",
    "Reduce easy access to betting funds with appropriate support.",
    "Track urges without acting on them.",
    "Use a pause anchor before any high-risk decision.",
    "Replace idle gambling windows with planned structure.",
  ],
  trust: {
    title: "Private, respectful support from Gerald Crawford",
    body:
      "Gerald works with hypnotherapy, EFT, emotional awareness and subconscious pattern work. The enquiry process is confidential and designed to help you speak about the pattern without being shamed.",
  },
  faqs: gamblingFaqs,
  finalCta: {
    title: "Start with a confidential gambling addiction enquiry",
    body: "If gambling, betting apps or chasing losses have started taking more from your life, you can begin with a private enquiry.",
    button: "Start Your Gambling Recovery Enquiry",
  },
};
