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
  portal: "admin" | "client";
  showClientLinks?: boolean;
  notice?: string | null;
};

export function LoginForm({
  redirectTo,
  title,
  description,
  portal,
  showClientLinks = false,
  notice = null,
}: LoginFormProps) {
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
    const normalizedEmail = email.trim().toLowerCase();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError(signInError.message);
      return;
    }

    const userId = signInData.user?.id;
    if (!userId) {
      setLoading(false);
      setError("Sign-in succeeded but no user session was created. Please try again.");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();

    setLoading(false);

    if (profileError) {
      await supabase.auth.signOut();
      setError("Signed in, but your account profile could not be loaded. Please try again or contact support.");
      return;
    }

    if (portal === "admin") {
      if (profile?.role === "admin") {
        router.push(withBasePath("/admin/"));
        router.refresh();
        return;
      }

      await supabase.auth.signOut();
      setError(
        profile?.role === "client"
          ? "This email is for the client portal. Use the client sign-in page instead."
          : "This email is not set up for admin access.",
      );
      return;
    }

    if (profile?.role === "client") {
      router.push(withBasePath(redirectTo));
      router.refresh();
      return;
    }

    await supabase.auth.signOut();
    setError(
      profile?.role === "admin"
        ? "This email is for staff admin access. Use the admin sign-in page instead."
        : "This email is not set up for the client portal.",
    );
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
