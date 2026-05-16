import { foodFaqs } from "@/content/faqs";
import { seoPages } from "@/content/seo";
import type { LandingPageContent } from "@/content/types";

export const foodContent: LandingPageContent = {
  path: "/food-addiction-binge-eating-help/",
  breadcrumbLabel: "Food Addiction and Binge Eating Help",
  defaultConcern: "Food / binge eating",
  seo: {
    title: seoPages.food.title,
    description: seoPages.food.description,
  },
  hero: {
    eyebrow: "Confidential food addiction and binge eating support",
    title: "Food addiction and binge eating support for emotional eating patterns",
    description:
      "Support for emotional eating, sugar cravings, late-night eating and the feeling of losing control around food, using a calm pattern-focused approach.",
    primaryCta: "Book a Confidential Food Addiction Enquiry",
  },
  painSection: {
    title: "When eating becomes emotional relief, willpower can feel unreliable",
    intro:
      "Food patterns can become linked to stress, comfort, boredom, shame, reward and restriction. The aim is not punishment. The aim is understanding and change.",
    points: [
      { text: "Eating when you are not physically hungry" },
      { text: "Sugar cravings or processed-food urges" },
      { text: "Late-night eating or secret eating" },
      { text: "Binge episodes followed by shame" },
      { text: "All-or-nothing dieting cycles" },
      { text: "Feeling a loss of control around certain foods" },
    ],
  },
  programme: {
    title: "A structured 8-session support process over 4 weeks",
    body:
      "The food addiction and binge eating programme is designed to support craving awareness, emotional regulation, subconscious pattern work and a healthier relationship with food. It is not a diet plan and it does not replace specialist eating disorder or medical care.",
    points: [
      "Separate physical hunger from emotional urge",
      "Work with cravings and trigger foods",
      "Build calmer eating choices",
      "Reduce shame and all-or-nothing thinking",
    ],
  },
  education: [
    {
      title: "The difference between hunger and emotional urge",
      body:
        "Physical hunger usually builds gradually and can be satisfied by a range of foods. Emotional urge can feel sudden, specific and driven by stress, tiredness, boredom or discomfort.",
      points: ["Body hunger", "Emotional craving", "Stress response", "Restriction rebound", "Reward seeking"],
    },
    {
      title: "How hypnotherapy and EFT may support craving control",
      body:
        "Hypnotherapy and EFT may support a calmer internal state and help rehearse new responses to old eating triggers. The focus is creating more awareness and choice, not promising a cure or a quick fix.",
      points: ["Craving awareness", "Emotional regulation", "Subconscious association work", "Pause before eating"],
    },
    {
      title: "Building a healthier relationship with food",
      body:
        "Food cannot be removed from daily life. The goal is to reduce the emotional charge around eating and support a steadier, more respectful relationship with your body and choices.",
      points: ["Less shame", "More steadiness", "Balanced routines", "Greater choice"],
    },
  ],
  sessionFocus: [
    {
      label: "Week 1",
      title: "Awareness and body reconnection",
      body: "Map eating triggers, cravings, shame cycles and the difference between physical hunger and emotional urge.",
    },
    {
      label: "Week 2",
      title: "Craving control and emotional eating work",
      body: "Support new responses to sugar cravings, stress eating, late-night urges and binge patterns.",
    },
    {
      label: "Week 3",
      title: "Mindful control and identity shift",
      body: "Develop calmer eating choices and a less shame-based relationship with food and self-image.",
    },
    {
      label: "Week 4",
      title: "Trigger mastery and integration",
      body: "Reinforce daily practices and prepare for high-risk moments without extreme restriction.",
    },
  ],
  dailySteps: [
    "Eat at steadier times where possible.",
    "Avoid extreme restriction that can increase rebound urges.",
    "Pause before eating to identify hunger, emotion or habit.",
    "Keep early trigger foods managed rather than relying on willpower alone.",
    "Use non-food emotional regulation options when stress rises.",
  ],
  trust: {
    title: "Confidential support that avoids shame and diet culture pressure",
    body:
      "Gerald's approach focuses on patterns, cravings and emotional triggers. The work is calm, private and designed to support change without framing you as weak or broken.",
  },
  faqs: foodFaqs,
  finalCta: {
    title: "Start with a confidential food addiction enquiry",
    body: "If food, cravings or binge eating patterns feel difficult to control, you can begin with a private enquiry and choose how Gerald should respond.",
    button: "Book a Confidential Food Addiction Enquiry",
  },
};
