"use server";

import { dashboardFieldMaxLengths, normalizeMultiline, sanitizeLeadStatus, sanitizeUuid } from "@/lib/dashboard/formValidation";
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
