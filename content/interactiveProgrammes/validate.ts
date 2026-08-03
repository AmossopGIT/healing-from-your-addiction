import { interactiveProgrammes } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";

export type ProgrammeValidationIssue = {
  slug: string;
  level: "error" | "warning";
  message: string;
};

const REQUIRED_SOURCE_TYPES = new Set(["orientation", "weekly_focus", "daily_affirmation", "closing"]);

export function validateInteractiveProgramme(programme: InteractiveProgrammeDefinition): ProgrammeValidationIssue[] {
  const issues: ProgrammeValidationIssue[] = [];
  const push = (level: "error" | "warning", message: string) => {
    issues.push({ slug: programme.slug, level, message });
  };

  if (!programme.slug) push("error", "Missing slug");
  if (!programme.title) push("error", "Missing title");
  if (!programme.description) push("error", "Missing description");
  if (programme.weekCount < 1) push("error", "weekCount must be at least 1");
  if (programme.dayCount < 1) push("error", "dayCount must be at least 1");
  if (!programme.modules.length) push("error", "No modules defined");
  if (!programme.activities.length) push("error", "No activities defined");
  if (!programme.structure) push("error", "Missing structure manifest");
  if (!programme.cadence) push("error", "Missing cadence configuration");
  if (!programme.dailyCheckIn) push("error", "Missing daily check-in configuration");
  if (!programme.sourceChecksum) push("error", "Missing source checksum");
  if (!programme.reviewStatus) push("error", "Missing review status");

  if (programme.activities.some((activity) => activity.id.includes("placeholder"))) {
    push("error", "Placeholder activity ids are not allowed");
  }

  if (programme.structure) {
    if (programme.structure.expectedWeekCount !== programme.weekCount) {
      push("error", `Manifest weekCount ${programme.structure.expectedWeekCount} does not match programme weekCount ${programme.weekCount}`);
    }
    if (programme.structure.expectedDayCount !== programme.dayCount) {
      push("error", `Manifest dayCount ${programme.structure.expectedDayCount} does not match programme dayCount ${programme.dayCount}`);
    }
  }

  const activityIds = new Set<string>();
  for (const activity of programme.activities) {
    if (activityIds.has(activity.id)) push("error", `Duplicate activity id: ${activity.id}`);
    activityIds.add(activity.id);
    if (!activity.title) push("error", `Activity ${activity.id} is missing a title`);
    if (!activity.moduleId) push("error", `Activity ${activity.id} is missing moduleId`);
    if (!activity.origin) push("error", `Activity ${activity.id} is missing origin`);
    if (activity.type === "daily_affirmation" && !activity.affirmation) {
      push("error", `Affirmation activity ${activity.id} is missing affirmation text`);
    }
    if (activity.type === "daily_affirmation") {
      const keys = new Set((activity.fields ?? []).map((field) => field.key));
      if (programme.dailyCheckIn?.includeMood && !keys.has("mood")) {
        push("error", `Daily affirmation ${activity.id} is missing mood field`);
      }
      if (programme.dailyCheckIn?.includeUrge && !keys.has("urge_level")) {
        push("error", `Daily affirmation ${activity.id} is missing urge_level field`);
      }
    }
    if (activity.origin === "source" && (activity.type === "trigger_map" || activity.type === "values_select")) {
      push("error", `Platform activity type ${activity.type} cannot be marked as source for ${activity.id}`);
    }
    if ((activity.fields?.length ?? 0) === 0 && activity.type !== "daily_affirmation") {
      push("warning", `Activity ${activity.id} has no interactive fields`);
    }
  }

  for (const required of REQUIRED_SOURCE_TYPES) {
    if (!programme.activities.some((activity) => activity.type === required && activity.origin === "source")) {
      push("error", `Missing required source activity type: ${required}`);
    }
  }

  if (!programme.safety.disclaimer) push("error", "Missing safety disclaimer");
  if (programme.safety.requiresMedicalSupportNotice && !programme.safety.escalation) {
    push("error", "High-risk programme is missing escalation copy");
  }

  if (programme.structure?.reviewRequired && programme.reviewStatus === "pending") {
    push("warning", "Programme is awaiting human source/safety review before final approval");
  }

  if (programme.needsManualReview) {
    push("warning", "Source content still needs manual wording review");
  }

  const affirmationDays = programme.activities
    .filter((activity) => activity.type === "daily_affirmation")
    .map((activity) => activity.dayNumber)
    .filter((day): day is number => typeof day === "number");
  if (affirmationDays.length < programme.dayCount) {
    push("error", `Expected ${programme.dayCount} daily affirmations, found ${affirmationDays.length}`);
  }

  return issues;
}

export function validateAllInteractiveProgrammes() {
  return interactiveProgrammes.flatMap(validateInteractiveProgramme);
}

export function assertProgrammesPublishable(slugs?: string[]) {
  const selected = slugs?.length
    ? interactiveProgrammes.filter((programme) => slugs.includes(programme.slug))
    : interactiveProgrammes;
  const errors = selected
    .flatMap(validateInteractiveProgramme)
    .filter((issue) => issue.level === "error");
  if (errors.length) {
    const summary = errors.map((issue) => `${issue.slug}: ${issue.message}`).join("; ");
    throw new Error(`Programme validation failed: ${summary}`);
  }
  return selected;
}

export function compareProgrammeVersions(
  current: InteractiveProgrammeDefinition,
  next: InteractiveProgrammeDefinition,
) {
  return {
    slug: current.slug,
    versionFrom: current.version,
    versionTo: next.version,
    dayCountChanged: current.dayCount !== next.dayCount,
    activityCountChanged: current.activities.length !== next.activities.length,
    checksumChanged: current.sourceChecksum !== next.sourceChecksum,
    reviewStatus: next.reviewStatus,
  };
}
