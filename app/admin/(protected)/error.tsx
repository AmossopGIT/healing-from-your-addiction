"use client";

import { useEffect } from "react";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminProtectedError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("Admin workspace error:", error);
  }, [error]);

  return (
    <div className="dashboard-stack admin-error-page">
      <section className="dashboard-page-header">
        <p className="eyebrow">Admin workspace</p>
        <h1>This page couldn’t load</h1>
        <p>Something went wrong while loading this admin view. You can reload and try again.</p>
      </section>
      <section className="dashboard-panel">
        <p className="dashboard-inline-note">
          If this keeps happening, share the error reference below with your developer.
        </p>
        {error.digest ? (
          <p className="admin-error-digest">
            <span>Error reference:</span> <code>{error.digest}</code>
          </p>
        ) : null}
        {process.env.NODE_ENV !== "production" && error.message ? (
          <pre className="admin-error-detail">{error.message}</pre>
        ) : null}
        <div className="consultation-admin-actions">
          <button type="button" className="button button-primary" onClick={reset}>
            Reload
          </button>
          <a className="button button-secondary" href="/admin/">
            Back to overview
          </a>
        </div>
      </section>
    </div>
  );
}
