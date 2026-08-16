import type {
  ActivityField,
  InteractiveProgrammeDefinition,
  ProgrammeActivity,
} from "@/content/interactiveProgrammes/types";
import { DEFAULT_CADENCE, DEFAULT_DAILY_CHECKIN } from "@/content/interactiveProgrammes/types";
import { validateInteractiveProgramme } from "@/content/interactiveProgrammes/validate";
import { getUnsupportedImportError } from "@/lib/cms/unsupportedImportSource";

const MAX_TITLE = 200;
const MAX_PROMPT = 4000;
const MAX_AFFIRMATION = 2000;
const MAX_FIELD_LABEL = 200;
const MIN_POINTS = 0;
const MAX_POINTS = 100;

export type ActivityFieldPatch = {
  key: string;
  label?: string;
  required?: boolean;
};

export type ActivityPatch = {
  id: string;
  title?: string;
  prompt?: string;
  affirmation?: string;
  points?: number;
  fields?: ActivityFieldPatch[];
};

export type ActivityPatchResult =
  | { ok: true; activities: ProgrammeActivity[] }
  | { ok: false; errors: string[] };

export type ProgrammeImportResult =
  | { ok: true; programme: InteractiveProgrammeDefinition; warnings: string[] }
  | { ok: false; errors: string[] };

function sanitizeLine(value: string, max: number) {
  return value.replace(/\r\n/g, "\n").replace(/\s+/g, " ").trim().slice(0, max);
}

function sanitizeMultiline(value: string, max: number) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, max);
}

function clampPoints(value: number) {
  if (!Number.isFinite(value)) return null;
  return Math.min(MAX_POINTS, Math.max(MIN_POINTS, Math.round(value)));
}

function patchFields(base: ActivityField[] | undefined, patches: ActivityFieldPatch[] | undefined): ActivityField[] | undefined {
  if (!base?.length) return base;
  if (!patches?.length) return base;
  const byKey = new Map(patches.map((patch) => [patch.key, patch]));
  return base.map((field) => {
    const patch = byKey.get(field.key);
    if (!patch) return field;
    return {
      ...field,
      label: patch.label !== undefined ? sanitizeLine(patch.label, MAX_FIELD_LABEL) || field.label : field.label,
      required: patch.required !== undefined ? Boolean(patch.required) : field.required,
    };
  });
}

/**
 * Apply staff edits to activities while locking id, origin, type, moduleId, day/week, sortOrder.
 * Activities not present in the base list are ignored (no free-form add/delete in this pass).
 */
