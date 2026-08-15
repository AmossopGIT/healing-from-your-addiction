import { isConsultationCompleteStatus } from "@/lib/consultation/schema";
import type { PortalNextStep } from "@/lib/portal/nextStep";
import type {
  ClientActivityProgress,
  ClientConsultation,
  ClientDailyCheckIn,
  ClientHomeworkEntry,
  ClientIntakeSubmission,
  ClientProfile,
  Enrollment,
  ProgrammeHomeworkTask,
  ProgrammeSession,
  SessionProgress,
} from "@/types/database";

export type PreCourseChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
  detail: string;
};

export type ThisWeekFocusKind = "journey" | "live_session" | "schedule" | "practice" | "waiting" | "up_to_date";

export type ThisWeekModel = {
  weekNumber: number;
  headline: string;
  summary: string;
  focusKind: ThisWeekFocusKind;
  primaryHref: string;
  primaryLabel: string;
  journeyTitle: string | null;
  journeyHref: string | null;
  sessionTitle: string | null;
  sessionHref: string | null;
  sessionLockedReason: string | null;
  checkInDone: boolean;
  practiceDoneCount: number;
  practiceTotalCount: number;
  remainingLiveSessions: number;
};

export type CourseLoopSignals = {
  clientProfile: ClientProfile | null;
  intakeSubmission: ClientIntakeSubmission | null;
  consultation: ClientConsultation | null;
  enrollment: Enrollment | null;
  sessions: ProgrammeSession[];
  progressBySessionId: Map<string, SessionProgress>;
  activityProgress: ClientActivityProgress[];
  currentActivityId: string | null;
  currentActivityTitle: string | null;
  todayCheckIn: ClientDailyCheckIn | null;
  homeworkTasks: ProgrammeHomeworkTask[];
  todayHomeworkEntries: ClientHomeworkEntry[];
  hasSchedule: boolean;
  releasedDocCount?: number;
  sessionReceiptCount?: number;
};

export function buildPreCourseChecklist(input: {
  clientProfile: ClientProfile | null;
  intakeSubmission: ClientIntakeSubmission | null;
  consultation: ClientConsultation | null;
  hasEnrollment: boolean;
  forAdmin?: boolean;
  clientProfileId?: string;
}): PreCourseChecklistItem[] {
  const admin = Boolean(input.forAdmin);
  const clientId = input.clientProfileId;
  const intakeDone = Boolean(input.intakeSubmission?.completed_at);
  const consultationDone = Boolean(
    input.consultation && isConsultationCompleteStatus(input.consultation.status),
  );
  const profileDone = Boolean(input.clientProfile?.onboarding_completed_at);

  return [
    {
      id: "profile",
      label: "Portal profile complete",
      done: profileDone,
      href: admin && clientId ? `/admin/clients/${clientId}/` : "/portal/onboarding/",
      detail: profileDone ? "Profile is ready." : "Finish name, phone, and support focus.",
    },
    {
      id: "intake",
      label: "Intake questions submitted",
      done: intakeDone,
      href: admin && clientId ? `/admin/clients/${clientId}/intake/` : "/portal/intake/",
      detail: intakeDone
        ? "Intake is complete."
        : input.intakeSubmission
          ? "Intake is in progress."
          : "Pre-programme questions still needed.",
    },
    {
      id: "consultation",
      label: "Consultation form complete",
      done: consultationDone,
      href: admin && clientId ? `/admin/clients/${clientId}/consultation/` : "/portal/consultation/",
      detail: consultationDone
        ? "Consultation is complete."
        : input.consultation
          ? `${input.consultation.percent_complete}% complete.`
          : "Consultation form not finished yet.",
    },
    {
      id: "programme",
      label: "Programme assigned",
      done: input.hasEnrollment,
      href: admin && clientId ? `/admin/clients/${clientId}/programme/` : "/portal/programme/",
      detail: input.hasEnrollment
        ? "Programme is assigned."
        : admin
          ? "Assign the interactive programme to start week 1."
          : "Gerald is preparing your week 1 programme.",
    },
  ];
}

export function countIncompleteLiveSessions(
  sessions: ProgrammeSession[],
  progressBySessionId: Map<string, SessionProgress>,
) {
  return sessions.filter((session) => {
    const progress = progressBySessionId.get(session.id);
    return progress && progress.status !== "completed";
  }).length;
}

export function hasIncompleteLiveSessions(
  sessions: ProgrammeSession[],
  progressBySessionId: Map<string, SessionProgress>,
) {
  return countIncompleteLiveSessions(sessions, progressBySessionId) > 0;
}

