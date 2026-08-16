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
      href: input.hasEnrollment
        ? admin && clientId
          ? `/admin/clients/${clientId}/programme/`
          : "/portal/programme/"
        : admin && clientId
          ? `/admin/clients/${clientId}/programme/`
          : "",
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
      href: `${programmeHref}#assign`,
    },
    {
      id: "receipts",
      label: "Sessions 1–2 available with client receipts",
      done: input.hasEnrollment && input.sessionsAvailableCount >= 1 && input.sessionReceiptCount >= 1,
      detail:
        input.sessionReceiptCount >= 1
          ? "Client can see a new-session next step."
          : "Unlock/release sessions so the portal next-step can fire (interactive assign should create receipts).",
      href: `${programmeHref}#sessions`,
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
      href: `${programmeHref}#docs`,
    },
    {
      id: "schedule",
      label: "Confirm live session slot",
      done: input.hasSchedule,
      detail: input.hasSchedule
        ? "Schedule is set."
        : "Client can pick a slot, or you can set Tuesday/Friday 11:00 or 16:00 for them.",
      href: `${programmeHref}#schedule`,
    },
  ];
}

export type Week1LaunchSummary = {
  assigned: boolean;
  receiptsReady: boolean;
  guideReady: boolean;
  scheduleReady: boolean;
  completeCount: number;
  totalCount: number;
  nextActionLabel: string;
  nextActionHref: string;
};

export function summarizeWeek1Launch(items: Week1LaunchChecklistItem[]): Week1LaunchSummary {
  const byId = new Map(items.map((item) => [item.id, item]));
  const open = items.find((item) => !item.done);
  return {
    assigned: Boolean(byId.get("assign")?.done),
    receiptsReady: Boolean(byId.get("receipts")?.done),
    guideReady: Boolean(byId.get("docs")?.done),
    scheduleReady: Boolean(byId.get("schedule")?.done),
    completeCount: items.filter((item) => item.done).length,
    totalCount: items.length,
    nextActionLabel: open?.label ?? "Week 1 launch complete",
    nextActionHref: open?.href ?? items[0]?.href ?? "/admin/clients/",
  };
}

export type WeekMapItem = {
  id: string;
  kind: "journey" | "live_session" | "schedule" | "check_in" | "practice";
  title: string;
  detail: string;
  href: string | null;
  status: "current" | "open" | "done" | "locked";
  statusLabel: string;
};

