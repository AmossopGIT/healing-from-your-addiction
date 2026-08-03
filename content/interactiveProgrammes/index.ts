import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { DEFAULT_CADENCE, DEFAULT_DAILY_CHECKIN } from "@/content/interactiveProgrammes/types";
import adrenaline from "@/content/interactiveProgrammes/generated/adrenaline.json";
import alcohol from "@/content/interactiveProgrammes/generated/alcohol.json";
import attention from "@/content/interactiveProgrammes/generated/attention.json";
import cannabis from "@/content/interactiveProgrammes/generated/cannabis.json";
import dopamine from "@/content/interactiveProgrammes/generated/dopamine.json";
import exercise from "@/content/interactiveProgrammes/generated/exercise.json";
import foodBingeEating from "@/content/interactiveProgrammes/generated/food-binge-eating.json";
import gambling from "@/content/interactiveProgrammes/generated/gambling.json";
import gaming from "@/content/interactiveProgrammes/generated/gaming.json";
import inhalant from "@/content/interactiveProgrammes/generated/inhalant.json";
import internet from "@/content/interactiveProgrammes/generated/internet.json";
import nicotine from "@/content/interactiveProgrammes/generated/nicotine.json";
import opioid from "@/content/interactiveProgrammes/generated/opioid.json";
import pornography from "@/content/interactiveProgrammes/generated/pornography.json";
import prescriptionDrug from "@/content/interactiveProgrammes/generated/prescription-drug.json";
import relationship from "@/content/interactiveProgrammes/generated/relationship.json";
import sex from "@/content/interactiveProgrammes/generated/sex.json";
import shopping from "@/content/interactiveProgrammes/generated/shopping.json";
import smartphone from "@/content/interactiveProgrammes/generated/smartphone.json";
import socialMedia from "@/content/interactiveProgrammes/generated/social-media.json";
import stimulant from "@/content/interactiveProgrammes/generated/stimulant.json";
import streamingTv from "@/content/interactiveProgrammes/generated/streaming-tv.json";
import work from "@/content/interactiveProgrammes/generated/work.json";

function sanitizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[•]+\s*/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+\n/g, "\n")
    .trim();
}

function normalizeProgramme(raw: InteractiveProgrammeDefinition): InteractiveProgrammeDefinition {
  return {
    ...raw,
    reviewStatus: raw.reviewStatus ?? "pending",
    sourceExcerpt: raw.sourceExcerpt ?? sanitizeText(raw.description).slice(0, 280),
    sourceChecksum: raw.sourceChecksum ?? `${raw.slug}-legacy`,
    cadence: raw.cadence ?? DEFAULT_CADENCE,
    dailyCheckIn: raw.dailyCheckIn ?? DEFAULT_DAILY_CHECKIN,
    structure: raw.structure ?? {
      slug: raw.slug,
      expectedWeekCount: raw.weekCount,
      expectedDayCount: raw.dayCount,
      sourceActivityTypes: ["orientation", "weekly_focus", "daily_affirmation", "reflection", "closing"],
      optionalPlatformActivityTypes: ["trigger_map", "values_select"],
      reflectionDays: [],
      platformExerciseDays: [],
      reviewRequired: raw.category === "substance",
    },
    description: sanitizeText(raw.description),
    dailyReflection: sanitizeText(raw.dailyReflection),
    closingAffirmation: sanitizeText(raw.closingAffirmation),
    safety: {
      ...raw.safety,
      disclaimer: sanitizeText(raw.safety.disclaimer),
      reminder: sanitizeText(raw.safety.reminder),
      escalation: raw.safety.escalation ? sanitizeText(raw.safety.escalation) : null,
    },
    modules: raw.modules.map((module) => ({
      ...module,
      title: sanitizeText(module.title),
      theme: sanitizeText(module.theme),
      focus: module.focus.map(sanitizeText).filter(Boolean),
    })),
    activities: raw.activities.map((activity) => ({
      ...activity,
      origin: activity.origin ?? (activity.type === "trigger_map" || activity.type === "values_select" ? "platform" : "source"),
      title: sanitizeText(activity.title),
      prompt: activity.prompt ? sanitizeText(activity.prompt) : activity.prompt,
      affirmation: activity.affirmation ? sanitizeText(activity.affirmation) : activity.affirmation,
      focusItems: activity.focusItems?.map(sanitizeText),
    })),
  };
}

const rawProgrammes = [
  adrenaline,
  alcohol,
  attention,
  cannabis,
  dopamine,
  exercise,
  foodBingeEating,
  gambling,
  gaming,
  inhalant,
  internet,
  nicotine,
  opioid,
  pornography,
  prescriptionDrug,
  relationship,
  sex,
  shopping,
  smartphone,
  socialMedia,
  stimulant,
  streamingTv,
  work,
] as InteractiveProgrammeDefinition[];

export const interactiveProgrammes: InteractiveProgrammeDefinition[] = rawProgrammes.map(normalizeProgramme);

export const interactiveProgrammeBySlug = new Map(
  interactiveProgrammes.map((programme) => [programme.slug, programme] as const),
);

export const INTERACTIVE_PROGRAMME_SLUGS = interactiveProgrammes.map((programme) => programme.slug);

export function getInteractiveProgramme(slug: string) {
  return interactiveProgrammeBySlug.get(slug) ?? null;
}

export function listInteractiveProgrammes() {
  return interactiveProgrammes;
}

export function getProgrammeActivity(slug: string, activityId: string) {
  const programme = getInteractiveProgramme(slug);
  return programme?.activities.find((activity) => activity.id === activityId) ?? null;
}

export function getNextActivity(slug: string, currentActivityId: string | null) {
  const programme = getInteractiveProgramme(slug);
  if (!programme) return null;
  if (!currentActivityId) return programme.activities[0] ?? null;
  const index = programme.activities.findIndex((activity) => activity.id === currentActivityId);
  if (index < 0) return programme.activities[0] ?? null;
  return programme.activities[index + 1] ?? null;
}
