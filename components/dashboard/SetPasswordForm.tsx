"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { withBasePath } from "@/lib/basePath";
import { createClient } from "@/lib/supabase/client";

export function SetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(withBasePath("/portal/"));
    router.refresh();
  }

  return (
    <div className="auth-card">
      <p className="eyebrow">Client portal</p>
      <h1>Set your password</h1>
      <p className="auth-description">Choose a secure password for your private portal access.</p>
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="form-field">
          <span>New password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label className="form-field">
          <span>Confirm password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit" className="button button-primary form-submit" disabled={loading}>
          {loading ? "Saving..." : "Save password"}
        </button>
      </form>
    </div>
  );
}
