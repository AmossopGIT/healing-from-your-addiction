"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { SessionProgressStatus } from "@/types/database";

export async function markSessionProgress(formData: FormData) {
  const progressId = String(formData.get("progressId") ?? "");
  const status = String(formData.get("status") ?? "completed") as SessionProgressStatus;
  const clientNotes = String(formData.get("clientNotes") ?? "").trim();
  const redirectTo = String(formData.get("redirectTo") ?? "/portal/programme/");

  if (!progressId) redirect(redirectTo);

  const supabase = await createClient();
  await supabase
    .from("session_progress")
    .update({
      status,
      client_notes: clientNotes || null,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", progressId);
  redirect(redirectTo);
}

export async function unlockSessionProgress(formData: FormData) {
  const progressId = String(formData.get("progressId") ?? "");
  const clientProfileId = String(formData.get("clientProfileId") ?? "");
  if (!progressId || !clientProfileId) redirect("/admin/clients/");

  const supabase = await createClient();
  await supabase.from("session_progress").update({
    status: "available",
    unlocked_at: new Date().toISOString(),
  }).eq("id", progressId);

  redirect(`/admin/clients/${clientProfileId}/programme/`);
}

export async function sendClientMessage(formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  const clientProfileId = String(formData.get("clientProfileId") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "/portal/messages/");
  if (!body) redirect(redirectTo);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  let resolvedClientProfileId = clientProfileId;
  if (!resolvedClientProfileId) {
    const { data: profile } = await supabase.from("client_profiles").select("id").eq("user_id", user.id).maybeSingle();
    resolvedClientProfileId = profile?.id ?? "";
  }
  if (!resolvedClientProfileId) redirect(redirectTo);

  await supabase.from("client_messages").insert({
    client_profile_id: resolvedClientProfileId,
    author_id: user.id,
    body,
  });

  redirect(redirectTo);
}

export async function createEnrollment(formData: FormData) {
  const clientProfileId = String(formData.get("clientProfileId") ?? "");
  const templateId = String(formData.get("templateId") ?? "");
  const startDate = String(formData.get("startDate") ?? "").trim();
  if (!clientProfileId || !templateId) redirect(`/admin/clients/${clientProfileId}/programme/`);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: enrollment, error } = await supabase.from("enrollments").insert({
    client_profile_id: clientProfileId,
    template_id: templateId,
    start_date: startDate || null,
    admin_id: user?.id ?? null,
    status: "active",
    current_session_number: 1,
  }).select("id, template_id").single();

  if (error || !enrollment) redirect(`/admin/clients/${clientProfileId}/programme/?error=enrollment-failed`);

  const { data: sessions } = await supabase
    .from("programme_sessions")
    .select("id, session_number")
    .eq("template_id", enrollment.template_id)
    .order("sort_order", { ascending: true });

  if (sessions?.length) {
    await supabase.from("session_progress").insert(
      sessions.map((session, index) => ({
        enrollment_id: enrollment.id,
        session_id: session.id,
        status: index < 2 ? ("available" as const) : ("locked" as const),
        unlocked_at: index < 2 ? new Date().toISOString() : null,
      })),
    );
  }

  redirect(`/admin/clients/${clientProfileId}/programme/`);
}

export async function uploadClientDocument(formData: FormData) {
  const clientProfileId = String(formData.get("clientProfileId") ?? "");
  const label = String(formData.get("label") ?? "").trim();
  const file = formData.get("file");

  if (!clientProfileId || !label || !(file instanceof File) || file.size === 0) {
    redirect(`/admin/clients/${clientProfileId}/documents/?error=missing-file`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  const path = `${clientProfileId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    redirect(`/admin/clients/${clientProfileId}/documents/?error=${encodeURIComponent(uploadError.message)}`);
  }

  await supabase.from("client_documents").insert({
    client_profile_id: clientProfileId,
    storage_path: path,
    label,
    uploaded_by: user.id,
  });

  redirect(`/admin/clients/${clientProfileId}/documents/`);
}