export function resolveCourseAwareStage(input: {
  clientProfile: ClientProfile | null;
  intakeCompleted: boolean;
  enrollment: Enrollment | null;
  sessions: ProgrammeSession[];
  progressBySessionId: Map<string, SessionProgress>;
}): "onboarding" | "pre_intake" | "pre_programme" | "active_programme" | "maintenance" {
  if (!input.clientProfile?.onboarding_completed_at) return "onboarding";
  if (!input.intakeCompleted) return "pre_intake";
  if (!input.enrollment) return "pre_programme";

  const incompleteLive = hasIncompleteLiveSessions(input.sessions, input.progressBySessionId);
  if (input.enrollment.status === "completed" && !incompleteLive) return "maintenance";
  return "active_programme";
}

export function buildThisWeekModel(input: CourseLoopSignals): ThisWeekModel | null {
  if (!input.clientProfile?.onboarding_completed_at) return null;

  const weekNumber =
    input.sessions.find((session) => {
      const progress = input.progressBySessionId.get(session.id);
      return progress && progress.status !== "locked" && progress.status !== "completed";
    })?.week_number ??
    input.sessions[0]?.week_number ??
    1;

  const practiceTotalCount = input.homeworkTasks.filter((task) => task.cadence === "daily").length;
  const practiceDoneCount = input.todayHomeworkEntries.filter((entry) => entry.completed).length;
  const remainingLiveSessions = countIncompleteLiveSessions(input.sessions, input.progressBySessionId);
  const checkInDone = Boolean(input.todayCheckIn);

  const journeyHref = input.currentActivityId
    ? `/portal/programme/journey/${input.currentActivityId}/`
    : null;

  const inProgressSession = input.sessions.find((session) => {
    const progress = input.progressBySessionId.get(session.id);
    return progress && progress.status !== "locked" && progress.status !== "completed";
  });
  const availableSession = input.sessions.find((session) => {
    const progress = input.progressBySessionId.get(session.id);
    return progress?.status === "available";
  });
  const lockedSession = input.sessions.find((session) => {
    const progress = input.progressBySessionId.get(session.id);
    return progress?.status === "locked";
  });

  const focusSession = inProgressSession ?? availableSession ?? null;
  const sessionHref = focusSession
    ? `/portal/programme/session/${focusSession.session_number}/`
    : null;

  if (!input.enrollment) {
    return {
      weekNumber: 1,
      headline: "Before week 1",
      summary: "Finish intake and consultation. Gerald will assign your programme next.",
      focusKind: "waiting",
      primaryHref: "/portal/intake/",
      primaryLabel: "Continue pre-course steps",
      journeyTitle: null,
      journeyHref: null,
      sessionTitle: null,
      sessionHref: null,
      sessionLockedReason: null,
      checkInDone,
      practiceDoneCount,
      practiceTotalCount,
      remainingLiveSessions: 0,
    };
  }

  if (input.enrollment && !input.hasSchedule && !input.currentActivityId) {
    return {
      weekNumber,
      headline: `Week ${weekNumber}`,
      summary: "Choose your Tuesday or Friday slot so live sessions can be dated.",
      focusKind: "schedule",
      primaryHref: "/portal/programme/schedule/",
      primaryLabel: "Choose schedule",
      journeyTitle: null,
      journeyHref: null,
      sessionTitle: null,
      sessionHref: null,
      sessionLockedReason: null,
      checkInDone,
      practiceDoneCount,
      practiceTotalCount,
      remainingLiveSessions,
    };
  }

  if (input.currentActivityId && input.currentActivityTitle && journeyHref) {
    const activityProgress = input.activityProgress.find((row) => row.activity_id === input.currentActivityId);
    if (!activityProgress || activityProgress.status !== "completed") {
      return {
        weekNumber,
        headline: `Week ${weekNumber}`,
        summary: `Continue your journey: ${input.currentActivityTitle}.`,
        focusKind: "journey",
        primaryHref: journeyHref,
        primaryLabel: "Continue journey",
        journeyTitle: input.currentActivityTitle,
        journeyHref,
        sessionTitle: focusSession?.title ?? null,
        sessionHref: input.hasSchedule ? sessionHref : null,
        sessionLockedReason:
          !focusSession && lockedSession
            ? "Later live sessions unlock after Gerald releases them or closer to their date."
            : null,
        checkInDone,
        practiceDoneCount,
        practiceTotalCount,
        remainingLiveSessions,
      };
    }
  }

  if (input.enrollment && !input.hasSchedule) {
    return {
      weekNumber,
      headline: `Week ${weekNumber}`,
      summary: "Pick a live session slot when you are ready. Your journey can continue meanwhile.",
      focusKind: "schedule",
      primaryHref: "/portal/programme/schedule/",
      primaryLabel: "Choose schedule",
      journeyTitle: input.currentActivityTitle,
      journeyHref,
      sessionTitle: null,
      sessionHref: null,
      sessionLockedReason: null,
      checkInDone,
      practiceDoneCount,
      practiceTotalCount,
      remainingLiveSessions,
    };
  }

  if (focusSession && sessionHref) {
    return {
      weekNumber,
      headline: `Week ${weekNumber}`,
      summary: `${focusSession.title} is ready for your live coaching track.`,
      focusKind: "live_session",
      primaryHref: sessionHref,
      primaryLabel: inProgressSession ? "Continue session" : "Open session",
      journeyTitle: input.currentActivityTitle,
      journeyHref,
      sessionTitle: focusSession.title,
      sessionHref,
      sessionLockedReason: null,
      checkInDone,
      practiceDoneCount,
      practiceTotalCount,
      remainingLiveSessions,
    };
  }

  if (!checkInDone || (practiceTotalCount > 0 && practiceDoneCount < practiceTotalCount)) {
    return {
      weekNumber,
      headline: `Week ${weekNumber}`,
      summary: "Keep your daily rhythm going with check-in and practice ticks.",
      focusKind: "practice",
      primaryHref: "/portal/#daily-check-in",
      primaryLabel: "Open daily ritual",
      journeyTitle: input.currentActivityTitle,
      journeyHref,
      sessionTitle: null,
      sessionHref: null,
      sessionLockedReason: lockedSession
        ? "Later live sessions unlock after Gerald releases them or closer to their date."
        : null,
      checkInDone,
      practiceDoneCount,
      practiceTotalCount,
      remainingLiveSessions,
    };
  }

  return {
    weekNumber,
    headline: remainingLiveSessions > 0 ? `Week ${weekNumber}` : "You're up to date",
    summary:
      remainingLiveSessions > 0
        ? `${remainingLiveSessions} live session${remainingLiveSessions === 1 ? "" : "s"} still to complete. Return tomorrow for your daily ritual.`
        : "Your journey and practice are current. Return tomorrow for your daily ritual.",
    focusKind: "up_to_date",
    primaryHref: "/portal/programme/",
    primaryLabel: "View programme",
    journeyTitle: input.currentActivityTitle,
    journeyHref,
    sessionTitle: null,
    sessionHref: null,
    sessionLockedReason: lockedSession
      ? "Later live sessions unlock after Gerald releases them or closer to their date."
      : null,
    checkInDone,
    practiceDoneCount,
    practiceTotalCount,
    remainingLiveSessions,
  };
}

