"use server";

import { redirect } from "next/navigation";
import {
  dashboardFieldMaxLengths,
  normalizeSingleLine,
  sanitizeContactMethod,
  sanitizeOptionalPhone,
  sanitizeProgrammeSlug,
} from "@/lib/dashboard/formValidation";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { createClient } from "@/lib/supabase/server";
import { getClientProfileForUser } from "@/lib/supabase/auth";

export async function updateClientAccount(formData: FormData) {
  const rawPhone = String(formData.get("phone") ?? "");
  const rawPreferredContactMethod = String(formData.get("preferredContactMethod") ?? "");
  const emergencyContact = normalizeSingleLine(String(formData.get("emergencyContact") ?? ""));
  const phone = sanitizeOptionalPhone(rawPhone);
  const preferredContactMethod = sanitizeContactMethod(rawPreferredContactMethod);

  if (rawPhone.trim() && !phone) redirect("/portal/account/?error=invalid-phone");
  if (rawPreferredContactMethod.trim() && !preferredContactMethod) redirect("/portal/account/?error=invalid-contact-method");
  if (emergencyContact.length > dashboardFieldMaxLengths.emergencyContact) {
    redirect("/portal/account/?error=invalid-emergency-contact");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/login/");

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

export async function completePortalOnboarding(formData: FormData) {
  const fullName = normalizeSingleLine(String(formData.get("fullName") ?? ""));
  const rawPhone = String(formData.get("phone") ?? "");
  const rawPreferredContactMethod = String(formData.get("preferredContactMethod") ?? "");
  const rawAddictionSlug = String(formData.get("addictionSlug") ?? "");
  const emergencyContact = normalizeSingleLine(String(formData.get("emergencyContact") ?? ""));
  const phone = sanitizeOptionalPhone(rawPhone);
  const preferredContactMethod = sanitizeContactMethod(rawPreferredContactMethod);
  const addictionSlug = sanitizeProgrammeSlug(rawAddictionSlug);

  if (fullName.length < 2 || fullName.length > leadFieldMaxLengths.fullName) {
    redirect("/portal/onboarding/?error=invalid-name");
  }
  if (!phone) {
    redirect("/portal/onboarding/?error=invalid-phone");
  }
  if (!preferredContactMethod) {
    redirect("/portal/onboarding/?error=invalid-contact-method");
  }
  if (!addictionSlug) {
    redirect("/portal/onboarding/?error=invalid-programme");
  }
  if (emergencyContact.length > dashboardFieldMaxLengths.emergencyContact) {
    redirect("/portal/onboarding/?error=invalid-emergency-contact");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login/");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "client") redirect("/portal/login/");

  const { error: profileError } = await supabase.from("profiles").update({
    full_name: fullName,
    phone,
  }).eq("id", user.id);
  if (profileError) {
    redirect("/portal/onboarding/?error=save-failed");
  }

  const clientProfile = await getClientProfileForUser(user.id);
  const onboardingCompletedAt = new Date().toISOString();

  if (clientProfile) {
    const { error: clientError } = await supabase.from("client_profiles").update({
      addiction_slug: addictionSlug,
      preferred_contact_method: preferredContactMethod,
      emergency_contact: emergencyContact || null,
      onboarding_completed_at: onboardingCompletedAt,
    }).eq("id", clientProfile.id);
    if (clientError) {
      redirect("/portal/onboarding/?error=save-failed");
    }
  } else {
    const { error: clientError } = await supabase.from("client_profiles").insert({
      user_id: user.id,
      addiction_slug: addictionSlug,
      preferred_contact_method: preferredContactMethod,
      emergency_contact: emergencyContact || null,
      onboarding_completed_at: onboardingCompletedAt,
    });
    if (clientError) {
      redirect("/portal/onboarding/?error=save-failed");
    }
  }

  redirect("/portal/?onboarded=1");
}
