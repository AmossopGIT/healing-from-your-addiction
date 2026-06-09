import type { User } from "@supabase/supabase-js";

export const PORTAL_SET_PASSWORD_PATH = "/portal/set-password/";

type PasswordSetupUser = Pick<User, "user_metadata" | "invited_at"> | null | undefined;

export function userNeedsPasswordSetup(user: PasswordSetupUser) {
  if (!user) return false;
  if (user.user_metadata?.needs_password_setup === true) return true;
  if (typeof user.invited_at === "string" && user.invited_at.length > 0) return true;
  return false;
}

export function resolveAuthCallbackNext(pathname: string, searchParams: URLSearchParams) {
  const explicitNext = searchParams.get("next")?.trim();
  if (explicitNext?.startsWith("/") && !explicitNext.startsWith("//")) {
    return explicitNext;
  }

  const otpType = searchParams.get("type");
  if (otpType === "invite" || otpType === "recovery") {
    return PORTAL_SET_PASSWORD_PATH;
  }
  if (otpType === "signup" || otpType === "email") {
    return "/portal/onboarding/";
  }
  if (pathname === PORTAL_SET_PASSWORD_PATH) {
    return PORTAL_SET_PASSWORD_PATH;
  }
  if (pathname === "/portal/login/") {
    // Misrouted invite links from Supabase often land here without a next param.
    return PORTAL_SET_PASSWORD_PATH;
  }
  return "/portal/";
}