export type Week1LaunchChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  detail: string;
  href?: string;
};

export function buildWeek1LaunchChecklist(input: {
  clientProfileId: string;
  addictionSlug: string | null;
  hasEnrollment: boolean;
  preferredTemplateId?: string | null;
  sessionsAvailableCount: number;
  sessionReceiptCount: number;
  hasSchedule: boolean;
  releasedDocCount: number;
  hasProgrammeDocs: boolean;
  clientNextStep: PortalNextStep | null;
}): Week1LaunchChecklistItem[] {
  const programmeHref = `/admin/clients/${input.clientProfileId}/programme/`;
  return [
    {
      id: "assign",
      label: "Assign interactive programme",
      done: input.hasEnrollment,
      detail: input.hasEnrollment
        ? "Programme enrollment exists."
        : input.addictionSlug
          ? `Prefer the ${input.addictionSlug} template that matches this client’s focus.`
          : "Choose the interactive template that matches this client’s focus.",
      href: programmeHref,
    },
    {
      id: "receipts",
      label: "Sessions 1–2 available with client receipts",
      done: input.hasEnrollment && input.sessionsAvailableCount >= 1 && input.sessionReceiptCount >= 1,
      detail:
        input.sessionReceiptCount >= 1
          ? "Client can see a new-session next step."
          : "Unlock/release sessions so the portal next-step can fire (interactive assign should create receipts).",
      href: programmeHref,
    },
    {
      id: "docs",
      label: input.hasProgrammeDocs ? "Release week 1 guide" : "Week 1 guide (gambling pack only today)",
      done: !input.hasProgrammeDocs || input.releasedDocCount > 0,
      detail: input.hasProgrammeDocs
        ? input.releasedDocCount > 0
          ? "At least one programme guide is released."
          : "Release the matching week guide so the client’s week is not empty."
        : "Non-gambling guides are not in the pack yet — journey + sessions still run.",
      href: programmeHref,
    },
    {
      id: "schedule",
      label: "Confirm live session slot",
      done: input.hasSchedule,
      detail: input.hasSchedule
        ? "Schedule is set."
        : "Client can pick a slot, or you can set Tuesday/Friday 11:00 or 16:00 for them.",
      href: programmeHref,
    },
  ];
}

export function nextStepFromThisWeek(thisWeek: ThisWeekModel): PortalNextStep {
  return {
    title: thisWeek.headline,
    description: thisWeek.summary,
    href: thisWeek.primaryHref,
    buttonLabel: thisWeek.primaryLabel,
    artId:
      thisWeek.focusKind === "journey"
        ? "process-integration"
        : thisWeek.focusKind === "live_session"
          ? "process-support"
          : thisWeek.focusKind === "schedule"
            ? "process-support"
            : "pattern-map",
    priority: 5.5,
  };
}
