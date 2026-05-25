"use server";

import { createClient } from "@/lib/supabase/server";
import {
  dashboardFieldMaxLengths,
  normalizeMultiline,
  normalizeSingleLine,
  sanitizeDateInput,
  sanitizeRedirectPath,
  sanitizeSessionProgressStatus,
  sanitizeUuid,
} from "@/lib/dashboard/formValidation";
import { upsertClientContentReceipts } from "@/lib/dashboard/notifications";
import { redirect } from "next/navigation";

export async function markSessionProgress(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(String(formData.get("redirectTo") ?? "/portal/programme/"), ["/portal/"], "/portal/programme/");
  const progressId = sanitizeUuid(String(formData.get("progressId") ?? ""));
  const status = sanitizeSessionProgressStatus(String(formData.get("status") ?? "completed"));
  const clientNotes = normalizeMultiline(String(formData.get("clientNotes") ?? ""));

  if (!progressId || !status || clientNotes.length > dashboardFieldMaxLengths.clientNotes) redirect(redirectTo);

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
  const progressId = sanitizeUuid(String(formData.get("progressId") ?? ""));
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  if (!progressId || !clientProfileId) redirect("/admin/clients/");

  const supabase = await createClient();
  const releasedAt = new Date().toISOString();
  const { data: progress } = await supabase
    .from("session_progress")
    .update({
      status: "available",
      unlocked_at: releasedAt,
    })
    .eq("id", progressId)
    .select("session_id")
    .single();

  if (progress?.session_id) {
    await upsertClientContentReceipts([
      {
        clientProfileId,
        contentKind: "session",
        contentId: progress.session_id,
        releasedAt,
      },
    ]);
  }

  redirect(`/admin/clients/${clientProfileId}/programme/`);
}

export async function sendClientMessage(formData: FormData) {
  const redirectTo = sanitizeRedirectPath(
    String(formData.get("redirectTo") ?? "/portal/messages/"),
    ["/portal/", "/admin/"],
    "/portal/messages/",
  );
  const body = normalizeMultiline(String(formData.get("body") ?? ""));
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  if (!body || body.length > dashboardFieldMaxLengths.messageBody) redirect(redirectTo);

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
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const templateId = sanitizeUuid(String(formData.get("templateId") ?? ""));
  const rawStartDate = String(formData.get("startDate") ?? "");
  const startDate = sanitizeDateInput(rawStartDate);
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/programme/` : "/admin/clients/";
  if (!clientProfileId || !templateId || (rawStartDate.trim() && !startDate)) redirect(redirectTo);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

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
    const releasedAt = new Date().toISOString();
    await supabase.from("session_progress").insert(
      sessions.map((session, index) => ({
        enrollment_id: enrollment.id,
        session_id: session.id,
        status: index < 2 ? ("available" as const) : ("locked" as const),
        unlocked_at: index < 2 ? releasedAt : null,
      })),
    );

    const initiallyAvailableReceipts = sessions
      .filter((_, index) => index < 2)
      .map((session) => ({
        clientProfileId,
        contentKind: "session" as const,
        contentId: session.id,
        releasedAt,
      }));

    await upsertClientContentReceipts(initiallyAvailableReceipts);
  }

  redirect(`/admin/clients/${clientProfileId}/programme/`);
}

export async function uploadClientDocument(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const label = normalizeSingleLine(String(formData.get("label") ?? ""));
  const file = formData.get("file");
  const redirectTo = clientProfileId ? `/admin/clients/${clientProfileId}/documents/` : "/admin/clients/";

  if (!clientProfileId || !(file instanceof File) || file.size === 0) {
    redirect(`${redirectTo}?error=missing-file`);
  }
  if (!label || label.length > dashboardFieldMaxLengths.documentLabel) {
    redirect(`${redirectTo}?error=invalid-label`);
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login/");

  const safeFileName = normalizeSingleLine(file.name).replace(/[^a-zA-Z0-9._-]/g, "-") || "document";
  const path = `${clientProfileId}/${Date.now()}-${safeFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("client-documents").upload(path, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) {
    redirect(`/admin/clients/${clientProfileId}/documents/?error=${encodeURIComponent(uploadError.message)}`);
  }

  const { data: document } = await supabase.from("client_documents").insert({
    client_profile_id: clientProfileId,
    storage_path: path,
    label,
    uploaded_by: user.id,
  }).select("id, created_at").single();

  if (document?.id) {
    await upsertClientContentReceipts([
      {
        clientProfileId,
        contentKind: "document",
        contentId: document.id,
        releasedAt: document.created_at,
      },
    ]);
  }

  redirect(`/admin/clients/${clientProfileId}/documents/`);
}
