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
        setMessage(
          `Published ${data.templatesUpserted ?? data.templatesCreated ?? 0} interactive programmes` +
            (data.homeworkUpserted ? ` · ${data.homeworkUpserted} homework tasks` : "") +
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
    <section className="dashboard-panel">
      <button type="button" className="button button-secondary" onClick={handleSeed} disabled={loading}>
        {loading ? "Publishing..." : "Publish / refresh interactive programmes"}
      </button>
      <p className="dashboard-inline-note">
        Loads all 23 structured journeys into programme templates with immutable content snapshots for new enrollments.
      </p>
      {message ? <p className="dashboard-inline-note">{message}</p> : null}
    </section>
  );
}
