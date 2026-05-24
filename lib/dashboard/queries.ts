import { createClient } from "@/lib/supabase/server";
import type { ClientProfile, Enrollment, ProgrammeSession, ProgrammeTemplate, SessionProgress } from "@/types/database";

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
  const { data: profiles } = await supabase.from("profiles").select("id, full_name, role").in("id", authorIds);
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return messages.map((message) => ({
    ...message,
    profiles: profileMap.get(message.author_id) ?? null,
  }));
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

export type ClientProfileWithProfile = ClientProfile & {
  profile?: { full_name: string | null; phone: string | null; id: string } | null;
};
