"use server";

import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/supabase/audit";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function inviteClient(formData: FormData) {
  const leadId = String(formData.get("leadId") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim();
  const addictionSlug = String(formData.get("addictionSlug") ?? "").trim();
  const preferredContactMethod = String(formData.get("preferredContactMethod") ?? "").trim();

  if (!email || !fullName) redirect("/admin/clients/invite/?error=missing-fields");
  if (!isSupabaseServiceConfigured()) redirect("/admin/clients/invite/?error=supabase-not-configured");

  const supabase = await createClient();
  const { data: { user: adminUser } } = await supabase.auth.getUser();
  const service = createServiceClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: inviteData, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl.replace(/\/$/, "")}/auth/callback/?next=/portal/set-password/`,
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
    metadata: { email, leadId: leadId || null },
  });

  redirect(`/admin/clients/${clientProfile!.id}/`);
}
