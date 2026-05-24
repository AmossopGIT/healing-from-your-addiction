import type { Metadata } from "next";
import Link from "next/link";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programme | Client Portal",
  description: "Your programme sessions.",
  path: "/portal/programme/",
  noIndex: true,
});

export default async function PortalProgrammePage() {
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;

  if (!bundle?.enrollment) {
    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <h1>Your programme</h1>
          <p className="dashboard-empty">Your programme has not been assigned yet.</p>
        </section>
      </div>
    );
  }

  const progressBySession = new Map(bundle.progress.map((item) => [item.session_id, item]));
  const completedCount = bundle.progress.filter((item) => item.status === "completed").length;
  const availableCount = bundle.progress.filter((item) => item.status !== "locked").length;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{bundle.template?.title}</h1>
        <p>{completedCount} of {availableCount} available sessions completed</p>
      </section>
      <section className="dashboard-panel">
        <ul className="dashboard-session-list">
          {bundle.sessions.map((session) => {
            const progress = progressBySession.get(session.id);
            const status = progress?.status ?? "locked";
            return (
              <li key={session.id} className="dashboard-session-item">
                <div>
                  <strong>{session.title}</strong>
                  <p>Week {session.week_number} · Session {session.session_number} · {status}</p>
                </div>
                {status !== "locked" ? (
                  <Link href={`/portal/programme/session/${session.session_number}/`} className="button button-small button-secondary">Open</Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
