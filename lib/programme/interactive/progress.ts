import type { InteractiveProgrammeDefinition, ProgrammeActivity, ActivityField } from "@/content/interactiveProgrammes/types";
import { MOOD_OPTIONS } from "@/content/interactiveProgrammes/types";
import type { ClientActivityProgress } from "@/types/database";
import { completionPercent, findActivity, getOrderedActivities } from "@/lib/programme/interactive/content";

export type JourneySummary = {
  totalActivities: number;
  completedActivities: number;
  availableActivities: number;
  percentComplete: number;
  currentActivity: ProgrammeActivity | null;
  nextActivity: ProgrammeActivity | null;
  currentWeek: number | null;
  currentDay: number | null;
  lastCompletedAt: string | null;
};

const PRIVATE_FIELD_KEYS = new Set(["private_note", "intention", "support_plan", "what_helped", "trigger", "urge", "replacement", "keep_doing", "support_needed"]);

export function summarizeJourney(
  definition: InteractiveProgrammeDefinition,
  progressRows: ClientActivityProgress[],
  currentActivityId?: string | null,
): JourneySummary {
  const ordered = getOrderedActivities(definition);
  const byId = new Map(progressRows.map((row) => [row.activity_id, row]));
  const completed = ordered.filter((activity) => byId.get(activity.id)?.status === "completed");
  const available = ordered.filter((activity) => {
    const status = byId.get(activity.id)?.status;
    return status === "available" || status === "in_progress";
  });

  const current =
    (currentActivityId ? findActivity(definition, currentActivityId) : null) ??
    available[0] ??
    ordered.find((activity) => (byId.get(activity.id)?.status ?? "locked") !== "completed") ??
    null;

  const currentIndex = current ? ordered.findIndex((activity) => activity.id === current.id) : -1;
  const next = currentIndex >= 0 ? ordered[currentIndex + 1] ?? null : ordered[0] ?? null;

  const lastCompletedAt =
    completed
      .map((activity) => byId.get(activity.id)?.completed_at)
      .filter((value): value is string => Boolean(value))
      .sort()
      .at(-1) ?? null;

  return {
    totalActivities: ordered.length,
    completedActivities: completed.length,
    availableActivities: available.length,
    percentComplete: completionPercent(ordered.length, completed.length),
    currentActivity: current,
    nextActivity: next,
    currentWeek: current?.weekNumber ?? null,
    currentDay: current?.dayNumber && current.dayNumber > 0 ? current.dayNumber : null,
    lastCompletedAt,
  };
}

export function buildInitialProgressRows(definition: InteractiveProgrammeDefinition, enrollmentId: string) {
  const ordered = getOrderedActivities(definition);
  const unlockedIds = new Set(ordered.slice(0, Math.min(2, ordered.length)).map((activity) => activity.id));

  return ordered.map((activity) => ({
    enrollment_id: enrollmentId,
    activity_id: activity.id,
    status: unlockedIds.has(activity.id) ? ("available" as const) : ("locked" as const),
    responses: {},
    public_responses: {},
    shared_with_admin: false,
    points_awarded: 0,
    started_at: null as string | null,
    completed_at: null as string | null,
    skipped_reason: null as string | null,
  }));
}

export function validateActivityResponses(
  activity: ProgrammeActivity,
  responses: Record<string, unknown>,
): string | null {
  for (const field of activity.fields ?? []) {
    if (!field.required) continue;
    const value = responses[field.key];
    if (field.kind === "checkbox") {
      if (value !== true) return `Please complete: ${field.label}`;
      continue;
    }
    if (field.kind === "scale") {
      if (typeof value !== "number" || Number.isNaN(value)) return `Please choose a level for: ${field.label}`;
      continue;
    }
    if (field.kind === "multi_choice") {
      if (!Array.isArray(value) || value.length === 0) return `Please choose at least one option for: ${field.label}`;
      continue;
    }
    if (field.kind === "mood") {
      if (typeof value !== "string" || !(MOOD_OPTIONS as readonly string[]).includes(value)) {
        return `Please choose a mood for: ${field.label}`;
      }
      continue;
    }
    if (typeof value !== "string" || !value.trim()) return `Please complete: ${field.label}`;
  }
  return null;
}

export function shouldShareWithAdmin(responses: Record<string, unknown>) {
  return responses.share_with_admin === true;
}

export function splitResponses(activity: ProgrammeActivity, responses: Record<string, unknown>) {
  const publicResponses: Record<string, unknown> = {};
  const privateResponses: Record<string, unknown> = {};
  const fieldsByKey = new Map((activity.fields ?? []).map((field) => [field.key, field]));

  for (const [key, value] of Object.entries(responses)) {
    if (key === "share_with_admin") {
      publicResponses[key] = value;
      continue;
    }
    const field = fieldsByKey.get(key);
    const isPrivate = field?.privateByDefault === true || PRIVATE_FIELD_KEYS.has(key);
    if (isPrivate) privateResponses[key] = value;
    else publicResponses[key] = value;
  }

  return { publicResponses, privateResponses };
}

export function isHighUrge(activity: ProgrammeActivity, responses: Record<string, unknown>, threshold = 4) {
  if (typeof responses.urge_level !== "number") return false;
  return responses.urge_level >= threshold;
}

export function fieldAllowsAdminView(field: ActivityField | undefined, shared: boolean) {
  if (!field) return shared;
  if (!field.privateByDefault) return true;
  return shared;
}

export function extractDailyCheckInPayload(
  responses: Record<string, unknown>,
  privateResponses: Record<string, unknown>,
  shared: boolean,
) {
  const mood = typeof responses.mood === "string" ? responses.mood : null;
  const urgeLevel = typeof responses.urge_level === "number" ? responses.urge_level : null;
  if (!mood || urgeLevel === null) return null;

  const note =
    shared && typeof privateResponses.private_note === "string" ? String(privateResponses.private_note) : null;

  return {
    mood,
    craving_level: urgeLevel,
    pause_taken: responses.pause_taken === true,
    note,
  };
}

export function mergeAdminVisibleResponses(input: {
  publicResponses?: Record<string, unknown> | null;
  legacyResponses?: Record<string, unknown> | null;
  sharedPrivateResponses?: Record<string, unknown> | null;
  sharedWithAdmin: boolean;
}) {
  const base = {
    ...(input.legacyResponses ?? {}),
    ...(input.publicResponses ?? {}),
  };
  if (input.sharedWithAdmin && input.sharedPrivateResponses) {
    return { ...base, ...input.sharedPrivateResponses };
  }
  return base;
}
