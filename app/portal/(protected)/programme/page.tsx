import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { NextSessionCard } from "@/components/programme/NextSessionCard";
import { ProgrammeCalendar } from "@/components/programme/ProgrammeCalendar";
import { ProgrammeJourneyShell } from "@/components/programme/ProgrammeJourneyShell";
import { ProgrammeProgressTimeline } from "@/components/programme/ProgrammeProgressTimeline";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientContentReceipts, getClientEnrollmentBundle, getClientSessionReceiptMap } from "@/lib/dashboard/queries";
import { resolveProgrammeDefinition } from "@/lib/programme/interactive/content";
import { findNextSession, slotLabel, type ProgrammeCalendarEntry } from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programme | Client Portal",
  description: "Your programme sessions and interactive journey.",
  path: "/portal/programme/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ scheduled?: string; journeyComplete?: string; error?: string }>;
};

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

export default async function PortalProgrammePage({ searchParams }: PageProps) {
  const { scheduled, journeyComplete, error } = await searchParams;
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;

  if (!bundle?.enrollment) {
    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <p className="eyebrow">Programme</p>
          <h1>Your programme</h1>
        </section>
        <section className="dashboard-panel">
          <p className="dashboard-empty">
            Your programme has not been assigned yet. Gerald sets this up after your intake and consultation forms
            are complete.
          </p>
          <p className="dashboard-inline-note">
            <Link href="/portal/messages/">Message Gerald</Link> if you are unsure what is outstanding.
          </p>
        </section>
      </div>
    );
  }

  const definition =
    resolveProgrammeDefinition("", asDefinition(bundle.enrollment.content_snapshot)) ??
    asDefinition(bundle.template?.content_json) ??
    (bundle.template ? getInteractiveProgramme(bundle.template.addiction_slug) : null);

  if (!bundle.schedule && !definition) {
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

  const entries: ProgrammeCalendarEntry[] = bundle.sessions.map((session) => {
    const progress = progressBySession.get(session.id);
    return {
      id: progress?.id ?? session.id,
      sessionNumber: session.session_number,
      weekNumber: session.week_number,
      title: session.title,
      scheduledAt: progress?.scheduled_at ?? null,
      durationMinutes: progress?.duration_minutes ?? null,
      status: progress?.status ?? "locked",
      href: `/portal/programme/session/${session.session_number}/`,
      recordingUrl: progress?.recording_url ?? null,
    };
  });

  const nextSession = findNextSession(entries);
  const completedCount = bundle.progress.filter((item) => item.status === "completed").length;
  const totalCount = bundle.sessions.length;
  const unreadCount = bundle.sessions.filter((session) => {
    const receipt = sessionReceiptMap.get(session.id);
    return receipt && !receipt.read_at;
  }).length;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{bundle.template?.title}</h1>
        <p>
          {definition
            ? "Interactive 4-week healing journey with daily practice and live session support."
            : `${completedCount} of ${totalCount} sessions completed`}
          {bundle.schedule ? ` · your slot is ${slotLabel(bundle.schedule.weekday, bundle.schedule.time_slot)}` : ""}
          {bundle.pointsTotal > 0 ? ` · ${bundle.pointsTotal} practice points` : ""}
        </p>
      </section>

      {bundle.enrollmentHistory.length > 1 ? (
        <section className="dashboard-panel">
          <h2>Your programme history</h2>
          <p className="dashboard-inline-note">
            Previous journeys remain preserved. Your current journey is shown first.
          </p>
          <ul className="dashboard-session-list">
            {bundle.enrollmentHistory.map((history, index) => (
              <li key={history.id} className="dashboard-session-item">
                <div>
                  <strong>{index === 0 ? "Current journey" : "Previous journey"}</strong>
                  <p className="dashboard-inline-note">
                    Version {history.programme_version ?? "—"} · {history.status} · started{" "}
                    {history.journey_started_at?.slice(0, 10) ?? "not started"}
                    {history.journey_completed_at ? ` · completed ${history.journey_completed_at.slice(0, 10)}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {scheduled ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Your sessions are booked. They are listed below — you can add them to your own calendar.
        </p>
      ) : null}
      {journeyComplete ? (
        <p className="dashboard-inline-note dashboard-success-note">
          You completed the interactive journey. Keep using the daily practice and live sessions to stay steady.
        </p>
      ) : null}
      {error === "locked" ? (
        <p className="dashboard-inline-note dashboard-error-note">That activity is still locked. Continue with your next available step.</p>
      ) : null}

      {definition ? (
        <>
          <ProgrammeJourneyShell
            definition={definition}
            progressRows={bundle.activityProgress ?? []}
            currentActivityId={bundle.enrollment.current_activity_id}
            pointsTotal={bundle.pointsTotal}
            audience="client"
          />
          <ProgrammeProgressTimeline events={bundle.activityEvents ?? []} audience="client" />
        </>
      ) : null}

      {!bundle.schedule ? (
        <section className="dashboard-panel">
          <h2>Choose your live session slot</h2>
          <p className="dashboard-inline-note">
            Your interactive journey can begin now. Live coaching sessions still need a Tuesday or Friday slot.
          </p>
          <Link href="/portal/programme/schedule/" className="button button-primary">
            Choose schedule
          </Link>
        </section>
      ) : (
        <>
          <NextSessionCard
            entry={nextSession}
            meetUrl={bundle.schedule.meet_url}
            calendarHref="/api/portal/programme/calendar/"
          />

          <section className="dashboard-panel">
            <div className="dashboard-panel-header">
              <h2>Your live session calendar</h2>
              <a href="/api/portal/programme/calendar/" className="dashboard-panel-link" download>
                Download all dates
              </a>
            </div>
            <p className="dashboard-inline-note">
              Live sessions sit alongside your interactive journey. Tap any unlocked session to open its material.
            </p>
            <ProgrammeCalendar entries={entries} nextSessionId={nextSession?.id} audience="client" />
          </section>
        </>
      )}

      {releasedDocs.length > 0 ? (
        <section className="dashboard-panel">
          <h2>Your programme guides</h2>
          <p className="dashboard-inline-note">Read these online or download them as a PDF to keep.</p>
          <ul className="dashboard-session-list">
            {releasedDocs.map((doc) => (
              <li key={doc.id} className="dashboard-session-item">
                <div>
                  <strong>{doc.title}</strong>
                  {doc.summary ? <p>{doc.summary}</p> : null}
                </div>
                <Link href={`/portal/programme/docs/${doc.slug}/`} className="button button-small button-secondary">
                  Read
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {unreadCount > 0 ? (
        <p className="dashboard-inline-note">
          You have {unreadCount} session {unreadCount === 1 ? "page" : "pages"} you have not opened yet.
        </p>
      ) : null}
    </div>
  );
}