export function applyActivityPatches(
  baseActivities: ProgrammeActivity[],
  patches: ActivityPatch[],
): ActivityPatchResult {
  const errors: string[] = [];
  const patchById = new Map(patches.map((patch) => [patch.id, patch]));
  const unknownIds = patches.filter((patch) => !baseActivities.some((activity) => activity.id === patch.id));
  for (const unknown of unknownIds) {
    errors.push(`Unknown activity id: ${unknown.id}`);
  }
  if (errors.length) return { ok: false, errors };

  const activities = baseActivities.map((activity) => {
    const patch = patchById.get(activity.id);
    if (!patch) return activity;

    const next: ProgrammeActivity = {
      ...activity,
      // Locked: id, origin, type, moduleId, dayNumber, weekNumber, sortOrder, focusItems
      title: patch.title !== undefined ? sanitizeLine(patch.title, MAX_TITLE) || activity.title : activity.title,
      prompt:
        patch.prompt !== undefined
          ? sanitizeMultiline(patch.prompt, MAX_PROMPT) || undefined
          : activity.prompt,
      affirmation:
        patch.affirmation !== undefined
          ? sanitizeMultiline(patch.affirmation, MAX_AFFIRMATION) || undefined
          : activity.affirmation,
      fields: patchFields(activity.fields, patch.fields),
    };

    if (patch.points !== undefined) {
      const points = clampPoints(Number(patch.points));
      if (points === null) {
        errors.push(`Invalid points for activity ${activity.id}`);
      } else {
        next.points = points;
      }
    }

    return next;
  });

  if (errors.length) return { ok: false, errors };
  return { ok: true, activities };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeImportedProgramme(raw: InteractiveProgrammeDefinition): InteractiveProgrammeDefinition {
  return {
    ...raw,
    status: "draft",
    reviewStatus: "pending",
    needsManualReview: true,
    sourceExcerpt: raw.sourceExcerpt ?? String(raw.description ?? "").slice(0, 280),
    sourceChecksum: raw.sourceChecksum || `${raw.slug}-import-${Date.now()}`,
    cadence: raw.cadence ?? DEFAULT_CADENCE,
    dailyCheckIn: raw.dailyCheckIn ?? DEFAULT_DAILY_CHECKIN,
    structure: raw.structure
      ? { ...raw.structure, slug: raw.slug }
      : {
          slug: raw.slug,
          expectedWeekCount: raw.weekCount,
          expectedDayCount: raw.dayCount,
          sourceActivityTypes: ["orientation", "weekly_focus", "daily_affirmation", "reflection", "closing"],
          optionalPlatformActivityTypes: ["trigger_map", "values_select"],
          reflectionDays: [],
          platformExerciseDays: [],
          reviewRequired: raw.category === "substance",
        },
    activities: (raw.activities ?? []).map((activity) => ({
      ...activity,
      origin:
        activity.origin ??
        (activity.type === "trigger_map" || activity.type === "values_select" ? "platform" : "source"),
    })),
  };
}

/** Parse pasted or uploaded programme JSON into a draft-ready definition. */
export function parseProgrammeImportJson(
  source: string,
  options?: { filename?: string; mimeType?: string },
): ProgrammeImportResult {
  const unsupported = getUnsupportedImportError({
    filename: options?.filename,
    mimeType: options?.mimeType,
    textPrefix: source.slice(0, 16),
  });
  if (unsupported) {
    return {
      ok: false,
      errors: [
        "This file is a PDF or Word document. Programme import only accepts .json (or pasted JSON text).",
      ],
    };
  }

  const trimmed = source.replace(/^\uFEFF/, "").trim();
  if (!trimmed) return { ok: false, errors: ["Paste or upload a programme JSON document."] };

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { ok: false, errors: ["Could not parse JSON. Check for missing commas or quotes."] };
  }

  if (!isRecord(parsed)) return { ok: false, errors: ["Programme JSON must be an object."] };
  if (typeof parsed.slug !== "string" || !/^[a-z0-9-]+$/.test(parsed.slug)) {
    return { ok: false, errors: ["Programme slug is required (lowercase letters, numbers, hyphens)."] };
  }
  if (typeof parsed.title !== "string" || !parsed.title.trim()) {
    return { ok: false, errors: ["Programme title is required."] };
  }
  if (!Array.isArray(parsed.activities) || parsed.activities.length === 0) {
    return { ok: false, errors: ["Programme must include at least one activity."] };
  }
  if (!Array.isArray(parsed.modules) || parsed.modules.length === 0) {
    return { ok: false, errors: ["Programme must include at least one module."] };
  }

  const programme = normalizeImportedProgramme(parsed as InteractiveProgrammeDefinition);
  const issues = validateInteractiveProgramme(programme);
  const errors = issues.filter((issue) => issue.level === "error").map((issue) => issue.message);
  if (errors.length) return { ok: false, errors };

  const warnings = issues.filter((issue) => issue.level === "warning").map((issue) => issue.message);
  return { ok: true, programme, warnings };
}

export function parseActivityPatchesJson(raw: string): { patches: ActivityPatch[] } | { error: string } {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return { error: "Activity patches must be a JSON array." };
    const patches: ActivityPatch[] = [];
    for (const item of parsed) {
      if (!isRecord(item) || typeof item.id !== "string" || !item.id.trim()) {
        return { error: "Each activity patch needs an id." };
      }
      const patch: ActivityPatch = { id: item.id.trim() };
      if (typeof item.title === "string") patch.title = item.title;
      if (typeof item.prompt === "string") patch.prompt = item.prompt;
      if (typeof item.affirmation === "string") patch.affirmation = item.affirmation;
      if (typeof item.points === "number" || typeof item.points === "string") {
        patch.points = Number(item.points);
      }
      if (Array.isArray(item.fields)) {
        patch.fields = item.fields
          .filter((field): field is Record<string, unknown> => isRecord(field) && typeof field.key === "string")
          .map((field) => ({
            key: String(field.key),
            label: typeof field.label === "string" ? field.label : undefined,
            required: typeof field.required === "boolean" ? field.required : undefined,
          }));
      }
      patches.push(patch);
    }
    return { patches };
  } catch {
    return { error: "Could not parse activity patches JSON." };
  }
}
