"use client";

import { useEffect } from "react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <main className="admin-error-shell">
      <div className="admin-error-card">
        <p className="eyebrow">Admin</p>
        <h1>This page couldn’t load</h1>
        <p>A server error occurred in the admin area. Reload to try again.</p>
        {error.digest ? (
          <p className="admin-error-digest">
            Reference: <code>{error.digest}</code>
          </p>
        ) : null}
        <button type="button" className="button button-primary" onClick={reset}>
          Reload
        </button>
      </div>
    </main>
  );
}
