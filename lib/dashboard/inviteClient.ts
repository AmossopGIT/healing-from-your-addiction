"use server";

import { redirect } from "next/navigation";
import {
  sanitizeContactMethod,
  sanitizeEmail,
  sanitizeProgrammeSlug,
  sanitizeUuid,
  normalizeSingleLine,
} from "@/lib/dashboard/formValidation";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { logAuditEvent } from "@/lib/supabase/audit";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { buildAuthEmailRedirect } from "@/lib/supabase/redirectUrl";
import { requireAuthProfile } from "@/lib/supabase/auth";

export async function inviteClient(formData: FormData) {
  const leadId = sanitizeUuid(String(formData.get("leadId") ?? ""));
  const email = sanitizeEmail(String(formData.get("email") ?? ""));
  const fullName = normalizeSingleLine(String(formData.get("fullName") ?? ""));
  const rawAddictionSlug = String(formData.get("addictionSlug") ?? "");
  const addictionSlug = sanitizeProgrammeSlug(rawAddictionSlug);
  const rawPreferredContactMethod = String(formData.get("preferredContactMethod") ?? "");
  const preferredContactMethod = sanitizeContactMethod(rawPreferredContactMethod);
  const handoffSummary = normalizeSingleLine(String(formData.get("handoffSummary") ?? "")).slice(0, 500);

  if (!email || !fullName) redirect("/admin/clients/invite/?error=missing-fields");
  if (fullName.length < 2 || fullName.length > leadFieldMaxLengths.fullName) {
    redirect("/admin/clients/invite/?error=invalid-name");
  }
  if (rawAddictionSlug.trim() && !addictionSlug) redirect("/admin/clients/invite/?error=invalid-programme");
  if (rawPreferredContactMethod.trim() && !preferredContactMethod) {
    redirect("/admin/clients/invite/?error=invalid-contact-method");
  }
  if (!isSupabaseServiceConfigured()) redirect("/admin/clients/invite/?error=supabase-not-configured");

  const adminUser = await requireAuthProfile("admin");
  const service = createServiceClient();

  if (leadId) {
    const { data: lead, error: leadError } = await service
      .from("leads")
      .select("id, client_id")
      .eq("id", leadId)
      .maybeSingle();

    if (leadError || !lead) redirect("/admin/clients/invite/?error=lead-not-found");
    if (lead.client_id) redirect("/admin/clients/invite/?error=already-enrolled");
  }

  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: buildAuthEmailRedirect("/portal/set-password/"),
    data: { role: "client", full_name: fullName, needs_password_setup: true },
  });

  if (inviteError || !inviteData.user) {
    redirect(`/admin/clients/invite/?error=${encodeURIComponent(inviteError?.message ?? "invite-failed")}`);
  }

  const { data: clientProfile, error: profileError } = await service
    .from("client_profiles")
    .insert({
      user_id: inviteData.user.id,
      lead_id: leadId || null,
      addiction_slug: addictionSlug || null,
      preferred_contact_method: preferredContactMethod || null,
      invitation_status: "pending",
      invited_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (profileError) {
    await service.auth.admin.deleteUser(inviteData.user.id);
    redirect(`/admin/clients/invite/?error=${encodeURIComponent(profileError.message)}`);
  }

  if (leadId) {
    const { error: leadUpdateError } = await service
      .from("leads")
      .update({ status: "enrolled", client_id: inviteData.user.id })
      .eq("id", leadId)
      .is("client_id", null);

    if (leadUpdateError) {
      await service.from("client_profiles").delete().eq("id", clientProfile.id);
      await service.auth.admin.deleteUser(inviteData.user.id);
      redirect(`/admin/clients/invite/?error=${encodeURIComponent(leadUpdateError.message)}`);
    }
  }

  await logAuditEvent({
    userId: adminUser.id,
    action: "client_invite",
    resourceType: "client_profile",
    resourceId: clientProfile!.id,
    metadata: { email, leadId: leadId || null, handoffSummary: handoffSummary || null },
  });

  redirect(`/admin/clients/${clientProfile!.id}/`);
}
