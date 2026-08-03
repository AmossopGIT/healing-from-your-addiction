export type ProgrammeCategory = "behavioral" | "substance";

export type ProgrammePublishStatus = "draft" | "ready" | "published" | "archived";

export type ProgrammeReviewStatus = "pending" | "approved" | "changes_requested";

export type ActivityType =
  | "orientation"
  | "weekly_focus"
  | "daily_affirmation"
  | "reflection"
  | "trigger_map"
  | "values_select"
  | "closing"
  | "scenario"
  | "daily_checkin";

export type ActivityOrigin = "source" | "platform";

export type ActivityFieldKind =
  | "textarea"
  | "single_choice"
  | "multi_choice"
  | "scale"
  | "checkbox"
  | "mood";

export type ActivityField = {
  key: string;
  label: string;
  kind: ActivityFieldKind;
  required?: boolean;
  privateByDefault?: boolean;
  options?: string[];
  min?: number;
  max?: number;
};

export type ProgrammeModule = {
  id: string;
  number: number;
  title: string;
  theme: string;
  focus: string[];
};

export type ProgrammeActivity = {
  id: string;
  moduleId: string;
  type: ActivityType;
  title: string;
  dayNumber: number | null;
  weekNumber: number;
  points: number;
  sortOrder: number;
  origin: ActivityOrigin;
  prompt?: string;
  affirmation?: string;
  focusItems?: string[];
  fields?: ActivityField[];
};

export type ProgrammeSafety = {
  disclaimer: string;
  reminder: string;
  escalation: string | null;
  requiresMedicalSupportNotice: boolean;
};

export type ProgrammeCadence = {
  activityCadence: "daily" | "custom";
  liveSessionCount: number;
  liveSessionWeekdays: Array<"tue" | "fri" | "mon" | "wed" | "thu">;
  liveSessionTimeSlots: Array<"11:00" | "16:00">;
  timezone: string;
  firstSessionDurationMinutes: number;
  standardSessionDurationMinutes: number;
};

export type DailyCheckInConfig = {
  includeMood: boolean;
  includeUrge: boolean;
  includePause: boolean;
  includePrivateNote: boolean;
  urgeMin: number;
  urgeMax: number;
  highUrgeThreshold: number;
};

export type ProgrammeStructureManifest = {
  slug: string;
  expectedWeekCount: number;
  expectedDayCount: number;
  sourceActivityTypes: ActivityType[];
  optionalPlatformActivityTypes: ActivityType[];
  reflectionDays: number[];
  platformExerciseDays: number[];
  reviewRequired: boolean;
};

export type InteractiveProgrammeDefinition = {
  slug: string;
  title: string;
  category: ProgrammeCategory;
  status: ProgrammePublishStatus | "ready";
  version: number;
  sourceFile: string;
  sourceStatus: string;
  needsManualReview: boolean;
  reviewStatus: ProgrammeReviewStatus;
  sourceExcerpt: string;
  sourceChecksum: string;
  description: string;
  safety: ProgrammeSafety;
  weekCount: number;
  dayCount: number;
  cadence: ProgrammeCadence;
  dailyCheckIn: DailyCheckInConfig;
  structure: ProgrammeStructureManifest;
  modules: ProgrammeModule[];
  activities: ProgrammeActivity[];
  dailyReflection: string;
  closingAffirmation: string;
  homeworkDefaults: Array<{
    taskKey: string;
    title: string;
    taskType: string;
    points: number;
  }>;
};

export type ActivityProgressStatus = "locked" | "available" | "in_progress" | "completed" | "skipped";

export type ClientActivityProgress = {
  id: string;
  enrollment_id: string;
  activity_id: string;
  status: ActivityProgressStatus;
  responses: Record<string, unknown>;
  public_responses: Record<string, unknown>;
  shared_with_admin: boolean;
  points_awarded: number;
  started_at: string | null;
  completed_at: string | null;
  skipped_reason: string | null;
  created_at: string;
  updated_at: string;
};

export const DEFAULT_CADENCE: ProgrammeCadence = {
  activityCadence: "daily",
  liveSessionCount: 8,
  liveSessionWeekdays: ["tue", "fri"],
  liveSessionTimeSlots: ["11:00", "16:00"],
  timezone: "Africa/Johannesburg",
  firstSessionDurationMinutes: 90,
  standardSessionDurationMinutes: 45,
};

export const DEFAULT_DAILY_CHECKIN: DailyCheckInConfig = {
  includeMood: true,
  includeUrge: true,
  includePause: true,
  includePrivateNote: true,
  urgeMin: 0,
  urgeMax: 5,
  highUrgeThreshold: 4,
};

export const MOOD_OPTIONS = ["calm", "steady", "low", "anxious", "irritable"] as const;
