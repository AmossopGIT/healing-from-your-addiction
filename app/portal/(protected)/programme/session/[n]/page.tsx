import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReadOnView } from "@/components/dashboard/ReadOnView";
import { SessionContent } from "@/components/dashboard/SessionContent";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { markSessionProgress } from "@/lib/dashboard/programmeActions";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { formatSessionDateTime, relativeSessionLabel } from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { n } = await params;
  return createMetadata({
    title: `Session ${n} | Client Portal`,
    description: "Programme session.",
    path: `/portal/programme/session/${n}/`,
    noIndex: true,
  });
}

export default async function PortalSessionPage({ params }: PageProps) {
  const { n } = await params;
  const sessionNumber = Number(n);
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;
  const session = bundle?.sessions.find((item) => item.session_number === sessionNumber);
  const progress = session ? bundle?.progress.find((item) => item.session_id === session.id) : null;

  if (!bundle || !session || !progress || progress.status === "locked") {
    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <p className="eyebrow">Programme</p>
          <h1>Not available yet</h1>
        </section>
        <section className="dashboard-panel">
          <p className="dashboard-empty">
            This session unlocks closer to its date, or once Gerald releases it after your live session.
          </p>
          <Link href="/portal/programme/" className="button button-secondary">
            Back to my calendar
          </Link>
        </section>
      </div>
    );
  }

  if (!bundle.schedule) {
    redirect("/portal/programme/schedule/");
  }

  return (
    <div className="dashboard-stack">
      <ReadOnView endpoint="/api/portal/content/read/" payload={{ contentId: session.id, contentKind: "session" }} />
      <section className="dashboard-page-header">
        <p className="eyebrow">
          Week {session.week_number} · Session {session.session_number}
        </p>
        <h1>{session.title}</h1>
        {progress.scheduled_at ? (
          <p className="dashboard-inline-note">
            {relativeSessionLabel(progress.scheduled_at)} · {formatSessionDateTime(progress.scheduled_at)}
            {progress.duration_minutes ? ` · ${progress.duration_minutes} minutes` : ""}
          </p>
        ) : null}
      </section>

      {bundle.schedule?.meet_url || progress.recording_url ? (
        <section className="dashboard-panel programme-session-actions">
          {bundle.schedule?.meet_url ? (
            <a
              href={bundle.schedule.meet_url}
              target="_blank"
              rel="noreferrer"
              className="button button-primary button-small"
            >
              Join on Google Meet
            </a>
          ) : null}
          {progress.recording_url ? (
            <a
              href={progress.recording_url}
              target="_blank"
              rel="noreferrer"
              className="button button-secondary button-small"
            >
              {progress.recording_label || "Play the recording"}
            </a>
          ) : null}
          <Link href="/portal/programme/" className="button button-secondary button-small">
            Back to my calendar
          </Link>
        </section>
      ) : null}

      <section className="dashboard-panel">
        <SessionContent contentRef={session.content_ref} contentType={session.content_type} />
      </section>

      <section className="dashboard-panel">
        <h2>{progress.status === "completed" ? "Your notes" : "Finish this session"}</h2>
        <p className="dashboard-inline-note">
          Notes are private to you and Gerald. Marking a session complete keeps your progress accurate — it does not
          lock anything.
        </p>
        <form action={markSessionProgress} className="dashboard-form">
          <input type="hidden" name="progressId" value={progress.id} />
          <input type="hidden" name="status" value="completed" />
          <input type="hidden" name="redirectTo" value={`/portal/programme/session/${session.session_number}/`} />
          <label className="form-field">
            <span>Your notes (optional)</span>
            <textarea
              name="clientNotes"
              rows={3}
              maxLength={dashboardFieldMaxLengths.clientNotes}
              defaultValue={progress.client_notes ?? ""}
              placeholder="Anything you want to remember or raise next time."
            />
          </label>
          <button type="submit" className="button button-primary">
            {progress.status === "completed" ? "Save notes" : "Mark as completed"}
          </button>
        </form>
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}

