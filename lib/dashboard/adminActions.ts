"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import type { LeadStatus } from "@/types/database";
import { logAuditEvent } from "@/lib/supabase/audit";

export async function updateLeadStatusForm(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "");
  const status = String(formData.get("status") ?? "") as LeadStatus;

  if (!leadId || !status) {
    redirect("/admin/leads/");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
  const leadId = String(formData.get("leadId") ?? "");
  const body = String(formData.get("body") ?? "").trim();

  if (!leadId || !body) {
    redirect(`/admin/leads/${leadId}/`);
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

  redirect(`/admin/leads/${leadId}/`);
}
