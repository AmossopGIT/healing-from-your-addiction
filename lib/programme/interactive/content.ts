import {
  getInteractiveProgramme,
  getNextActivity,
  interactiveProgrammes,
  listInteractiveProgrammes,
} from "@/content/interactiveProgrammes";
import { assertProgrammesPublishable, validateInteractiveProgramme } from "@/content/interactiveProgrammes/validate";
import type { InteractiveProgrammeDefinition, ProgrammeActivity } from "@/content/interactiveProgrammes/types";

export function getPublishedProgrammeDefinitions() {
  return listInteractiveProgrammes();
}

export function resolveProgrammeDefinition(
  slug: string,
  snapshot?: InteractiveProgrammeDefinition | Record<string, unknown> | null,
): InteractiveProgrammeDefinition | null {
  if (snapshot && typeof snapshot === "object" && "activities" in snapshot && "slug" in snapshot) {
    return snapshot as InteractiveProgrammeDefinition;
  }
  return getInteractiveProgramme(slug);
}

export function getOrderedActivities(definition: InteractiveProgrammeDefinition) {
  return [...definition.activities].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function findActivity(definition: InteractiveProgrammeDefinition, activityId: string) {
  return definition.activities.find((activity) => activity.id === activityId) ?? null;
}

export function getFirstUnlockSet(definition: InteractiveProgrammeDefinition) {
  const ordered = getOrderedActivities(definition);
  return ordered.slice(0, Math.min(2, ordered.length));
}

export function nextActivityAfter(definition: InteractiveProgrammeDefinition, activityId: string) {
  return getNextActivity(definition.slug, activityId);
}

export function completionPercent(total: number, completed: number) {
  if (total <= 0) return 0;
  return Math.round((completed / total) * 100);
}

export function validateProgrammeForPublish(slug: string) {
  const programme = getInteractiveProgramme(slug);
  if (!programme) return [{ slug, level: "error" as const, message: "Programme not found" }];
  return validateInteractiveProgramme(programme);
}

export function assertReadyProgrammes(slugs?: string[]) {
  return assertProgrammesPublishable(slugs);
}

export function catalogueSummary() {
  return interactiveProgrammes.map((programme) => ({
    slug: programme.slug,
    title: programme.title,
    category: programme.category,
    status: programme.status,
    version: programme.version,
    weekCount: programme.weekCount,
    dayCount: programme.dayCount,
    activityCount: programme.activities.length,
    needsManualReview: programme.needsManualReview,
    sourceStatus: programme.sourceStatus,
    issues: validateInteractiveProgramme(programme),
  }));
}

export function activityLabel(activity: ProgrammeActivity) {
  if (activity.dayNumber && activity.dayNumber > 0) {
    return `Day ${activity.dayNumber} · ${activity.title}`;
  }
  return activity.title;
}
