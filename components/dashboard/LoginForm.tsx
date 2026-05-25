"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { createClient, getSupabaseBrowserConfigError } from "@/lib/supabase/client";

type LoginFormProps = {
  redirectTo: string;
  title: string;
  description: string;
  showClientLinks?: boolean;
  notice?: string | null;
};

export function LoginForm({ redirectTo, title, description, showClientLinks = false, notice = null }: LoginFormProps) {
  const router = useRouter();
  const configError = getSupabaseBrowserConfigError();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    router.push(withBasePath(redirectTo));
    router.refresh();
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Private access</p>
      <h1>{title}</h1>
      <p className="auth-description">{description}</p>
      {notice ? <p className="form-error">{notice}</p> : null}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {configError ? <p className="form-error">{configError}</p> : null}
        {!configError && error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="button button-primary form-submit" disabled={loading || Boolean(configError)}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
      {showClientLinks ? (
        <p className="auth-description">
          <Link href="/portal/sign-up/">Create an account</Link>
          {" · "}
          <Link href="/portal/forgot-password/">Forgot your password?</Link>
        </p>
      ) : null}
    </div>
  );
}
