import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientContentReceipts, getClientEnrollmentBundle, getClientSessionReceiptMap } from "@/lib/dashboard/queries";
import { slotLabel } from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programme | Client Portal",
  description: "Your programme sessions.",
  path: "/portal/programme/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ scheduled?: string }>;
};

export default async function PortalProgrammePage({ searchParams }: PageProps) {
  const { scheduled } = await searchParams;
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

  if (!bundle.schedule) {
    redirect("/portal/programme/schedule/");
  }

  const progressBySession = new Map(bundle.progress.map((item) => [item.session_id, item]));
  const sessionReceiptMap = await getClientSessionReceiptMap(
    bundle.clientProfile.id,
    bundle.sessions.map((session) => session.id),
  );
  const docReceipts = await getClientContentReceipts(bundle.clientProfile.id, {
    contentKind: "programme_doc",
    contentIds: bundle.programmeDocs.map((doc) => doc.id),
  });
  const releasedDocIds = new Set(docReceipts.map((receipt) => receipt.content_id));
  const releasedDocs = bundle.programmeDocs.filter((doc) => releasedDocIds.has(doc.id));
  const completedCount = bundle.progress.filter((item) => item.status === "completed").length;
  const availableCount = bundle.progress.filter((item) => item.status !== "locked").length;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{bundle.template?.title}</h1>
        <p>
          {completedCount} of {availableCount} available sessions completed
          {bundle.pointsTotal > 0 ? ` · ${bundle.pointsTotal} practice points` : null}
        </p>
      </section>

      {scheduled ? (
        <p className="dashboard-inline-note dashboard-success-note">Your session schedule has been saved.</p>
      ) : null}

      <section className="dashboard-panel">
        <h2>Your slot</h2>
        <p>
          <strong>{slotLabel(bundle.schedule.weekday, bundle.schedule.time_slot)}</strong> ·{" "}
          {bundle.schedule.timezone}
        </p>
        <p>
          <a href={bundle.schedule.meet_url} target="_blank" rel="noreferrer" className="button button-secondary button-small">
            Open Google Meet
          </a>
        </p>
        <p className="dashboard-inline-note">
          Need to change this? Message Gerald — he can update your slot from the admin dashboard.
        </p>
      </section>

      {releasedDocs.length > 0 ? (
        <section className="dashboard-panel">
          <h2>Programme guides</h2>
          <ul className="dashboard-session-list">
            {releasedDocs.map((doc) => (
              <li key={doc.id} className="dashboard-session-item">
                <div>
                  <strong>{doc.title}</strong>
                  {doc.summary ? <p>{doc.summary}</p> : null}
                </div>
                <Link href={`/portal/programme/docs/${doc.slug}/`} className="button button-small button-secondary">
                  Open
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="dashboard-panel">
        <h2>Sessions</h2>
        <ul className="dashboard-session-list">
          {bundle.sessions.map((session) => {
            const progress = progressBySession.get(session.id);
            const receipt = sessionReceiptMap.get(session.id);
            const status = progress?.status ?? "locked";
            return (
              <li key={session.id} className="dashboard-session-item">
                <div>
                  <strong>{session.title}</strong>
                  <p>
                    Week {session.week_number} · Session {session.session_number} · {status}
                    {progress?.scheduled_at
                      ? ` · ${formatDashboardDate(progress.scheduled_at)}`
                      : null}
                    {progress?.duration_minutes ? ` · ${progress.duration_minutes} min` : null}
                  </p>
                  {receipt?.read_at ? (
                    <p className="dashboard-inline-note">Opened {formatDashboardDate(receipt.read_at)}</p>
                  ) : receipt ? (
                    <p className="dashboard-inline-note">New this month · unread</p>
                  ) : null}
                </div>
                {status !== "locked" ? (
                  <Link
                    href={`/portal/programme/session/${session.session_number}/`}
                    className="button button-small button-secondary"
                  >
                    Open
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
