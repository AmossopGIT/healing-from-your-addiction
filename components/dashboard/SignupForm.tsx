"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { buildAuthEmailRedirect } from "@/lib/supabase/redirectUrl";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

type SignupFormProps = {
  nextPath?: string;
};

function isSafePortalPath(path: string) {
  return path.startsWith("/portal/") && !path.startsWith("//");
}

function isReadinessResumePath(path: string) {
  return path.includes("/portal/readiness/");
}

export function SignupForm({ nextPath = "/portal/onboarding/" }: SignupFormProps) {
  const router = useRouter();
  const configError = getSupabaseBrowserConfigError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const safeNext = isSafePortalPath(nextPath) ? nextPath : "/portal/onboarding/";
  const readinessResume = isReadinessResumePath(safeNext);
  // Readiness can finish before full onboarding; keep that destination.
  const postAuthPath = readinessResume
    ? safeNext
    : safeNext.startsWith("/portal/onboarding")
      ? safeNext
      : "/portal/onboarding/";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        emailRedirectTo: buildAuthEmailRedirect(`/auth/callback/?next=${encodeURIComponent(postAuthPath)}`),
        data: readinessResume ? { readiness_resume_path: safeNext } : undefined,
      },
    });
    setLoading(false);

    if (signUpError) {
      setError(formatAuthError(signUpError.message));
      return;
    }

    if (typeof window !== "undefined" && readinessResume) {
      window.sessionStorage.setItem("hfya_post_onboarding_next", safeNext);
    }

    if (data.session) {
      router.push(withBasePath(postAuthPath));
      router.refresh();
      return;
    }

    router.push(withBasePath("/portal/check-email/?mode=signup"));
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Client portal</p>
      <h1>{readinessResume ? "Create account to see results" : "Create your account"}</h1>
      <p className="auth-description">
        {readinessResume
          ? "Quick free signup. Your readiness assessment saves to your private profile so you can view results."
          : "Sign up with your email, then verify your address before completing your private portal profile."}
      </p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
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
        {configError ? <p className="form-error">{configError}</p> : null}
        {!configError && error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="button button-primary form-submit" disabled={loading || Boolean(configError)}>
          {loading ? "Creating account..." : readinessResume ? "Create account & continue" : "Create account"}
        </button>
      </form>
      <p className="auth-description">
        Already have an account?{" "}
        <Link href={readinessResume ? `/portal/login/?next=${encodeURIComponent(safeNext)}` : "/portal/login/"}>Sign in</Link>.
      </p>
    </div>
  );
}
