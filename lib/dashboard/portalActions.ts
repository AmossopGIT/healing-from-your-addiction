"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getClientProfileForUser } from "@/lib/supabase/auth";

export async function updateClientAccount(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const preferredContactMethod = String(formData.get("preferredContactMethod") ?? "").trim();
  const emergencyContact = String(formData.get("emergencyContact") ?? "").trim();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");

  await supabase.from("profiles").update({ phone: phone || null }).eq("id", user.id);

  const clientProfile = await getClientProfileForUser(user.id);
  if (clientProfile) {
    await supabase.from("client_profiles").update({
      preferred_contact_method: preferredContactMethod || null,
      emergency_contact: emergencyContact || null,
    }).eq("id", clientProfile.id);
  }

  redirect("/portal/account/?saved=1");
}
