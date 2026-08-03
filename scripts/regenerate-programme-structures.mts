/**
 * Regenerates interactive programme JSON as source-faithful definitions.
 * - Keeps source activities: orientation, weekly_focus, daily_affirmation, reflection, closing
 * - Marks trigger_map / values_select as platform activities
 * - Adds mood/urge/pause/note to daily affirmations
 * - Adds cadence, structure manifest, review metadata, checksum
 */
import { createHash } from "crypto";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import type {
  ActivityField,
  InteractiveProgrammeDefinition,
  ProgrammeActivity,
  ProgrammeStructureManifest,
} from "../content/interactiveProgrammes/types";
import { DEFAULT_CADENCE, DEFAULT_DAILY_CHECKIN } from "../content/interactiveProgrammes/types";

const GENERATED = join(process.cwd(), "content/interactiveProgrammes/generated");

const HIGH_RISK = new Set(["alcohol", "opioid", "prescription-drug", "stimulant", "inhalant"]);

const DAILY_FIELDS: ActivityField[] = [
  {
    key: "mood",
    label: "How are you feeling right now?",
    kind: "mood",
    required: true,
    options: ["calm", "steady", "low", "anxious", "irritable"],
    privateByDefault: false,
  },
  {
    key: "urge_level",
    label: "Urge intensity right now (0-5)",
    kind: "scale",
    required: true,
    min: 0,
    max: 5,
    privateByDefault: false,
  },
  {
    key: "pause_taken",
    label: "I took a short pause before reacting",
    kind: "checkbox",
    required: false,
    privateByDefault: false,
  },
  {
    key: "practice_done",
    label: "I sat with today's affirmation",
    kind: "checkbox",
    required: true,
    privateByDefault: false,
  },
  {
    key: "private_note",
    label: "Optional private note (only shared if you choose)",
    kind: "textarea",
    required: false,
    privateByDefault: true,
  },
  {
    key: "share_with_admin",
    label: "Share today's note with Gerald",
    kind: "checkbox",
    required: false,
    privateByDefault: false,
  },
];

function checksum(value: string) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function buildManifest(programme: InteractiveProgrammeDefinition): ProgrammeStructureManifest {
  const affirmationDays = programme.activities
    .filter((a) => a.type === "daily_affirmation" && typeof a.dayNumber === "number")
    .map((a) => a.dayNumber as number);
  const reflectionDays = programme.activities
    .filter((a) => a.type === "reflection" && typeof a.dayNumber === "number")
    .map((a) => a.dayNumber as number);
  const platformDays = programme.activities
    .filter((a) => (a.type === "trigger_map" || a.type === "values_select") && typeof a.dayNumber === "number")
    .map((a) => a.dayNumber as number);

  return {
    slug: programme.slug,
    expectedWeekCount: programme.weekCount,
    expectedDayCount: affirmationDays.length || programme.dayCount,
    sourceActivityTypes: ["orientation", "weekly_focus", "daily_affirmation", "reflection", "closing"],
    optionalPlatformActivityTypes: ["trigger_map", "values_select"],
    reflectionDays: [...new Set(reflectionDays)].sort((a, b) => a - b),
    platformExerciseDays: [...new Set(platformDays)].sort((a, b) => a - b),
    reviewRequired: HIGH_RISK.has(programme.slug) || programme.sourceStatus === "ocr-extracted",
  };
}

function withOrigin(activity: ProgrammeActivity): ProgrammeActivity {
  const platformTypes = new Set(["trigger_map", "values_select", "scenario"]);
  return {
    ...activity,
    origin: platformTypes.has(activity.type) ? "platform" : "source",
  };
}

function enrichDaily(activity: ProgrammeActivity): ProgrammeActivity {
  if (activity.type !== "daily_affirmation") return activity;
  return {
    ...activity,
    origin: "source",
    fields: DAILY_FIELDS,
  };
}

function transform(raw: InteractiveProgrammeDefinition): InteractiveProgrammeDefinition {
  const activities = [...raw.activities]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(withOrigin)
    .map(enrichDaily)
    .map((activity, index) => ({ ...activity, sortOrder: index }));

  const dayCount = activities.filter((a) => a.type === "daily_affirmation").length;
  const excerptSource = [raw.title, raw.description, raw.dailyReflection, raw.closingAffirmation]
    .filter(Boolean)
    .join("\n")
    .slice(0, 280);

  const structure = buildManifest({ ...raw, activities, dayCount });

  return {
    ...raw,
    version: Math.max(raw.version ?? 1, 2),
    dayCount,
    weekCount: raw.modules.length || raw.weekCount || 4,
    reviewStatus: structure.reviewRequired ? "pending" : "approved",
    needsManualReview: structure.reviewRequired && raw.sourceStatus === "ocr-extracted",
    sourceExcerpt: excerptSource,
    sourceChecksum: checksum(`${raw.slug}|${raw.sourceFile}|${excerptSource}|${dayCount}`),
    cadence: DEFAULT_CADENCE,
    dailyCheckIn: DEFAULT_DAILY_CHECKIN,
    structure,
    activities,
  };
}

function main() {
  const files = readdirSync(GENERATED).filter((name) => name.endsWith(".json") && name !== "catalogue.json");
  const catalogue = [];

  for (const file of files) {
    const path = join(GENERATED, file);
    const raw = JSON.parse(readFileSync(path, "utf8")) as InteractiveProgrammeDefinition;
    const next = transform(raw);
    writeFileSync(path, `${JSON.stringify(next, null, 2)}\n`, "utf8");

    catalogue.push({
      slug: next.slug,
      title: next.title,
      category: next.category,
      status: next.status,
      activityCount: next.activities.length,
      dayCount: next.dayCount,
      weekCount: next.weekCount,
      sourceActivities: next.activities.filter((a) => a.origin === "source").length,
      platformActivities: next.activities.filter((a) => a.origin === "platform").length,
      needsManualReview: next.needsManualReview,
      reviewStatus: next.reviewStatus,
      sourceStatus: next.sourceStatus,
      sourceChecksum: next.sourceChecksum,
    });
    console.log(
      `${next.slug}: days=${next.dayCount} activities=${next.activities.length} source=${next.activities.filter((a) => a.origin === "source").length} platform=${next.activities.filter((a) => a.origin === "platform").length}`,
    );
  }

  catalogue.sort((a, b) => a.slug.localeCompare(b.slug));
  writeFileSync(join(GENERATED, "catalogue.json"), `${JSON.stringify(catalogue, null, 2)}\n`, "utf8");
  console.log(`Updated ${catalogue.length} programmes`);
}

main();
