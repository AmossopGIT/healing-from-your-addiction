import { createClient } from "@/lib/supabase/server";
import type {
  ClientActivityPrivateAnswer,
  ClientActivityProgress,
  ClientContentReceipt,
  ClientDailyCheckIn,
  ClientDocument,
  ClientHomeworkEntry,
  ClientIntakeSubmission,
  ClientMessage,
  ClientPointsLedgerEntry,
  ClientProfile,
  Enrollment,
  EnrollmentSchedule,
  PortalContentKind,
  Profile,
  ProgrammeAdminFlag,
  ProgrammeActivityEvent,
  ProgrammeDoc,
  ProgrammeHomeworkTask,
  ProgrammeSession,
  ProgrammeTemplate,
  SessionProgress,
} from "@/types/database";

type MessageAuthorProfile = Pick<Profile, "id" | "full_name" | "role">;

export type ClientMessageWithProfile = ClientMessage & {
  profiles: MessageAuthorProfile | null;
};

export type ClientDocumentWithReceipt = ClientDocument & {
  receipt: ClientContentReceipt | null;
};

export type PortalNotificationItem = {
  key: "messages" | "documents" | "sessions";
  count: number;
  href: string;
  label: string;
  description: string;
  latestAt: string;
};

export type PortalNotificationSummary = {
  unreadCount: number;
  unreadMessageCount: number;
  unreadDocumentCount: number;
  unreadSessionCount: number;
  items: PortalNotificationItem[];
};

function startOfCurrentMonthIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

function formatCountLabel(count: number, singular: string, plural: string) {
  return count === 1 ? singular : plural;
}

async function getMessageAuthorMap(authorIds: string[]) {
  if (!authorIds.length) {
    return new Map<string, MessageAuthorProfile>();
  }

  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, role").in("id", authorIds);
  return new Map((profiles ?? []).map((profile) => [profile.id, profile]));
}

