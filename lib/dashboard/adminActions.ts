"use server";

import { parseDatetimeLocalInput } from "@/lib/dashboard/leadSla";
import { dashboardFieldMaxLengths, normalizeMultiline, normalizeSingleLine, sanitizeLeadStatus, sanitizeRedirectPath, sanitizeUuid } from "@/lib/dashboard/formValidation";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/supabase/audit";
import { requireAuthProfile } from "@/lib/supabase/auth";
import type { ClientProfile } from "@/types/database";

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

  if (status === "enrolled") {
    const { data: lead } = await supabase.from("leads").select("client_id").eq("id", leadId).maybeSingle();
    if (!lead?.client_id) {
      redirect(`/admin/leads/${leadId}/?error=invite-required`);
    }
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

function sanitizeOptionalUuid(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized || normalized === "none") return null;
  return sanitizeUuid(normalized) || null;
}

function resolveLeadRedirect(formData: FormData, leadId: string) {
  return sanitizeRedirectPath(String(formData.get("redirectTo") ?? ""), ["/admin/leads"], `/admin/leads/${leadId}/`);
}

export async function updateLeadFollowUpForm(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  if (!leadId) {
    redirect("/admin/leads/");
  }

  const firstResponseTemplateId = normalizeSingleLine(String(formData.get("firstResponseTemplateId") ?? "")).slice(0, 80) || null;
  const followUpDueAt = parseDatetimeLocalInput(String(formData.get("followUpDueAt") ?? ""));
  const firstResponseSentAt = parseDatetimeLocalInput(String(formData.get("firstResponseSentAt") ?? ""));
  const assignedAdminNotes = normalizeMultiline(String(formData.get("assignedAdminNotes") ?? "")).slice(0, 1000) || null;
  const assignedAdminId = sanitizeOptionalUuid(String(formData.get("assignedAdminId") ?? ""));
  const redirectTo = resolveLeadRedirect(formData, leadId);

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
      assigned_admin_id: assignedAdminId,
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
    metadata: { firstResponseTemplateId, followUpDueAt, firstResponseSentAt, assignedAdminId },
  });

  redirect(redirectTo);
}

/** Partial updates from the leads list or Assign to me — does not wipe other follow-up fields. */
export async function updateLeadQuickActionForm(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  if (!leadId) {
    redirect("/admin/leads/");
  }

  const redirectTo = resolveLeadRedirect(formData, leadId);
  const assignToMe = String(formData.get("assignToMe") ?? "") === "1";
  const hasFollowUpDue = formData.has("followUpDueAt");
  const followUpDueAt = hasFollowUpDue ? parseDatetimeLocalInput(String(formData.get("followUpDueAt") ?? "")) : undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login/");
  }

  const updates: {
    assigned_admin_id?: string;
    follow_up_due_at?: string | null;
  } = {};

  if (assignToMe) {
    updates.assigned_admin_id = user.id;
  }
  if (hasFollowUpDue) {
    updates.follow_up_due_at = followUpDueAt ?? null;
  }

  if (!Object.keys(updates).length) {
    redirect(redirectTo);
  }

  const { error } = await supabase.from("leads").update(updates).eq("id", leadId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    userId: user.id,
    action: "lead_quick_action",
    resourceType: "lead",
    resourceId: leadId,
    metadata: updates,
  });

  redirect(redirectTo);
}

const paymentStatuses = new Set([
  "awaiting_quote",
  "invoice_sent",
  "paid",
  "payment_plan",
  "on_hold",
  "not_applicable",
]);

export async function updateClientOperations(formData: FormData) {
  const clientProfileId = sanitizeUuid(String(formData.get("clientProfileId") ?? ""));
  const paymentStatus = normalizeSingleLine(String(formData.get("paymentStatus") ?? ""));

  if (!clientProfileId || !paymentStatuses.has(paymentStatus)) {
    redirect(clientProfileId ? `/admin/clients/${clientProfileId}/?error=invalid-operations` : "/admin/clients/");
  }

  const admin = await requireAuthProfile("admin");
  const supabase = await createClient();
  const { error } = await supabase
    .from("client_profiles")
    .update({ payment_status: paymentStatus as ClientProfile["payment_status"] })
    .eq("id", clientProfileId);

  if (error) {
    redirect(`/admin/clients/${clientProfileId}/?error=operations-save-failed`);
  }

  await logAuditEvent({
    userId: admin.id,
    action: "client_operations_update",
    resourceType: "client_profile",
    resourceId: clientProfileId,
    metadata: { paymentStatus },
  });

  redirect(`/admin/clients/${clientProfileId}/?saved=operations`);
}
