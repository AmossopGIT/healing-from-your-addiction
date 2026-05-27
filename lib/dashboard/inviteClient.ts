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
import { getAuthEmailOrigin } from "@/lib/supabase/redirectUrl";
import { createClient } from "@/lib/supabase/server";

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

  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  if (!adminUser) redirect("/admin/login/");
  const service = createServiceClient();
  const siteUrl = getAuthEmailOrigin();

  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/portal/set-password/`,
    data: { role: "client", full_name: fullName },
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
    })
    .select("id")
    .single();

  if (profileError) redirect(`/admin/clients/invite/?error=${encodeURIComponent(profileError.message)}`);

  if (leadId) {
    await service.from("leads").update({ status: "enrolled", client_id: inviteData.user.id }).eq("id", leadId);
  }

  await logAuditEvent({
    userId: adminUser?.id,
    action: "client_invite",
    resourceType: "client_profile",
    resourceId: clientProfile!.id,
    metadata: { email, leadId: leadId || null, handoffSummary: handoffSummary || null },
  });

  redirect(`/admin/clients/${clientProfile!.id}/`);
}
