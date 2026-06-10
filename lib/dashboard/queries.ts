import { createClient } from "@/lib/supabase/server";
import type {
  ClientContentReceipt,
  ClientDocument,
  ClientIntakeSubmission,
  ClientMessage,
  ClientProfile,
  Enrollment,
  PortalContentKind,
  Profile,
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

  if (!enrollment) {
    return {
      clientProfile,
      enrollment: null as Enrollment | null,
      template: null as ProgrammeTemplate | null,
      sessions: [] as ProgrammeSession[],
      progress: [] as SessionProgress[],
    };
  }

  const { data: template } = await supabase.from("programme_templates").select("*").eq("id", enrollment.template_id).single();

  const { data: sessions } = await supabase
    .from("programme_sessions")
    .select("*")
    .eq("template_id", enrollment.template_id)
    .order("sort_order", { ascending: true });

  const { data: progress } = await supabase.from("session_progress").select("*").eq("enrollment_id", enrollment.id);

  return {
    clientProfile,
    enrollment,
    template: template ?? null,
    sessions: sessions ?? [],
    progress: progress ?? [],
  };
}

export async function getAdminClientBundle(clientProfileId: string) {
  const supabase = await createClient();

  const { data: clientProfile } = await supabase.from("client_profiles").select("*").eq("id", clientProfileId).single();

  if (!clientProfile) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", clientProfile.user_id).single();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("client_profile_id", clientProfileId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: templates } = await supabase.from("programme_templates").select("*").order("addiction_slug");

  let template: ProgrammeTemplate | null = null;
  let sessions: ProgrammeSession[] = [];
  let progress: SessionProgress[] = [];

  if (enrollment) {
    const templateResult = await supabase.from("programme_templates").select("*").eq("id", enrollment.template_id).single();
    template = templateResult.data ?? null;

    const sessionsResult = await supabase
      .from("programme_sessions")
      .select("*")
      .eq("template_id", enrollment.template_id)
      .order("sort_order", { ascending: true });
    sessions = sessionsResult.data ?? [];

    const progressResult = await supabase.from("session_progress").select("*").eq("enrollment_id", enrollment.id);
    progress = progressResult.data ?? [];
  }

  return {
    clientProfile,
    profile: profile ?? null,
    enrollment: enrollment ?? null,
    template,
    templates: templates ?? [],
    sessions,
    progress,
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
