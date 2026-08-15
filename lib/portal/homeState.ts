import type { PortalNextStep } from "@/lib/portal/nextStep";
import type { DailyAffirmation } from "@/lib/portal/dailyAffirmation";
import type { PortalMilestone } from "@/lib/portal/milestones";
import type { PortalActivityItem } from "@/lib/portal/activityFeed";
import type { PortalNotificationSummary } from "@/lib/dashboard/queries";
import type { PreCourseChecklistItem, ThisWeekModel } from "@/lib/portal/courseLoop";
import { resolveCourseAwareStage } from "@/lib/portal/courseLoop";
import type {
  ClientDailyCheckIn,
  ClientHomeworkEntry,
  ClientIntakeSubmission,
  ClientProfile,
  ClientRecoveryGoal,
  Enrollment,
  HomeworkTone,
  ProgrammeHomeworkTask,
  ProgrammeSession,
  ProgrammeTemplate,
  SessionProgress,
} from "@/types/database";
import type { AuthProfile } from "@/lib/supabase/auth";

export type PortalHomeStage =
  | "onboarding"
  | "pre_intake"
  | "pre_programme"
  | "active_programme"
  | "maintenance";

export type PortalHomeHeroModel = {
  greeting: string;
  headline: string;
  subtext: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string | null;
  secondaryMetricValue: string | null;
  artId: string;
};

export type PortalHomeSectionId =
  | "hero"
  | "next_step"
  | "this_week"
  | "pre_course"
  | "quick_actions"
  | "daily_ritual"
  | "progress"
  | "weekly_pulse"
  | "activity_feed"
  | "gentle_reminder";

export type PortalHomeBundle = {
  profile: AuthProfile | null;
  clientProfile: ClientProfile | null;
  stage: PortalHomeStage;
  sections: PortalHomeSectionId[];
  hero: PortalHomeHeroModel;
  nextStep: PortalNextStep;
  thisWeek: ThisWeekModel | null;
  preCourseChecklist: PreCourseChecklistItem[];
  notifications: PortalNotificationSummary | null;
  enrollment: Enrollment | null;
  template: ProgrammeTemplate | null;
  sessions: ProgrammeSession[];
  progress: SessionProgress[];
  intakeSubmission: ClientIntakeSubmission | null;
  intakeAnswered: number;
  intakeTotal: number;
  dailyAffirmation: DailyAffirmation | null;
  affirmationNote: string | null;
  todayCheckIn: ClientDailyCheckIn | null;
  recentCheckIns: ClientDailyCheckIn[];
  recoveryGoal: ClientRecoveryGoal | null;
  engagementStreak: number;
  pauseCountThisWeek: number;
  abstinenceDays: number;
  completedSessionCount: number;
  availableSessionCount: number;
  currentWeekNumber: number;
  milestones: PortalMilestone[];
  activityFeed: PortalActivityItem[];
  nextSessionHref: string | null;
  nextSessionLabel: string | null;
  hasPushReminders: boolean;
  firstName: string | null;
  pointsTotal: number;
  homeworkTasks: ProgrammeHomeworkTask[];
  todayHomeworkEntries: ClientHomeworkEntry[];
  homeworkTone: HomeworkTone;
  needsSchedule: boolean;
};

function timeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function resolvePortalHomeStage(input: {
  clientProfile: ClientProfile | null;
  intakeCompleted: boolean;
  enrollment: Enrollment | null;
  sessions?: ProgrammeSession[];
  progressBySessionId?: Map<string, SessionProgress>;
}): PortalHomeStage {
  return resolveCourseAwareStage({
    clientProfile: input.clientProfile,
    intakeCompleted: input.intakeCompleted,
    enrollment: input.enrollment,
    sessions: input.sessions ?? [],
    progressBySessionId: input.progressBySessionId ?? new Map(),
  });
}

