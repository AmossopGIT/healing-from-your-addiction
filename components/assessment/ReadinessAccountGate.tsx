"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import {
  claimReadinessDraft,
  saveReadinessAssessment,
} from "@/lib/dashboard/readinessAssessmentActions";
import type { ReadinessResponses } from "@/content/readinessAssessment";
import { buildAuthEmailRedirect } from "@/lib/supabase/redirectUrl";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

type AuthMode = "signup" | "signin";

type ReadinessAccountGateProps = {
  draftToken: string;
  responses: ReadinessResponses;
  resumePath: string;
};

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    String((error as { digest: string }).digest).startsWith("NEXT_REDIRECT")
  );
}

export function ReadinessAccountGate({ draftToken, responses, resumePath }: ReadinessAccountGateProps) {
  const router = useRouter();
  const configError = getSupabaseBrowserConfigError();
  const [mode, setMode] = useState<AuthMode>("signup");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [loading, setLoading] = useState(false);

  async function finishAfterAuth() {
    const formData = new FormData();
    formData.set("redirectTo", "/portal/readiness/");
    try {
      if (draftToken) {
        formData.set("draftToken", draftToken);
        await claimReadinessDraft(formData);
      } else {
        formData.set("action", "submit");
        formData.set("responsesJson", JSON.stringify(responses));
        await saveReadinessAssessment(formData);
      }
    } catch (error) {
      if (isNextRedirectError(error)) throw error;
      setError("Signed in, but we could not save your assessment yet. Opening your portal…");
      router.push(withBasePath(resumePath));
      router.refresh();
    }
  }

  async function ensureClientRole(userId: string) {
    const supabase = createClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return { error: "Signed in, but your account profile could not be loaded. Please try again." };
    }

    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      return {
        error:
          "This email is for staff admin access. Sign out of admin and use a client email, or create a free client account.",
      };
    }

    if (profile?.role !== "client") {
      await supabase.auth.signOut();
      return { error: "This email is not set up for the client portal." };
    }

    return { ok: true as const };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (configError) {
      setError(configError);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          emailRedirectTo: buildAuthEmailRedirect(`/auth/callback/?next=${encodeURIComponent(resumePath)}`),
          data: {
            full_name: fullName.trim() || undefined,
            readiness_resume_path: resumePath,
          },
        },
      });

      if (signUpError) {
        setLoading(false);
        const message = formatAuthError(signUpError.message);
        if (/already|registered|exists/i.test(signUpError.message)) {
          setError("That email already has an account. Switch to Sign in below.");
          setMode("signin");
        } else {
          setError(message);
        }
        return;
      }

      if (!data.session || !data.user) {
        setLoading(false);
        setCheckEmail(true);
        return;
      }

      const roleCheck = await ensureClientRole(data.user.id);
      if ("error" in roleCheck) {
        setLoading(false);
        setError(roleCheck.error ?? "Unable to continue with this account.");
        return;
      }

      try {
        await finishAfterAuth();
      } catch (error) {
        if (isNextRedirectError(error)) {
          router.push(withBasePath("/portal/readiness/?completed=1"));
          router.refresh();
          return;
        }
        setLoading(false);
      }
      return;
    }

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(formatAuthError(signInError.message));
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setLoading(false);
      setError("Sign-in succeeded but no session was created. Please try again.");
      return;
    }

    const roleCheck = await ensureClientRole(userId);
    if ("error" in roleCheck) {
      setLoading(false);
      setError(roleCheck.error ?? "Unable to continue with this account.");
      return;
    }

    try {
      await finishAfterAuth();
    } catch (error) {
      if (isNextRedirectError(error)) {
        router.push(withBasePath("/portal/readiness/?completed=1"));
        router.refresh();
        return;
      }
      setLoading(false);
    }
  }

  if (checkEmail) {
    return (
      <div className="readiness-account-gate">
        <p className="eyebrow">Check your email</p>
        <h2>Confirm your address to see results</h2>
        <p className="need-help-wizard-lead">
          We sent a verification link to <strong>{email.trim().toLowerCase()}</strong>. Open it on this or another
          device — your assessment draft is saved so results can unlock after confirmation.
        </p>
        <p className="need-help-wizard-hint">
          After verifying, you&apos;ll return to your private readiness results. Already verified?{" "}
          <button type="button" className="text-button" onClick={() => setCheckEmail(false)}>
            Sign in here
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="readiness-account-gate">
      <div className="readiness-auth-tabs" role="tablist" aria-label="Account options">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          className={mode === "signup" ? "is-active" : undefined}
          onClick={() => {
            setMode("signup");
            setError(null);
          }}
        >
          Create account
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signin"}
          className={mode === "signin" ? "is-active" : undefined}
          onClick={() => {
            setMode("signin");
            setError(null);
          }}
        >
          Sign in
        </button>
      </div>

      <p className="need-help-wizard-lead">
        {mode === "signup"
          ? "Quick free signup — then your results save to your private profile."
          : "Already have a portal login? Sign in to save this assessment and view your results."}
      </p>

      <form className="auth-form readiness-auth-form" onSubmit={(event) => void handleSubmit(event)}>
        {mode === "signup" ? (
          <label className="form-field">
            <span>First name (optional)</span>
            <input
              type="text"
              autoComplete="given-name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              maxLength={80}
            />
          </label>
        ) : null}
        <label className="form-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {mode === "signup" ? (
          <label className="form-field">
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        ) : null}

        {configError ? <p className="form-error">{configError}</p> : null}
        {!configError && error ? <p className="form-error">{error}</p> : null}

        <button type="submit" className="button button-primary form-submit" disabled={loading || Boolean(configError)}>
          {loading
            ? mode === "signup"
              ? "Creating account…"
              : "Signing in…"
            : mode === "signup"
              ? "Create account & see results"
              : "Sign in & see results"}
        </button>
      </form>

      {mode === "signin" ? (
        <p className="need-help-wizard-hint">
          <Link href="/portal/forgot-password/">Forgot password?</Link>
        </p>
      ) : null}
    </div>
  );
}
