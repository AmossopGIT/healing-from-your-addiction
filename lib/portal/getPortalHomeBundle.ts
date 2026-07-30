import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import {
  getClientConsultation,
  getClientContentReceipts,
  getClientEnrollmentBundle,
  getClientIntakeSubmission,
  getClientMessages,
  getPortalNotificationSummary,
} from "@/lib/dashboard/queries";
import { countAnsweredQuestions, getIntakeQuestionSetForAddiction } from "@/lib/intake/questions";
import { buildPortalActivityFeed } from "@/lib/portal/activityFeed";
import { getDailyAffirmation, getIntakeInformedAffirmationNote } from "@/lib/portal/dailyAffirmation";
import { computeAbstinenceDays, computeEngagementStreak, countPausesThisWeek } from "@/lib/portal/engagementStreak";
import {
  buildPortalHomeHero,
  resolvePortalHomeSections,
  resolvePortalHomeStage,
  type PortalHomeBundle,
} from "@/lib/portal/homeState";
import { buildPortalMilestones } from "@/lib/portal/milestones";
import { resolvePortalNextStep } from "@/lib/portal/nextStep";
import { homeworkToneForProgrammeWeek } from "@/lib/programme/homework";
import type { ClientDailyCheckIn, ClientHomeworkEntry, ClientRecoveryGoal } from "@/types/database";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getPortalHomeBundle(userId: string): Promise<PortalHomeBundle | null> {
  const profile = await getAuthProfile();
  if (!profile || profile.id !== userId) return null;

  const clientProfile = await getClientProfileForUser(userId);
  if (!clientProfile) {
    return null;
  }

  const supabase = await createClient();

  const [
    enrollmentBundle,
    intakeSubmission,
    consultation,
    notifications,
    messagesWithProfiles,
    checkInsResult,
    recoveryGoalResult,
    pushResult,
  ] = await Promise.all([
    getClientEnrollmentBundle(userId),
    getClientIntakeSubmission(clientProfile.id),
    getClientConsultation(clientProfile.id),
    getPortalNotificationSummary(userId),
    getClientMessages(clientProfile.id),
    supabase
      .from("client_daily_check_ins")
      .select("*")
      .eq("client_profile_id", clientProfile.id)
      .order("check_in_date", { ascending: false })
      .limit(14),
    supabase.from("client_recovery_goals").select("*").eq("client_profile_id", clientProfile.id).maybeSingle(),
    supabase
      .from("web_push_subscriptions")
      .select("categories, consent_state, status")
      .eq("user_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const recentCheckIns = (checkInsResult.data ?? []) as ClientDailyCheckIn[];
  const recoveryGoal = (recoveryGoalResult.data ?? null) as ClientRecoveryGoal | null;
  const todayCheckIn = recentCheckIns.find((checkIn) => checkIn.check_in_date === todayIsoDate()) ?? null;

  const sessions = enrollmentBundle?.sessions ?? [];
  const progress = enrollmentBundle?.progress ?? [];
  const progressBySessionId = new Map(progress.map((item) => [item.session_id, item]));
  const sessionIds = sessions.map((session) => session.id);

  const [sessionReceipts, documentReceipts] = await Promise.all([
    sessionIds.length
      ? getClientContentReceipts(clientProfile.id, { contentKind: "session", contentIds: sessionIds })
      : Promise.resolve([]),
    getClientContentReceipts(clientProfile.id, { contentKind: "document" }),
  ]);

  const intakeQuestionSet = clientProfile.addiction_slug
    ? getIntakeQuestionSetForAddiction(clientProfile.addiction_slug)
    : null;
  const intakeProgress = intakeQuestionSet && intakeSubmission
    ? countAnsweredQuestions(intakeSubmission.responses, intakeQuestionSet)
    : { answered: 0, total: intakeQuestionSet?.sections.flatMap((section) => section.questions).length ?? 0 };

  const intakeCompleted = Boolean(intakeSubmission?.completed_at);
  const stage = resolvePortalHomeStage({
    clientProfile,
    intakeCompleted,
    enrollment: enrollmentBundle?.enrollment ?? null,
  });

  const completedSessionCount = progress.filter((item) => item.status === "completed").length;
  const availableSessionCount = progress.filter((item) => item.status !== "locked").length;
  const currentWeekNumber = sessions.find(
    (session) => progressBySessionId.get(session.id)?.status !== "locked" && progressBySessionId.get(session.id)?.status !== "completed",
  )?.week_number ?? sessions[sessions.length - 1]?.week_number ?? 1;

  const activityDates: string[] = [];
  for (const checkIn of recentCheckIns) activityDates.push(checkIn.check_in_date);
  for (const receipt of sessionReceipts) {
    if (receipt.read_at) activityDates.push(receipt.read_at);
  }
  for (const item of progress) {
    if (item.completed_at) activityDates.push(item.completed_at);
  }
  if (intakeSubmission?.updated_at) activityDates.push(intakeSubmission.updated_at);
  for (const message of messagesWithProfiles) {
    if (message.author_id === userId) activityDates.push(message.created_at);
  }

  const engagementStreak = computeEngagementStreak(activityDates);
  const pauseCountThisWeek = countPausesThisWeek(recentCheckIns);
  const abstinenceDays = recoveryGoal?.show_abstinence_counter
    ? computeAbstinenceDays(recoveryGoal.abstinence_start_date)
    : 0;

  const unreadSessionReceipts = sessionReceipts
    .filter((receipt) => !receipt.read_at)
    .map((receipt) => {
      const session = sessions.find((item) => item.id === receipt.content_id);
      return session
        ? { sessionId: session.id, sessionNumber: session.session_number, title: session.title }
        : null;
    })
    .filter((item): item is { sessionId: string; sessionNumber: number; title: string } => Boolean(item));

  const nextAvailableSession = sessions.find((session) => {
    const sessionProgress = progressBySessionId.get(session.id);
    return sessionProgress && sessionProgress.status !== "locked";
  });

  const nextStep = resolvePortalNextStep({
    notifications,
    intakeSubmission,
    intakeIncomplete: !intakeCompleted && Boolean(clientProfile.addiction_slug),
    consultation,
    sessions,
    progressBySessionId,
    unreadSessionReceipts,
    checkInDoneToday: Boolean(todayCheckIn),
    hasEnrollment: Boolean(enrollmentBundle?.enrollment),
    needsSchedule: Boolean(enrollmentBundle?.enrollment && !enrollmentBundle.schedule),
  });

  if (stage === "onboarding") {
    nextStep.title = "Complete your profile";
    nextStep.description = "Finish onboarding so your private portal and intake questions can be prepared.";
    nextStep.href = "/portal/onboarding/";
    nextStep.buttonLabel = "Continue setup";
    nextStep.artId = "process-enquiry";
  }

  const dailyAffirmation = getDailyAffirmation(clientProfile.id, clientProfile.addiction_slug);
  const affirmationNote = getIntakeInformedAffirmationNote(intakeSubmission?.responses);

  const sessionEvents = sessionReceipts.flatMap((receipt) => {
    const session = sessions.find((item) => item.id === receipt.content_id);
    if (!session) return [];
    const events = [];
    if (receipt.read_at) {
      events.push({
        id: `${session.id}-read`,
        label: `Opened ${session.title}`,
        occurredAt: receipt.read_at,
        href: `/portal/programme/session/${session.session_number}/`,
      });
    }
    const sessionProgress = progressBySessionId.get(session.id);
    if (sessionProgress?.completed_at) {
      events.push({
        id: `${session.id}-completed`,
        label: `Completed ${session.title}`,
        occurredAt: sessionProgress.completed_at,
        href: `/portal/programme/session/${session.session_number}/`,
      });
    }
    return events;
  });

  const { data: documents } = await supabase
    .from("client_documents")
    .select("id, label, created_at")
    .eq("client_profile_id", clientProfile.id)
    .order("created_at", { ascending: false })
    .limit(10);

  const activityFeed = buildPortalActivityFeed({
    messages: messagesWithProfiles.slice(-20).map((message) => ({
      id: message.id,
      body: message.body,
      created_at: message.created_at,
      isAdmin: (message.profiles as { role?: string } | null)?.role === "admin",
    })),
    sessionEvents,
    documentEvents: (documents ?? []).map((document) => ({
      id: document.id,
      label: document.label,
      occurredAt: document.created_at,
    })),
    intakeEvents: intakeSubmission
      ? [
          {
            id: intakeSubmission.id,
            label: intakeSubmission.completed_at ? "Intake submitted" : "Intake progress saved",
            occurredAt: intakeSubmission.completed_at ?? intakeSubmission.updated_at,
          },
        ]
      : [],
    checkInEvents: recentCheckIns.map((checkIn) => ({
      id: checkIn.id,
      label: checkIn.pause_taken ? "Logged a pause" : "Daily check-in completed",
      occurredAt: checkIn.created_at,
    })),
  });

  const milestones = buildPortalMilestones({
    intakeSubmission,
    progress,
    sessionReceiptReadAts: sessionReceipts.map((receipt) => receipt.read_at).filter(Boolean) as string[],
    engagementStreak,
    enrollment: enrollmentBundle?.enrollment ?? null,
    maxWeekNumber: Math.max(...sessions.map((session) => session.week_number), 0),
  });

  const firstName = profile.full_name?.split(" ")[0] ?? null;
  const hero = buildPortalHomeHero({
    stage,
    firstName,
    engagementStreak,
    abstinenceDays,
    showAbstinence: Boolean(recoveryGoal?.show_abstinence_counter),
    intakeAnswered: intakeProgress.answered,
    intakeTotal: intakeProgress.total,
    templateTitle: enrollmentBundle?.template?.title ?? null,
    currentWeekNumber,
    completedSessionCount,
    availableSessionCount,
  });

  const pushCategories = (pushResult.data?.categories ?? []) as string[];
  const hasPushReminders =
    pushResult.data?.consent_state === "subscribed" && pushCategories.includes("gentle_reminders");

  const today = todayIsoDate();
  const todayHomeworkEntries = (enrollmentBundle?.homeworkEntries ?? []).filter(
    (entry) => entry.entry_date === today,
  ) as ClientHomeworkEntry[];
  const homeworkTasks = enrollmentBundle?.homeworkTasks ?? [];
  const pointsTotal = enrollmentBundle?.pointsTotal ?? 0;
  const homeworkTone = homeworkToneForProgrammeWeek(currentWeekNumber);

  return {
    profile,
    clientProfile,
    stage,
    sections: resolvePortalHomeSections(stage),
    hero,
    nextStep,
    notifications,
    enrollment: enrollmentBundle?.enrollment ?? null,
    template: enrollmentBundle?.template ?? null,
    sessions,
    progress,
    intakeSubmission,
    intakeAnswered: intakeProgress.answered,
    intakeTotal: intakeProgress.total,
    dailyAffirmation,
    affirmationNote,
    todayCheckIn,
    recentCheckIns,
    recoveryGoal,
    engagementStreak,
    pauseCountThisWeek,
    abstinenceDays,
    completedSessionCount,
    availableSessionCount,
    currentWeekNumber,
    milestones,
    activityFeed,
    nextSessionHref: enrollmentBundle?.schedule
      ? nextAvailableSession
        ? `/portal/programme/session/${nextAvailableSession.session_number}/`
        : null
      : enrollmentBundle?.enrollment
        ? "/portal/programme/schedule/"
        : null,
    nextSessionLabel: enrollmentBundle?.schedule
      ? nextAvailableSession?.title ?? null
      : enrollmentBundle?.enrollment
        ? "Choose your session time"
        : null,
    hasPushReminders,
    firstName,
    pointsTotal,
    homeworkTasks,
    todayHomeworkEntries,
    homeworkTone,
    needsSchedule: Boolean(enrollmentBundle?.enrollment && !enrollmentBundle.schedule),
  };
}