export function buildWeekMapItems(thisWeek: ThisWeekModel): WeekMapItem[] {
  const items: WeekMapItem[] = [];

  if (thisWeek.journeyTitle) {
    const isCurrent = thisWeek.focusKind === "journey";
    items.push({
      id: "journey",
      kind: "journey",
      title: thisWeek.journeyTitle,
      detail: "Interactive journey step for this week",
      href: thisWeek.journeyHref,
      status: isCurrent ? "current" : "open",
      statusLabel: isCurrent ? "Continue" : "Open",
    });
  }

  if (thisWeek.focusKind === "schedule" || (!thisWeek.sessionTitle && thisWeek.focusKind !== "waiting")) {
    if (thisWeek.focusKind === "schedule") {
      items.push({
        id: "schedule",
        kind: "schedule",
        title: "Choose your live session slot",
        detail: "Tuesday or Friday · 11:00 or 16:00",
        href: "/portal/programme/schedule/",
        status: "current",
        statusLabel: "Choose",
      });
    }
  }

  if (thisWeek.sessionTitle) {
    const isCurrent = thisWeek.focusKind === "live_session";
    items.push({
      id: "live_session",
      kind: "live_session",
      title: thisWeek.sessionTitle,
      detail: thisWeek.sessionLockedReason ?? "Live coaching session for this week",
      href: thisWeek.sessionHref,
      status: thisWeek.sessionHref ? (isCurrent ? "current" : "open") : "locked",
      statusLabel: thisWeek.sessionHref ? (isCurrent ? "Open" : "Ready") : "Locked",
    });
  }

  items.push({
    id: "check_in",
    kind: "check_in",
    title: "Daily check-in",
    detail: thisWeek.checkInDone ? "Logged today" : "A short mood and urge pause",
    href: "/portal/#daily-check-in",
    status: thisWeek.checkInDone ? "done" : thisWeek.focusKind === "practice" ? "current" : "open",
    statusLabel: thisWeek.checkInDone ? "Done" : "Open",
  });

  if (thisWeek.practiceTotalCount > 0) {
    const practiceDone = thisWeek.practiceDoneCount >= thisWeek.practiceTotalCount;
    items.push({
      id: "practice",
      kind: "practice",
      title: "Daily practice ticks",
      detail: `${thisWeek.practiceDoneCount}/${thisWeek.practiceTotalCount} complete today`,
      href: "/portal/#daily-check-in",
      status: practiceDone ? "done" : thisWeek.focusKind === "practice" ? "current" : "open",
      statusLabel: practiceDone ? "Done" : "Open",
    });
  }

  return items;
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

export type ClientJourneyStage =
  | "invite"
  | "password"
  | "onboarding"
  | "intake"
  | "assigned"
  | "active"
  | "maintenance";

export type ClientJourneySnapshot = {
  stage: ClientJourneyStage;
  stageLabel: string;
  inviteSent: boolean;
  inviteSentAt: string | null;
  invitationStatus: ClientProfile["invitation_status"] | null;
  passwordSet: boolean | null;
  onboarded: boolean;
  intakeAnswered: number;
  intakeTotal: number;
  intakeComplete: boolean;
  weekNumber: number | null;
  nextStepSentence: string;
  lastActivityAt: string | null;
  openFlagCount: number;
  enrollmentStatus: Enrollment["status"] | null;
};

export function buildClientJourneySnapshot(input: {
  clientProfile: ClientProfile | null;
  passwordSet?: boolean | null;
  intakeAnswered?: number;
  intakeTotal?: number;
  intakeComplete?: boolean;
  enrollment?: Pick<Enrollment, "status" | "last_activity_at"> | null;
  weekNumber?: number | null;
  nextStepSentence?: string | null;
  lastActivityAt?: string | null;
  openFlagCount?: number;
}): ClientJourneySnapshot {
  const profile = input.clientProfile;
  const inviteSent = Boolean(profile?.invited_at) || profile?.invitation_status === "pending" || profile?.invitation_status === "accepted";
  const onboarded = Boolean(profile?.onboarding_completed_at || profile?.invitation_accepted_at);
  const intakeComplete = Boolean(input.intakeComplete);
  const hasEnrollment = Boolean(input.enrollment);
  const passwordSet = input.passwordSet ?? null;
  const enrollmentStatus = input.enrollment?.status ?? null;

  let stage: ClientJourneyStage = "invite";
  if (enrollmentStatus === "completed") stage = "maintenance";
  else if (hasEnrollment && (input.weekNumber || input.lastActivityAt)) stage = "active";
  else if (hasEnrollment) stage = "assigned";
  else if (intakeComplete) stage = "assigned";
  else if (onboarded) stage = "intake";
  else if (passwordSet === true || (passwordSet === null && inviteSent && onboarded)) stage = "onboarding";
  else if (inviteSent && passwordSet === false) stage = "password";
  else if (inviteSent) stage = "password";

  const stageLabel: Record<ClientJourneyStage, string> = {
    invite: "Invite",
    password: "Password setup",
    onboarding: "Onboarding",
    intake: "Intake",
    assigned: "Programme assigned",
    active: "Active programme",
    maintenance: "Maintenance",
  };

  return {
    stage,
    stageLabel: stageLabel[stage],
    inviteSent,
    inviteSentAt: profile?.invited_at ?? null,
    invitationStatus: profile?.invitation_status ?? null,
    passwordSet,
    onboarded,
    intakeAnswered: input.intakeAnswered ?? 0,
    intakeTotal: input.intakeTotal ?? 0,
    intakeComplete,
    weekNumber: input.weekNumber ?? null,
    nextStepSentence:
      input.nextStepSentence?.trim() ||
      (intakeComplete && !hasEnrollment
        ? "Ready for programme assignment."
        : !onboarded
          ? "Waiting for onboarding."
          : "Continue the course loop."),
    lastActivityAt: input.lastActivityAt ?? input.enrollment?.last_activity_at ?? null,
    openFlagCount: input.openFlagCount ?? 0,
    enrollmentStatus,
  };
}
