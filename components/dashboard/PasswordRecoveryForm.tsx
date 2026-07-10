"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { formatAuthError } from "@/lib/auth/formatAuthError";
import { buildAuthEmailRedirect } from "@/lib/supabase/redirectUrl";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

const recoveryCooldownKey = "hfya-portal-recovery-cooldown-until";
const recoveryCooldownMs = 60_000;

type PasswordRecoveryFormProps = {
  portal?: "admin" | "client";
};

export function PasswordRecoveryForm({ portal = "client" }: PasswordRecoveryFormProps) {
  const router = useRouter();
  const configError = getSupabaseBrowserConfigError();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isAdmin = portal === "admin";
  const loginPath = isAdmin ? "/admin/login/" : "/portal/login/";
  const checkEmailPath = isAdmin
    ? "/portal/check-email/?mode=recovery&portal=admin"
    : "/portal/check-email/?mode=recovery";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (configError) {
      setError(configError);
      return;
    }

    const cooldownUntil = Number(sessionStorage.getItem(recoveryCooldownKey) ?? "0");
    if (cooldownUntil > Date.now()) {
      const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
      setError(`Please wait ${secondsLeft} seconds before requesting another reset link.`);
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: buildAuthEmailRedirect("/portal/set-password/"),
    });

    setLoading(false);

    if (resetError) {
      setError(formatAuthError(resetError.message));
      return;
    }

    sessionStorage.setItem(recoveryCooldownKey, String(Date.now() + recoveryCooldownMs));
    router.push(withBasePath(checkEmailPath));
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">{isAdmin ? "Private access" : "Client portal"}</p>
      <h1>Reset your password</h1>
      <p className="auth-description">
        {isAdmin
          ? "Enter your admin email and we will send you a secure password reset link."
          : "Enter the email address you use for the portal and we will send you a secure password reset link."}
      </p>
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
        Remembered it? <Link href={loginPath}>Back to sign in</Link>.
      </p>
    </div>
  );
}