export function resolvePortalHomeSections(stage: PortalHomeStage): PortalHomeSectionId[] {
  switch (stage) {
    case "onboarding":
      return ["hero", "next_step", "pre_course", "daily_ritual", "gentle_reminder"];
    case "pre_intake":
      return ["hero", "next_step", "pre_course", "this_week", "daily_ritual", "progress", "quick_actions", "activity_feed", "gentle_reminder"];
    case "pre_programme":
      return ["hero", "next_step", "pre_course", "this_week", "daily_ritual", "progress", "quick_actions", "weekly_pulse", "activity_feed", "gentle_reminder"];
    case "active_programme":
      return ["hero", "next_step", "this_week", "quick_actions", "daily_ritual", "progress", "weekly_pulse", "activity_feed", "gentle_reminder"];
    case "maintenance":
      return ["hero", "this_week", "daily_ritual", "progress", "weekly_pulse", "activity_feed", "gentle_reminder"];
  }
}

export function buildPortalHomeHero(input: {
  stage: PortalHomeStage;
  firstName: string | null;
  engagementStreak: number;
  abstinenceDays: number;
  showAbstinence: boolean;
  intakeAnswered: number;
  intakeTotal: number;
  templateTitle: string | null;
  currentWeekNumber: number;
  completedSessionCount: number;
  availableSessionCount: number;
}): PortalHomeHeroModel {
  const greeting = `${timeGreeting()}${input.firstName ? `, ${input.firstName}` : ""}`;

  if (input.stage === "onboarding") {
    return {
      greeting,
      headline: "Finish setting up your portal",
      subtext: "Complete your profile so Gerald can prepare your private programme space.",
      primaryMetricLabel: "Setup",
      primaryMetricValue: "Profile",
      secondaryMetricLabel: null,
      secondaryMetricValue: null,
      artId: "process-enquiry",
    };
  }

  if (input.stage === "pre_intake") {
    return {
      greeting,
      headline: "Your intake is in progress",
      subtext: `${input.intakeAnswered} of ${input.intakeTotal} questions answered`,
      primaryMetricLabel: "Intake progress",
      primaryMetricValue: `${input.intakeAnswered}/${input.intakeTotal}`,
      secondaryMetricLabel: "Rhythm",
      secondaryMetricValue: input.engagementStreak > 0 ? `${input.engagementStreak} day${input.engagementStreak === 1 ? "" : "s"}` : "Start today",
      artId: "process-understand",
    };
  }

  if (input.stage === "pre_programme") {
    return {
      greeting,
      headline: "Build your daily rhythm",
      subtext: "Check in, read today's affirmation, and stay connected while your programme is prepared.",
      primaryMetricLabel: "Rhythm streak",
      primaryMetricValue: input.engagementStreak > 0 ? String(input.engagementStreak) : "—",
      secondaryMetricLabel: input.showAbstinence ? "Days tracked" : null,
      secondaryMetricValue: input.showAbstinence ? String(input.abstinenceDays) : null,
      artId: "pattern-map",
    };
  }

  if (input.stage === "maintenance") {
    return {
      greeting,
      headline: "Keep your rhythm going",
      subtext: "Your programme is complete. Daily check-ins and affirmations remain here for ongoing support.",
      primaryMetricLabel: "Rhythm streak",
      primaryMetricValue: input.engagementStreak > 0 ? String(input.engagementStreak) : "—",
      secondaryMetricLabel: input.showAbstinence ? "Days tracked" : null,
      secondaryMetricValue: input.showAbstinence ? String(input.abstinenceDays) : null,
      artId: "process-integration",
    };
  }

  return {
    greeting,
    headline: input.templateTitle ?? "Your programme",
    subtext: `Week ${input.currentWeekNumber} · ${input.completedSessionCount} of ${input.availableSessionCount} sessions completed`,
    primaryMetricLabel: "Rhythm streak",
    primaryMetricValue: input.engagementStreak > 0 ? String(input.engagementStreak) : "—",
    secondaryMetricLabel: input.showAbstinence ? "Days tracked" : null,
    secondaryMetricValue: input.showAbstinence ? String(input.abstinenceDays) : null,
    artId: "process-support",
  };
}
