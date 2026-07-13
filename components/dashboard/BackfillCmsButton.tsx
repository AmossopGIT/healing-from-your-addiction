"use client";

import { useState } from "react";

export function BackfillCmsButton() {
  const [status, setStatus] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function runBackfill() {
    setIsRunning(true);
    setStatus(null);

    try {
      const response = await fetch("/api/admin/cms/backfill/", { method: "POST" });
      const payload = (await response.json()) as { error?: string; blogCount?: number; caseStudyCount?: number; message?: string };
      if (!response.ok) {
        setStatus(payload.error ?? "Backfill failed.");
        return;
      }
      setStatus(payload.message ?? `Backfilled ${payload.blogCount ?? 0} blog posts and ${payload.caseStudyCount ?? 0} case studies.`);
    } catch {
      setStatus("Backfill failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="dashboard-panel">
      <h2>Hard import from static files</h2>
      <p>
        Sync blog posts and case studies from the site&apos;s TypeScript content files into the CMS. Use this when drafts
        are missing after a deploy, or when you need to re-run the static → CMS import. Insert-missing mode preserves
        existing CMS rows.
      </p>
      <button type="button" className="button button-secondary" onClick={runBackfill} disabled={isRunning}>
        {isRunning ? "Running hard import…" : "Hard import static content"}
      </button>
      {status ? <p className="cms-inline-status">{status}</p> : null}
    </div>
  );
}
