"use client";

import { useState } from "react";

export function SeedProgrammesButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSeed() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/programmes/seed/", { method: "POST" });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.error ?? "Seed failed");
      } else {
        const programmes = data.templatesUpserted ?? data.templatesCreated ?? 0;
        const docs = data.docsCreated ?? 0;
        setMessage(
          `Published ${programmes} interactive programmes` +
            (docs ? ` · ${docs} guides` : "") +
            (data.homeworkUpserted || data.homeworkCreated
              ? ` · ${data.homeworkUpserted ?? data.homeworkCreated} homework tasks`
              : "") +
            (data.sessionsCreated ? ` · ${data.sessionsCreated} legacy sessions` : "") +
            ".",
        );
        window.location.reload();
      }
    } catch {
      setMessage("Seed request failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-programme-seed">
      <button type="button" className="button button-secondary" onClick={handleSeed} disabled={loading}>
        {loading ? "Publishing…" : "Publish / refresh programmes & guides"}
      </button>
      <p className="dashboard-inline-note">
        Loads all 23 journeys into templates and upserts the 3-guide pack (overview, Week 1, daily practice) for each.
      </p>
      {message ? <p className="dashboard-inline-note">{message}</p> : null}
    </div>
  );
}
