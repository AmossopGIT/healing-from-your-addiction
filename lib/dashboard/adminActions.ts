"use server";

import { dashboardFieldMaxLengths, normalizeMultiline, normalizeSingleLine, sanitizeLeadStatus, sanitizeUuid } from "@/lib/dashboard/formValidation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/supabase/audit";

export async function updateLeadStatusForm(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  const status = sanitizeLeadStatus(String(formData.get("status") ?? ""));

  if (!leadId || !status) {
    redirect("/admin/leads/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/admin/login/");
  }

  const { error } = await supabase.from("leads").update({ status }).eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    userId: user?.id,
    action: "lead_status_update",
    resourceType: "lead",
    resourceId: leadId,
    metadata: { status },
  });

  redirect(`/admin/leads/${leadId}/`);
}

export async function addLeadNote(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  const body = normalizeMultiline(String(formData.get("body") ?? ""));
  const redirectTo = leadId ? `/admin/leads/${leadId}/` : "/admin/leads/";

  if (!leadId || !body || body.length > dashboardFieldMaxLengths.noteBody) {
    redirect(redirectTo);
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login/");
  }

  await supabase.from("lead_notes").insert({
    lead_id: leadId,
    author_id: user.id,
    body,
  });

  await logAuditEvent({
    userId: user.id,
    action: "lead_note_create",
    resourceType: "lead",
    resourceId: leadId,
  });

  redirect(redirectTo);
}

function sanitizeOptionalDatetime(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return null;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

export async function updateLeadFollowUpForm(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  if (!leadId) {
    redirect("/admin/leads/");
  }

  const firstResponseTemplateId = normalizeSingleLine(String(formData.get("firstResponseTemplateId") ?? "")).slice(0, 80) || null;
  const followUpDueAt = sanitizeOptionalDatetime(String(formData.get("followUpDueAt") ?? ""));
  const firstResponseSentAt = sanitizeOptionalDatetime(String(formData.get("firstResponseSentAt") ?? ""));
  const assignedAdminNotes = normalizeMultiline(String(formData.get("assignedAdminNotes") ?? "")).slice(0, 1000) || null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login/");
  }

  const { error } = await supabase
    .from("leads")
    .update({
      first_response_template_id: firstResponseTemplateId,
      follow_up_due_at: followUpDueAt,
      first_response_sent_at: firstResponseSentAt,
      assigned_admin_notes: assignedAdminNotes,
    })
    .eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    userId: user.id,
    action: "lead_follow_up_update",
    resourceType: "lead",
    resourceId: leadId,
    metadata: { firstResponseTemplateId, followUpDueAt, firstResponseSentAt },
  });

  redirect(`/admin/leads/${leadId}/`);
}
