"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

function buildRecoveryRedirectUrl(path: string) {
  if (typeof window === "undefined") {
    return withBasePath(path);
  }

  return new URL(withBasePath(path), window.location.origin).toString();
}

export function PasswordRecoveryForm() {
  const router = useRouter();
  const configError = getSupabaseBrowserConfigError();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (configError) {
      setError(configError);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: buildRecoveryRedirectUrl("/auth/callback/?next=/portal/set-password/"),
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    router.push(withBasePath("/portal/check-email/?mode=recovery"));
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Client portal</p>
      <h1>Reset your password</h1>
      <p className="auth-description">Enter the email address you use for the portal and we will send you a secure password reset link.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        {configError ? <p className="form-error">{configError}</p> : null}
        {!configError && error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="button button-primary form-submit" disabled={loading || Boolean(configError)}>
          {loading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>
      <p className="auth-description">
        Remembered it? <Link href="/portal/login/">Back to sign in</Link>.
      </p>
    </div>
  );
}
