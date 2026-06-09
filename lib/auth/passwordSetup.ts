import type { User } from "@supabase/supabase-js";

export const PORTAL_SET_PASSWORD_PATH = "/portal/set-password/";

type PasswordSetupUser = Pick<User, "user_metadata"> | null | undefined;

export function userNeedsPasswordSetup(user: PasswordSetupUser) {
  // Only the explicit flag counts. invited_at stays on the account forever after an invite.
  return user?.user_metadata?.needs_password_setup === true;
}

export function clearPasswordSetupFlag(metadata: Record<string, unknown> | undefined) {
  return {
    ...metadata,
    needs_password_setup: false,
  };
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
