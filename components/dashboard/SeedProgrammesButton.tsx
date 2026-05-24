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
        setMessage(`Created ${data.templatesCreated} templates and ${data.sessionsCreated} sessions.`);
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
        {loading ? "Seeding..." : "Seed templates from case studies"}
      </button>
      {message ? <p className="dashboard-inline-note">{message}</p> : null}
    </section>
  );
}
