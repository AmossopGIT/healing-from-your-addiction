import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PortalPreCourseChecklist } from "@/components/portal/PortalPreCourseChecklist";
import { PortalThisWeekCard } from "@/components/portal/PortalThisWeekCard";
import { PortalWeekMap } from "@/components/portal/PortalWeekMap";
import { NextSessionCard } from "@/components/programme/NextSessionCard";
import { ProgrammeCalendar } from "@/components/programme/ProgrammeCalendar";
import { ProgrammeJourneyShell } from "@/components/programme/ProgrammeJourneyShell";
import { ProgrammeProgressTimeline } from "@/components/programme/ProgrammeProgressTimeline";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { getAuthProfile } from "@/lib/supabase/auth";
import {
  getClientConsultation,
  getClientContentReceipts,
  getClientEnrollmentBundle,
  getClientIntakeSubmission,
  getClientSessionReceiptMap,
} from "@/lib/dashboard/queries";
import { buildPreCourseChecklist, buildThisWeekModel, buildWeekMapItems } from "@/lib/portal/courseLoop";
import { resolveProgrammeDefinition, findActivity } from "@/lib/programme/interactive/content";
import { findNextSession, slotLabel, type ProgrammeCalendarEntry } from "@/lib/programme/schedule";
import { createMetadata } from "@/lib/seo";
import { createClient } from "@/lib/supabase/server";
import type { ClientDailyCheckIn } from "@/types/database";

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

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
    if (!bundle?.clientProfile) {
      return (
        <div className="dashboard-stack">
          <p className="dashboard-empty">Your portal is loading. If this persists, sign in again.</p>
        </div>
      );
    }

    const [intakeSubmission, consultation] = await Promise.all([
      getClientIntakeSubmission(bundle.clientProfile.id),
      getClientConsultation(bundle.clientProfile.id),
    ]);
    const preCourseChecklist = buildPreCourseChecklist({
      clientProfile: bundle.clientProfile,
      intakeSubmission,
      consultation,
      hasEnrollment: false,
    });
    const thisWeek = buildThisWeekModel({
      clientProfile: bundle.clientProfile,
      intakeSubmission,
      consultation,
      enrollment: null,
      sessions: [],
      progressBySessionId: new Map(),
      activityProgress: [],
      currentActivityId: null,
      currentActivityTitle: null,
      todayCheckIn: null,
      homeworkTasks: [],
      todayHomeworkEntries: [],
      hasSchedule: false,
    });

    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <p className="eyebrow">Programme</p>
          <h1>Your programme</h1>
          <p>
            Finish the pre-course steps below. Gerald assigns your interactive journey once intake and consultation are
            ready.
          </p>
        </section>
        {thisWeek ? <PortalThisWeekCard thisWeek={thisWeek} /> : null}
        <PortalPreCourseChecklist items={preCourseChecklist} />
        <section className="dashboard-panel">
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

  const currentActivityId = bundle.enrollment.current_activity_id ?? null;
  const currentActivity = currentActivityId && definition ? findActivity(definition, currentActivityId) : null;
  const supabase = await createClient();
  const today = todayIsoDate();
  const { data: todayCheckInRow } = await supabase
    .from("client_daily_check_ins")
    .select("*")
    .eq("client_profile_id", bundle.clientProfile.id)
    .eq("check_in_date", today)
    .maybeSingle();
  const todayHomeworkEntries = bundle.homeworkEntries.filter((entry) => entry.entry_date === today);
  const thisWeek = buildThisWeekModel({
    clientProfile: bundle.clientProfile,
    intakeSubmission: null,
    consultation: null,
    enrollment: bundle.enrollment,
    sessions: bundle.sessions,
    progressBySessionId: progressBySession,
    activityProgress: bundle.activityProgress,
    currentActivityId,
    currentActivityTitle: currentActivity?.title ?? null,
    todayCheckIn: (todayCheckInRow as ClientDailyCheckIn | null) ?? null,
    homeworkTasks: bundle.homeworkTasks,
    todayHomeworkEntries,
    hasSchedule: Boolean(bundle.schedule),
  });

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

      <nav className="portal-programme-toc admin-programme-toc" aria-label="Programme sections">
        <a href="#this-week">This week</a>
        <a href="#week-map">Week map</a>
        {definition ? <a href="#journey">Journey</a> : null}
        <a href="#sessions">Sessions</a>
        {releasedDocs.length > 0 ? <a href="#guides">Guides</a> : null}
      </nav>

      {thisWeek ? (
        <div id="this-week">
          <PortalThisWeekCard thisWeek={thisWeek} />
        </div>
      ) : null}
      {thisWeek ? (
        <div id="week-map">
          <PortalWeekMap weekNumber={thisWeek.weekNumber} items={buildWeekMapItems(thisWeek)} />
        </div>
      ) : null}

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
        <div id="journey">
          <ProgrammeJourneyShell
            definition={definition}
            progressRows={bundle.activityProgress ?? []}
            currentActivityId={bundle.enrollment.current_activity_id}
            pointsTotal={bundle.pointsTotal}
            audience="client"
          />
          <ProgrammeProgressTimeline
            events={bundle.activityEvents ?? []}
            audience="client"
            definition={definition}
          />
        </div>
      ) : null}

      {!bundle.schedule ? (
        <section className="dashboard-panel" id="sessions">
          <h2>Choose your live session slot</h2>
          <p className="dashboard-inline-note">
            Your interactive journey can begin now. Live coaching sessions still need a Tuesday or Friday slot.
          </p>
          <Link href="/portal/programme/schedule/" className="button button-primary">
            Choose schedule
          </Link>
        </section>
      ) : (
        <div id="sessions">
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
        </div>
      )}

      {releasedDocs.length > 0 ? (
        <section className="dashboard-panel" id="guides">
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
