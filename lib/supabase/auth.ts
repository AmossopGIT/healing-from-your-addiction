import { redirect } from "next/navigation";
import type { UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/server";
import { isClientOnboardingComplete } from "@/lib/supabase/onboarding";

export type AuthProfile = {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  email: string | null;
};

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getAuthProfile(): Promise<AuthProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase.from("profiles").select("id, role, full_name, phone").eq("id", user.id).single();

  if (!profile) {
    return null;
  }

  return {
    ...profile,
    email: user.email ?? null,
  };
}

export async function requireAuthProfile(requiredRole?: UserRole) {
  const profile = await getAuthProfile();

  if (!profile) {
    redirect(requiredRole === "admin" ? "/admin/login/" : "/portal/login/");
  }

  if (requiredRole && profile.role !== requiredRole) {
    redirect(profile.role === "admin" ? "/admin/" : "/portal/");
  }

  return profile;
}

export async function getClientProfileForUser(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("client_profiles").select("*").eq("user_id", userId).maybeSingle();
  return data;
}

export async function getClientPortalState() {
  const profile = await requireAuthProfile("client");
  const clientProfile = await getClientProfileForUser(profile.id);

  return {
    profile,
    clientProfile,
    onboardingComplete: isClientOnboardingComplete(clientProfile),
  };
}

export async function requireClientPortalAccess(options?: { allowIncomplete?: boolean }) {
  const portalState = await getClientPortalState();

  if (!options?.allowIncomplete && !portalState.onboardingComplete) {
    redirect("/portal/onboarding/");
  }

  return portalState;
}
