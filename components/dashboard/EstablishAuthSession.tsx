"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { parseAuthLinkParams } from "@/lib/auth/parseAuthLinkParams";
import { withBasePath } from "@/lib/basePath";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

async function waitForImplicitHashSession(supabase: SupabaseClient<Database>, timeoutMs = 4000) {
  const {
    data: { session: initialSession },
  } = await supabase.auth.getSession();
  if (initialSession) {
    return true;
  }

  if (typeof window === "undefined" || !window.location.hash.includes("access_token")) {
    return false;
  }

  return new Promise<boolean>((resolve) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session && (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN" || event === "INITIAL_SESSION")) {
        window.clearTimeout(timeout);
        subscription.unsubscribe();
        resolve(true);
      }
    });

    const timeout = window.setTimeout(() => {
      subscription.unsubscribe();
      resolve(false);
    }, timeoutMs);
  });
}

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
      const { code, tokenHash, otpType, hasHashAccessToken, hashType } = parseAuthLinkParams(searchParams);

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;

        if (error) {
          const recoveredViaHash = await waitForImplicitHashSession(supabase);
          if (cancelled) return;
          if (!recoveredViaHash) {
            setErrorMessage(
              "This reset link is invalid or has already been used. Request a new link and open it once in the same browser.",
            );
            setState("error");
            return;
          }
        } else {
          const target = successPath ?? window.location.pathname;
          router.replace(withBasePath(target));
          router.refresh();
          setState("ready");
          return;
        }
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

      const hashSessionReady = await waitForImplicitHashSession(supabase);
      if (cancelled) return;
      if (hashSessionReady) {
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
