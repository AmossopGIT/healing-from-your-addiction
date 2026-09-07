import { seoPages } from "@/content/seo";

export type HealingPackageTone = "free" | "paid" | "fast-track";

export type HealingPackage = {
  id: string;
  letter: "A" | "B" | "C" | "D" | "E";
  name: string;
  stepVerb: string;
  duration: string;
  sessions: string;
  supportLevel: string;
  investment: string;
  investmentNote?: string;
  idealFor: string;
  includes: string[];
  differentiation: string;
  extrasBeyondPrevious?: string[];
  extrasBeyondLabel?: string;
  ctaLabel: string;
  ctaHref: string;
  artId: string;
  tone: HealingPackageTone;
};

export const healingPackagesPath = "/programs/healing-packages/";

export const healingPackagesPhilosophy =
  "Nobody should be excluded from the opportunity to begin healing because they cannot afford treatment. Those who can invest more can receive increasing levels of personal support, accountability and hypnotherapy.";

export const healingPackages: HealingPackage[] = [
  {
    id: "package-a",
    letter: "A",
    name: "The Free Start",
    stepVerb: "Start for free",
    duration: "Self-paced",
    sessions: "—",
    supportLevel: "Begin",
    investment: "FREE",
    investmentNote: "Basic tools to start understanding and changing an addictive habit.",
    idealFor: "People who are struggling financially and simply need somewhere to begin.",
    includes: [
      "EFT Tapping",
      "Healing Affirmations",
      "Basic addiction-healing information",
      "Understanding habits and addictive patterns",
      "Introduction to changing destructive habits",
    ],
    differentiation: "Removes the financial barrier so anyone can begin the healing journey.",
    ctaLabel: "Explore free resources",
    ctaHref: seoPages.blog.path,
    artId: "package-free-start",
    tone: "free",
  },
  {
    id: "package-b",
    letter: "B",
    name: "The Foundation Plan",
    stepVerb: "Get support",
    duration: "4 months",
    sessions: "4 hypnotherapy sessions (1 per month)",
    supportLevel: "Essential",
    investment: "R550/month",
    investmentNote: "4-month programme · total R2,200",
    idealFor: "People who need ongoing guidance and personal hypnotherapy support but cannot afford an intensive programme.",
    includes: [
      "Complete Basic Information Pack",
      "Healing Affirmations",
      "EFT Tapping",
      "Understanding and changing habits",
      "Addiction-healing guidance",
      "1 hypnotherapy session per month",
      "4 hypnotherapy sessions over 4 months",
    ],
    differentiation: "The affordable first paid step — monthly support without jumping to a full intensive programme.",
    extrasBeyondPrevious: [
      "Personal hypnotherapy once a month",
      "Ongoing guidance across four months",
      "Complete basic information pack",
    ],
    extrasBeyondLabel: "Beyond the Free Start",
    ctaLabel: "Enquire about Foundation Plan",
    ctaHref: "#enquiry",
    artId: "package-foundation",
    tone: "paid",
  },
  {
    id: "package-c",
    letter: "C",
    name: "The Transformation Plan",
    stepVerb: "Go deeper",
    duration: "4 months",
    sessions: "8 hypnotherapy sessions (2 per month)",
    supportLevel: "Deeper",
    investment: "R1,800/month",
    investmentNote: "4-month programme · total R7,200",
    idealFor:
      "People who recognise that they need more regular personal intervention to change deeply established patterns.",
    includes: [
      "Complete Basic Information Pack",
      "Healing Affirmations",
      "EFT Tapping",
      "Habit-change guidance",
      "Addiction-healing education",
      "2 hypnotherapy sessions per month",
      "8 hypnotherapy sessions over 4 months",
    ],
    differentiation:
      "Affordable subscription with essential resources and eight sessions — more personal intervention than Foundation, without the full premium programme structure.",
    extrasBeyondPrevious: [
      "Twice-monthly hypnotherapy (8 sessions total)",
      "Deeper habit-change and addiction-healing education",
    ],
    extrasBeyondLabel: "Beyond the Foundation Plan",
    ctaLabel: "Enquire about Transformation Plan",
    ctaHref: "#enquiry",
    artId: "package-transformation",
    tone: "paid",
  },
  {
    id: "package-d",
    letter: "D",
    name: "The Complete Healing Plan",
    stepVerb: "Complete the journey",
    duration: "4 months",
    sessions: "8 hypnotherapy sessions (2 per month)",
    supportLevel: "Comprehensive",
    investment: "R12,000 total",
    investmentNote: "Or 4 monthly payments of R3,000",
    idealFor:
      "People who want a structured, comprehensive four-month healing experience with a higher level of personal support.",
    includes: [
      "Complete Basic Information Pack",
      "Healing Affirmations",
      "EFT Tapping",
      "Habit-change programme",
      "Addiction-healing education",
      "Personal healing guidance",
      "2 hypnotherapy sessions per month",
      "8 hypnotherapy sessions over 4 months",
      "Structured four-month healing journey",
    ],
    differentiation:
      "Same eight sessions as Transformation — the difference is significantly more personal support, accountability, between-session guidance, structured journey design and priority scheduling.",
    extrasBeyondPrevious: [
      "Personal healing guidance between sessions",
      "Higher accountability and structured four-month journey",
      "Priority scheduling",
      "Comprehensive programme framing (not subscription-only essentials)",
    ],
    extrasBeyondLabel: "Included beyond Package C",
    ctaLabel: "Enquire about Complete Healing Plan",
    ctaHref: "#enquiry",
    artId: "package-complete-healing",
    tone: "paid",
  },
  {
    id: "package-e",
    letter: "E",
    name: "The Master Plan — Fast Track",
    stepVerb: "Fast-track your healing",
    duration: "30 days",
    sessions: "8 hypnotherapy sessions",
    supportLevel: "Intensive",
    investment: "On enquiry",
    investmentNote: "30 days · 8 sessions · one concentrated commitment",
    idealFor: "People who want to commit fully to an accelerated healing process in one focused month.",
    includes: [
      "Complete Basic Information Pack",
      "Healing Affirmations",
      "EFT Tapping",
      "Habit-change programme",
      "Addiction-healing guidance",
      "8 hypnotherapy sessions",
      "30-day intensive healing programme",
      "More concentrated personal intervention",
      "Fast-track approach to changing the patterns underlying the addiction",
    ],
    differentiation:
      "Not simply more sessions — eight sessions compressed into 30 days for intensive, time-bound commitment.",
    extrasBeyondPrevious: [
      "Sessions concentrated into one month (not four)",
      "Fast-track intensity and scheduling",
    ],
    extrasBeyondLabel: "What makes Fast Track different",
    ctaLabel: "Enquire about Master Plan",
    ctaHref: "#enquiry",
    artId: "package-master-fast-track",
    tone: "fast-track",
  },
];

export function getHealingPackageById(id: string) {
  return healingPackages.find((pkg) => pkg.id === id) ?? null;
}