export async function getClientContentReceipts(
  clientProfileId: string,
  options?: {
    contentKind?: PortalContentKind;
    contentIds?: string[];
    unreadOnly?: boolean;
    releasedAfter?: string;
  },
) {
  const supabase = await createClient();
  let query = supabase
    .from("client_content_receipts")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .order("released_at", { ascending: false });

  if (options?.contentKind) {
    query = query.eq("content_kind", options.contentKind);
  }

  if (options?.contentIds?.length) {
    query = query.in("content_id", options.contentIds);
  }

  if (options?.unreadOnly) {
    query = query.is("read_at", null);
  }

  if (options?.releasedAfter) {
    query = query.gte("released_at", options.releasedAfter);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getClientEnrollmentBundle(userId: string) {
  const supabase = await createClient();

  const { data: clientProfile } = await supabase.from("client_profiles").select("*").eq("user_id", userId).maybeSingle();

  if (!clientProfile) {
    return null;
  }

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("client_profile_id", clientProfile.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const { data: enrollmentHistory } = await supabase
    .from("enrollments")
    .select("id, template_id, status, programme_version, created_at, journey_started_at, journey_completed_at, last_activity_at")
    .eq("client_profile_id", clientProfile.id)
    .order("created_at", { ascending: false });

  if (!enrollment) {
    return {
      clientProfile,
      enrollment: null as Enrollment | null,
      template: null as ProgrammeTemplate | null,
      sessions: [] as ProgrammeSession[],
      progress: [] as SessionProgress[],
      schedule: null as EnrollmentSchedule | null,
      homeworkTasks: [] as ProgrammeHomeworkTask[],
      homeworkEntries: [] as ClientHomeworkEntry[],
      pointsTotal: 0,
      programmeDocs: [] as ProgrammeDoc[],
      activityProgress: [] as ClientActivityProgress[],
      activityEvents: [] as ProgrammeActivityEvent[],
      enrollmentHistory: enrollmentHistory ?? [],
    };
  }

  const { data: template } = await supabase.from("programme_templates").select("*").eq("id", enrollment.template_id).single();

  const { data: sessions } = await supabase
    .from("programme_sessions")
    .select("*")
    .eq("template_id", enrollment.template_id)
    .order("sort_order", { ascending: true });

  const [
    { data: progress },
    { data: schedule },
    { data: homeworkTasks },
    { data: homeworkEntries },
    { data: pointsRows },
    { data: programmeDocs },
    { data: activityProgress },
    { data: activityEvents },
  ] = await Promise.all([
    supabase.from("session_progress").select("*").eq("enrollment_id", enrollment.id),
    supabase.from("enrollment_schedules").select("*").eq("enrollment_id", enrollment.id).maybeSingle(),
    supabase
      .from("programme_homework_tasks")
      .select("*")
      .eq("template_id", enrollment.template_id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("client_homework_entries")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .order("entry_date", { ascending: false }),
    supabase.from("client_points_ledger").select("points").eq("client_profile_id", clientProfile.id),
    template?.addiction_slug
      ? supabase
          .from("programme_docs")
          .select("*")
          .eq("addiction_slug", template.addiction_slug)
          .order("sort_order", { ascending: true })
      : Promise.resolve({ data: [] as ProgrammeDoc[] }),
    supabase.from("client_activity_progress").select("*").eq("enrollment_id", enrollment.id),
    supabase
      .from("programme_activity_events")
      .select("*")
      .eq("enrollment_id", enrollment.id)
      .order("occurred_at", { ascending: false })
      .limit(30),
  ]);

  const pointsTotal = (pointsRows ?? []).reduce((sum, row) => sum + (row.points ?? 0), 0);

  return {
    clientProfile,
    enrollment,
    template: template ?? null,
    sessions: sessions ?? [],
    progress: progress ?? [],
    schedule: (schedule as EnrollmentSchedule | null) ?? null,
    homeworkTasks: (homeworkTasks as ProgrammeHomeworkTask[]) ?? [],
    homeworkEntries: (homeworkEntries as ClientHomeworkEntry[]) ?? [],
    pointsTotal,
    programmeDocs: (programmeDocs as ProgrammeDoc[]) ?? [],
    activityProgress: (activityProgress as ClientActivityProgress[]) ?? [],
    activityEvents: (activityEvents as ProgrammeActivityEvent[]) ?? [],
    enrollmentHistory: enrollmentHistory ?? [],
  };
}

export async function getAdminClientBundle(clientProfileId: string, requestedEnrollmentId?: string | null) {
  const supabase = await createClient();
  const dataErrors: string[] = [];
  const {
    data: { user: adminUser },
  } = await supabase.auth.getUser();

  const { data: clientProfile, error: clientProfileError } = await supabase
    .from("client_profiles")
    .select("*")
    .eq("id", clientProfileId)
    .single();
  if (clientProfileError) dataErrors.push(`Client profile: ${clientProfileError.message}`);

  if (!clientProfile) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", clientProfile.user_id)
    .single();
  if (profileError) dataErrors.push(`Profile: ${profileError.message}`);

  let enrollmentQuery = supabase
    .from("enrollments")
    .select("*")
    .eq("client_profile_id", clientProfileId);
  if (requestedEnrollmentId) enrollmentQuery = enrollmentQuery.eq("id", requestedEnrollmentId);
  const { data: enrollment, error: enrollmentError } = await enrollmentQuery
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (enrollmentError) dataErrors.push(`Enrollment: ${enrollmentError.message}`);
  const { data: enrollmentHistory, error: enrollmentHistoryError } = await supabase
    .from("enrollments")
    .select("id, template_id, status, programme_version, created_at, journey_started_at, journey_completed_at, last_activity_at")
    .eq("client_profile_id", clientProfileId)
    .order("created_at", { ascending: false });
  if (enrollmentHistoryError) dataErrors.push(`Enrollment history: ${enrollmentHistoryError.message}`);

  const { data: templates, error: templatesError } = await supabase
    .from("programme_templates")
    .select("*")
    .order("addiction_slug");
  if (templatesError) dataErrors.push(`Programme templates: ${templatesError.message}`);

  let template: ProgrammeTemplate | null = null;
  let sessions: ProgrammeSession[] = [];
  let progress: SessionProgress[] = [];
  let schedule: EnrollmentSchedule | null = null;
  let homeworkTasks: ProgrammeHomeworkTask[] = [];
  let homeworkEntries: ClientHomeworkEntry[] = [];
  let pointsTotal = 0;
  let programmeDocs: ProgrammeDoc[] = [];
  let pointsLedger: ClientPointsLedgerEntry[] = [];
  let activityProgress: ClientActivityProgress[] = [];
  let adminFlags: ProgrammeAdminFlag[] = [];
  let sharedPrivateAnswers: ClientActivityPrivateAnswer[] = [];
  let dailyCheckIns: ClientDailyCheckIn[] = [];
  let activityEvents: ProgrammeActivityEvent[] = [];

  if (enrollment) {
    const templateResult = await supabase.from("programme_templates").select("*").eq("id", enrollment.template_id).single();
    template = templateResult.data ?? null;
    if (templateResult.error) dataErrors.push(`Assigned programme: ${templateResult.error.message}`);

    const [
      sessionsResult,
      progressResult,
      scheduleResult,
      homeworkTasksResult,
      homeworkEntriesResult,
      pointsResult,
      docsResult,
      activityResult,
      flagsResult,
      privateAnswersResult,
      checkInsResult,
      activityEventsResult,
    ] = await Promise.all([
      supabase
        .from("programme_sessions")
        .select("*")
        .eq("template_id", enrollment.template_id)
        .order("sort_order", { ascending: true }),
      supabase.from("session_progress").select("*").eq("enrollment_id", enrollment.id),
      supabase.from("enrollment_schedules").select("*").eq("enrollment_id", enrollment.id).maybeSingle(),
      supabase
        .from("programme_homework_tasks")
        .select("*")
        .eq("template_id", enrollment.template_id)
        .order("sort_order", { ascending: true }),
      supabase
        .from("client_homework_entries")
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .order("entry_date", { ascending: false }),
      supabase
        .from("client_points_ledger")
        .select("*")
        .eq("client_profile_id", clientProfileId)
        .order("created_at", { ascending: false })
        .limit(50),
      template?.addiction_slug
        ? supabase
            .from("programme_docs")
            .select("*")
            .eq("addiction_slug", template.addiction_slug)
            .order("sort_order", { ascending: true })
        : Promise.resolve({ data: [] as ProgrammeDoc[], error: null }),
      supabase
        .from("client_activity_progress")
        .select(
          "id, enrollment_id, activity_id, status, responses, public_responses, shared_with_admin, points_awarded, started_at, completed_at, skipped_reason, created_at, updated_at",
        )
        .eq("enrollment_id", enrollment.id),
      supabase
        .from("programme_admin_flags")
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("client_activity_private_answers")
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .eq("shared_with_admin", true),
      supabase
        .from("client_daily_check_ins")
        .select("*")
        .eq("client_profile_id", clientProfileId)
        .order("check_in_date", { ascending: false })
        .limit(21),
      supabase
        .from("programme_activity_events")
        .select("*")
        .eq("enrollment_id", enrollment.id)
        .order("occurred_at", { ascending: false })
        .limit(50),
    ]);

    const resultErrors = [
      ["Sessions", sessionsResult.error],
      ["Session progress", progressResult.error],
      ["Schedule", scheduleResult.error],
      ["Homework tasks", homeworkTasksResult.error],
      ["Homework entries", homeworkEntriesResult.error],
      ["Points", pointsResult.error],
      ["Programme documents", docsResult.error],
      ["Activity results", activityResult.error],
      ["Admin flags", flagsResult.error],
      ["Shared answers", privateAnswersResult.error],
      ["Daily check-ins", checkInsResult.error],
      ["Programme events", activityEventsResult.error],
    ] as const;
    for (const [label, resultError] of resultErrors) {
      if (resultError) dataErrors.push(`${label}: ${resultError.message}`);
    }

    sessions = sessionsResult.data ?? [];
    progress = progressResult.data ?? [];
    schedule = scheduleResult.data ?? null;
    homeworkTasks = homeworkTasksResult.data ?? [];
    homeworkEntries = homeworkEntriesResult.data ?? [];
    pointsLedger = pointsResult.data ?? [];
    pointsTotal = pointsLedger.reduce((sum, row) => sum + (row.points ?? 0), 0);
    programmeDocs = docsResult.data ?? [];
    activityProgress = (activityResult.data as ClientActivityProgress[]) ?? [];
    adminFlags = (flagsResult.data as ProgrammeAdminFlag[]) ?? [];
    sharedPrivateAnswers = (privateAnswersResult.data as ClientActivityPrivateAnswer[]) ?? [];
    dailyCheckIns = (checkInsResult.data as ClientDailyCheckIn[]) ?? [];
    activityEvents = (activityEventsResult.data as ProgrammeActivityEvent[]) ?? [];
    if (adminUser && sharedPrivateAnswers.length) {
      const { error: auditError } = await supabase.from("private_answer_access_audit").insert(
        sharedPrivateAnswers.map((answer) => ({
          progress_id: answer.progress_id,
          enrollment_id: answer.enrollment_id,
          client_profile_id: answer.client_profile_id,
          accessed_by: adminUser.id,
          reason: "programme_review",
        })),
      );
      if (auditError) dataErrors.push(`Private answer audit: ${auditError.message}`);
    }
  }

  return {
    clientProfile,
    profile: profile ?? null,
    enrollment: enrollment ?? null,
    template,
    templates: templates ?? [],
    sessions,
    progress,
    schedule,
    homeworkTasks,
    homeworkEntries,
    pointsTotal,
    pointsLedger,
    programmeDocs,
    activityProgress,
    adminFlags,
    sharedPrivateAnswers,
    dailyCheckIns,
    activityEvents,
    enrollmentHistory: enrollmentHistory ?? [],
    dataErrors,
  };
}

export async function getClientMessages(clientProfileId: string) {
  const supabase = await createClient();
  const { data: messages } = await supabase
    .from("client_messages")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .order("created_at", { ascending: true });

  if (!messages?.length) {
    return [];
  }

  const authorIds = [...new Set(messages.map((message) => message.author_id))];
  const profileMap = await getMessageAuthorMap(authorIds);

  return messages.map((message) => ({
    ...message,
    profiles: profileMap.get(message.author_id) ?? null,
  })) as ClientMessageWithProfile[];
}

export async function getClientDocuments(clientProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_documents")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getClientDocumentsWithReceipts(clientProfileId: string) {
  const [documents, receipts] = await Promise.all([
    getClientDocuments(clientProfileId),
    getClientContentReceipts(clientProfileId, { contentKind: "document" }),
  ]);

  const receiptByDocumentId = new Map(receipts.map((receipt) => [receipt.content_id, receipt]));

  return documents.map((document) => ({
    ...document,
    receipt: receiptByDocumentId.get(document.id) ?? null,
  })) as ClientDocumentWithReceipt[];
}

export async function getClientSessionReceiptMap(clientProfileId: string, sessionIds: string[]) {
  const receipts = await getClientContentReceipts(clientProfileId, {
    contentKind: "session",
    contentIds: sessionIds,
  });

  return new Map(receipts.map((receipt) => [receipt.content_id, receipt]));
}

export async function getPortalNotificationSummary(userId: string): Promise<PortalNotificationSummary | null> {
  const supabase = await createClient();
  const { data: clientProfile } = await supabase.from("client_profiles").select("id").eq("user_id", userId).maybeSingle();

  if (!clientProfile) {
    return null;
  }

  const releasedAfter = startOfCurrentMonthIso();

  const { data: unreadMessagesRaw } = await supabase
    .from("client_messages")
    .select("*")
    .eq("client_profile_id", clientProfile.id)
    .is("read_at", null)
    .order("created_at", { ascending: false });

  const unreadMessages = unreadMessagesRaw ?? [];
  const authorIds = [...new Set(unreadMessages.map((message) => message.author_id))];
  const profileMap = await getMessageAuthorMap(authorIds);
  const unreadAdminMessages = unreadMessages.filter((message) => profileMap.get(message.author_id)?.role === "admin");

  const unreadReceipts = await getClientContentReceipts(clientProfile.id, {
    unreadOnly: true,
    releasedAfter,
  });

  const unreadDocumentReceipts = unreadReceipts.filter((receipt) => receipt.content_kind === "document");
  const unreadSessionReceipts = unreadReceipts.filter((receipt) => receipt.content_kind === "session");

  const items: PortalNotificationItem[] = [];

  if (unreadAdminMessages.length) {
    const latestMessage = unreadAdminMessages[0];
    const latestAuthor = profileMap.get(latestMessage.author_id);
    items.push({
      key: "messages",
      count: unreadAdminMessages.length,
      href: "/portal/messages/",
      label: formatCountLabel(
        unreadAdminMessages.length,
        "1 new admin message",
        `${unreadAdminMessages.length} new admin messages`,
      ),
      description: latestAuthor?.full_name
        ? `Latest from ${latestAuthor.full_name}`
        : "Unread secure messages from Gerald",
      latestAt: latestMessage.created_at,
    });
  }

  if (unreadDocumentReceipts.length) {
    const documentIds = unreadDocumentReceipts.map((receipt) => receipt.content_id);
    const { data: documents } = await supabase.from("client_documents").select("id, label").in("id", documentIds);
    const firstDocument = documents?.[0];

    items.push({
      key: "documents",
      count: unreadDocumentReceipts.length,
      href: "/portal/resources/",
      label: formatCountLabel(
        unreadDocumentReceipts.length,
        "1 new resource this month",
        `${unreadDocumentReceipts.length} new resources this month`,
      ),
      description: unreadDocumentReceipts.length === 1 && firstDocument?.label
        ? firstDocument.label
        : "New shared files in your portal",
      latestAt: unreadDocumentReceipts[0].released_at,
    });
  }

  if (unreadSessionReceipts.length) {
    const sessionIds = unreadSessionReceipts.map((receipt) => receipt.content_id);
    const { data: sessions } = await supabase
      .from("programme_sessions")
      .select("id, title, session_number")
      .in("id", sessionIds);
    const firstSession = sessions?.[0];

    items.push({
      key: "sessions",
      count: unreadSessionReceipts.length,
      href: unreadSessionReceipts.length === 1 && firstSession
        ? `/portal/programme/session/${firstSession.session_number}/`
        : "/portal/programme/",
      label: formatCountLabel(
        unreadSessionReceipts.length,
        "1 new programme session this month",
        `${unreadSessionReceipts.length} new programme sessions this month`,
      ),
      description: unreadSessionReceipts.length === 1 && firstSession?.title
        ? firstSession.title
        : "New session content is ready to open",
      latestAt: unreadSessionReceipts[0].released_at,
    });
  }

  items.sort((left, right) => new Date(right.latestAt).getTime() - new Date(left.latestAt).getTime());

  return {
    unreadCount: unreadAdminMessages.length + unreadDocumentReceipts.length + unreadSessionReceipts.length,
    unreadMessageCount: unreadAdminMessages.length,
    unreadDocumentCount: unreadDocumentReceipts.length,
    unreadSessionCount: unreadSessionReceipts.length,
    items,
  };
}

export type ClientProfileWithProfile = ClientProfile & {
  profile?: { full_name: string | null; phone: string | null; id: string } | null;
};

export type ClientIntakeSubmissionRow = ClientIntakeSubmission;

export type ReadinessAssessmentRow = import("@/types/database").ReadinessAssessment;

export async function getClientReadinessAssessment(clientProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("readiness_assessments")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .eq("is_current", true)
    .maybeSingle();

  if (!data) {
    const { data: latest } = await supabase
      .from("readiness_assessments")
      .select("*")
      .eq("client_profile_id", clientProfileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!latest) return null;
    return normalizeReadinessRow(latest);
  }

  return normalizeReadinessRow(data);
}

export async function getClientReadinessAssessmentHistory(clientProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("readiness_assessments")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  return (data ?? []).map(normalizeReadinessRow);
}

export async function getUnreadAdminNotifications(limit = 20) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

function normalizeReadinessRow(data: Record<string, unknown>) {
  return {
    ...data,
    responses: (data.responses ?? {}) as Record<string, unknown>,
    commitment_score: Number(data.commitment_score),
    self_awareness_score: Number(data.self_awareness_score),
    emotional_capacity_score: Number(data.emotional_capacity_score),
    readiness_product: Number(data.readiness_product),
    readiness_index: data.readiness_index == null ? null : Number(data.readiness_index),
    focus_areas: (data.focus_areas ?? []) as string[],
    urgent_safety: Boolean(data.urgent_safety),
    is_current: data.is_current !== false,
    attempt_number: Number(data.attempt_number ?? 1),
  } as ReadinessAssessmentRow;
}

export async function getClientIntakeSubmission(clientProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_intake_submissions")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    responses: (data.responses ?? {}) as Record<string, string>,
  } as ClientIntakeSubmissionRow;
}

export async function getClientIntakeSubmissions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_intake_submissions")
    .select("*")
    .order("updated_at", { ascending: false });

  return (data ?? []).map((row) => ({
    ...row,
    responses: (row.responses ?? {}) as Record<string, string>,
  })) as ClientIntakeSubmissionRow[];
}

export type ClientConsultationRow = import("@/types/database").ClientConsultation;

export async function getClientConsultation(clientProfileId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("client_consultations")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .maybeSingle();

  if (!data) return null;

  return {
    ...data,
    responses: (data.responses ?? {}) as Record<string, unknown>,
  } as ClientConsultationRow;
}

export async function getClientConsultations() {
  const supabase = await createClient();
  const { data } = await supabase.from("client_consultations").select("*").order("updated_at", { ascending: false });

  return (data ?? []).map((row) => ({
    ...row,
    responses: (row.responses ?? {}) as Record<string, unknown>,
  })) as ClientConsultationRow[];
}

export async function ensureClientConsultation(clientProfileId: string) {
  const existing = await getClientConsultation(clientProfileId);
  if (existing) return existing;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("client_consultations")
    .insert({
      client_profile_id: clientProfileId,
      status: "not_sent",
      current_step: "personal",
      percent_complete: 0,
      responses: {},
    })
    .select("*")
    .single();

  if (error || !data) {
    const raced = await getClientConsultation(clientProfileId);
    if (raced) return raced;
    return null;
  }

  return {
    ...data,
    responses: (data.responses ?? {}) as Record<string, unknown>,
  } as ClientConsultationRow;
}

export { getPortalHomeBundle } from "@/lib/portal/getPortalHomeBundle";
export type { PortalHomeBundle } from "@/lib/portal/homeState";

export async function getPendingIntakeClients() {
  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("client_profiles")
    .select("id, user_id, addiction_slug, onboarding_completed_at, created_at")
    .not("onboarding_completed_at", "is", null)
    .order("created_at", { ascending: false });

  if (!clients?.length) return [];

  const clientIds = clients.map((client) => client.id);
  const userIds = [...new Set(clients.map((client) => client.user_id))];

  const [{ data: submissions }, { data: profiles }] = await Promise.all([
    supabase.from("client_intake_submissions").select("client_profile_id, completed_at, updated_at").in("client_profile_id", clientIds),
    supabase.from("profiles").select("id, full_name").in("id", userIds),
  ]);

  const submissionByClientId = new Map((submissions ?? []).map((submission) => [submission.client_profile_id, submission]));
  const profileByUserId = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return clients
    .filter((client) => {
      const submission = submissionByClientId.get(client.id);
      return !submission?.completed_at;
    })
    .map((client) => {
      const submission = submissionByClientId.get(client.id);
      const profile = profileByUserId.get(client.user_id);
      return {
        clientProfileId: client.id,
        fullName: profile?.full_name ?? "Client",
        addictionSlug: client.addiction_slug,
        startedAt: submission?.updated_at ?? null,
        onboardingCompletedAt: client.onboarding_completed_at,
      };
    });
}
