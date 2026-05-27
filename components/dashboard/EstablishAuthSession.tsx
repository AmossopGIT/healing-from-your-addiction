"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { withBasePath } from "@/lib/basePath";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

type EstablishAuthSessionProps = {
  children: ReactNode;
  /** Where to send the user after a successful code exchange (path only). */
  successPath?: string;
};

type SessionState = "loading" | "ready" | "error";

/**
 * Completes Supabase email-link auth (?code=, token_hash, or hash tokens) in the browser
 * before rendering protected auth UI (for example set-password).
 */
export function EstablishAuthSession({ children, successPath }: EstablishAuthSessionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const configError = getSupabaseBrowserConfigError();
  const [state, setState] = useState<SessionState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (configError) {
      setErrorMessage(configError);
      setState("error");
      return;
    }

    let cancelled = false;

    async function establishSession() {
      const supabase = createClient();
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const otpType = searchParams.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          setErrorMessage(
            "This reset link is invalid or has already been used. Request a new link and open it once in the same browser.",
          );
          setState("error");
          return;
        }

        const target = successPath ?? window.location.pathname;
        router.replace(withBasePath(target));
        router.refresh();
        setState("ready");
        return;
      }

      if (tokenHash && otpType) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType as "recovery" | "signup" | "invite" | "email",
        });
        if (cancelled) return;

        if (error) {
          setErrorMessage(
            "This reset link is invalid or has already been used. Request a new link and open it once in the same browser.",
          );
          setState("error");
          return;
        }

        const target = successPath ?? window.location.pathname;
        router.replace(withBasePath(target));
        router.refresh();
        setState("ready");
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;

      if (session) {
        setState("ready");
        return;
      }

      setErrorMessage("Your secure sign-in session was not found. Request a new password reset link.");
      setState("error");
    }

    void establishSession();

    return () => {
      cancelled = true;
    };
  }, [configError, router, searchParams, successPath]);

  if (state === "loading") {
    return (
      <div className="auth-card">
        <p className="eyebrow">Client portal</p>
        <h1>Verifying your link</h1>
        <p className="auth-description">Please wait while we confirm your secure sign-in link.</p>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="auth-card">
        <p className="eyebrow">Client portal</p>
        <h1>Link could not be verified</h1>
        <p className="form-error">{errorMessage}</p>
        <p className="auth-description">
          <Link href="/portal/forgot-password/">Request a new reset link</Link>
          {" · "}
          <Link href="/portal/login/">Back to sign in</Link>
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
