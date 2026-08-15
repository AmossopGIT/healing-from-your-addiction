import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProgrammeCalendar } from "@/components/programme/ProgrammeCalendar";
import { ProgrammeJourneyShell } from "@/components/programme/ProgrammeJourneyShell";
import { ProgrammeProgressTimeline } from "@/components/programme/ProgrammeProgressTimeline";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { createEnrollment, unlockSessionProgress } from "@/lib/dashboard/programmeActions";
import {
  adminAddProgrammeFlag,
  adminResolveProgrammeFlag,
  adminSkipActivity,
  adminUnlockActivity,
  assignInteractiveProgramme,
} from "@/lib/dashboard/interactiveProgrammeActions";
import { adminSaveEnrollmentSchedule, adminSaveSessionRecording } from "@/lib/dashboard/scheduleActions";
import { releaseProgrammeDoc } from "@/lib/dashboard/homeworkActions";
import {
  getAdminClientBundle,
  getClientConsultation,
  getClientContentReceipts,
  getClientIntakeSubmission,
} from "@/lib/dashboard/queries";
import {
  buildThisWeekModel,
  buildWeek1LaunchChecklist,
  nextStepFromThisWeek,
  summarizeWeek1Launch,
} from "@/lib/portal/courseLoop";
import { resolveProgrammeDefinition, findActivity } from "@/lib/programme/interactive/content";
import { mergeAdminVisibleResponses, summarizeJourney } from "@/lib/programme/interactive/progress";
import {
  encodeSlotValue,
  findNextSession,
  formatSessionDateTime,
  PROGRAMME_SLOT_OPTIONS,
  relativeSessionLabel,
  slotLabel,
  type ProgrammeCalendarEntry,
} from "@/lib/programme/schedule";
import { homeworkToneForProgrammeWeek, homeworkFramingCopy } from "@/lib/programme/homework";
import { createMetadata } from "@/lib/seo";
import { sanitizeUuid } from "@/lib/dashboard/formValidation";

export const dynamic = "force-dynamic";

const programmeErrorMessages: Record<string, string> = {
  "template-missing": "That programme template could not be found.",
  "content-missing": "Interactive programme content is missing for that template.",
  "enrollment-failed": "Could not create the programme enrollment.",
  "progress-failed": "Enrollment was created but activity progress rows failed.",
  "unlock-failed": "Could not unlock that activity. Check it still belongs to this client.",
  "skip-failed": "Could not skip that activity. A skip reason is required.",
  "flag-failed": "Could not add that flag.",
  "flag-missing": "That flag was not found for this client.",
  "flag-resolve-failed": "Could not resolve that flag.",
  "slot-full": "That live session slot is already full.",
  "recording-failed": "Could not save the recording link.",
  "doc-failed": "Could not release that programme guide.",
};
type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    scheduled?: string;
    recordingSaved?: string;
    docReleased?: string;
    error?: string;
    assigned?: string;
    unlocked?: string;
    skipped?: string;
    flagged?: string;
    flagResolved?: string;
    enrollmentId?: string;
  }>;
};

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client programme | Admin",
    description: "Manage client programme.",
    path: `/admin/clients/${id}/programme/`,
    noIndex: true,
  });
}

/** Last 7 calendar days, oldest first, as YYYY-MM-DD keys. */
function recentDayKeys(count = 7) {
  const days: string[] = [];
  const now = new Date();
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - offset);
    days.push(day.toISOString().slice(0, 10));
  }
  return days;
}

function dayInitial(dayKey: string) {
  return new Intl.DateTimeFormat("en-ZA", { weekday: "narrow", timeZone: "Africa/Johannesburg" }).format(
    new Date(`${dayKey}T12:00:00Z`),
  );
}

export default async function AdminClientProgrammePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { scheduled, recordingSaved, docReleased, error, assigned, unlocked, skipped, flagged, flagResolved, enrollmentId } =
    await searchParams;
  const bundle = await getAdminClientBundle(id, sanitizeUuid(enrollmentId ?? ""));
  if (!bundle) notFound();

  const {
    profile,
    clientProfile,
    enrollment,
    template,
    templates,
    sessions,
    progress,
    schedule,
    homeworkTasks,
    homeworkEntries,
    pointsTotal,
    programmeDocs,
    activityProgress,
    adminFlags,
    sharedPrivateAnswers,
    dailyCheckIns,
    activityEvents,
    enrollmentHistory,
    dataErrors,
  } = bundle;

  const definition =
    resolveProgrammeDefinition("", asDefinition(enrollment?.content_snapshot)) ??
    asDefinition(template?.content_json) ??
    (template ? getInteractiveProgramme(template.addiction_slug) : null);
  const journey = definition ? summarizeJourney(definition, activityProgress ?? [], enrollment?.current_activity_id) : null;
  const progressBySession = new Map(progress.map((item) => [item.session_id, item]));
  const clientName = profile?.full_name ?? "Client";

  const docReceipts = enrollment
    ? await getClientContentReceipts(id, {
        contentKind: "programme_doc",
        contentIds: programmeDocs.map((doc) => doc.id),
      })
    : [];
  const releasedDocIds = new Set(docReceipts.map((receipt) => receipt.content_id));

  const sessionReceipts = sessions.length
    ? await getClientContentReceipts(id, {
        contentKind: "session",
        contentIds: sessions.map((session) => session.id),
      })
    : [];
  const sessionsAvailableCount = progress.filter((item) => item.status === "available" || item.status === "in_progress" || item.status === "completed").length;
  const [intakeSubmission, consultation] = await Promise.all([
    getClientIntakeSubmission(id),
    getClientConsultation(id),
  ]);

  const currentActivityId = enrollment?.current_activity_id ?? null;
  const currentActivity =
    currentActivityId && definition ? findActivity(definition, currentActivityId) : null;
  const today = new Date().toISOString().slice(0, 10);
  const todayCheckIn = dailyCheckIns.find((checkIn) => checkIn.check_in_date === today) ?? null;
  const todayHomeworkEntries = homeworkEntries.filter((entry) => entry.entry_date === today);
  const thisWeek = buildThisWeekModel({
    clientProfile,
    intakeSubmission,
    consultation,
    enrollment,
    sessions,
    progressBySessionId: progressBySession,
    activityProgress: activityProgress ?? [],
    currentActivityId,
    currentActivityTitle: currentActivity?.title ?? null,
    todayCheckIn,
    homeworkTasks,
    todayHomeworkEntries,
    hasSchedule: Boolean(schedule),
  });
  const clientNextStep = thisWeek ? nextStepFromThisWeek(thisWeek) : null;
  const preferredTemplate =
    templates.find((item) => item.addiction_slug === clientProfile.addiction_slug && item.status === "published") ??
    templates.find((item) => item.addiction_slug === clientProfile.addiction_slug) ??
    null;
  const week1Checklist = buildWeek1LaunchChecklist({
    clientProfileId: id,
    addictionSlug: clientProfile.addiction_slug,
    hasEnrollment: Boolean(enrollment),
    preferredTemplateId: preferredTemplate?.id ?? null,
    sessionsAvailableCount,
    sessionReceiptCount: sessionReceipts.length,
    hasSchedule: Boolean(schedule),
    releasedDocCount: releasedDocIds.size,
    hasProgrammeDocs: programmeDocs.length > 0,
    clientNextStep,
  });
  const week1Summary = summarizeWeek1Launch(week1Checklist);
  const openFlags = (adminFlags ?? []).filter((flag) => !flag.resolved_at);
  const urgentFlags = openFlags.filter((flag) => flag.severity === "urgent" || flag.flag_type === "safety");
  const highUrgeCheckIns = dailyCheckIns.filter((checkIn) => checkIn.craving_level >= 4);

  const days = recentDayKeys();
  const entriesByTaskDate = new Map(homeworkEntries.map((entry) => [`${entry.task_id}:${entry.entry_date}`, entry]));
  const dailyTasks = homeworkTasks.filter((task) => task.cadence === "daily");
  const expectedTicks = dailyTasks.length * days.length;
  const actualTicks = dailyTasks.reduce(
    (total, task) =>
      total + days.filter((day) => entriesByTaskDate.get(`${task.id}:${day}`)?.completed).length,
    0,
  );
  const compliancePercent = expectedTicks > 0 ? Math.round((actualTicks / expectedTicks) * 100) : 0;

  const calendarEntries: ProgrammeCalendarEntry[] = sessions.map((session) => {
    const item = progressBySession.get(session.id);
    return {
      id: item?.id ?? session.id,
      sessionNumber: session.session_number,
      weekNumber: session.week_number,
      title: session.title,
      scheduledAt: item?.scheduled_at ?? null,
      durationMinutes: item?.duration_minutes ?? null,
      status: item?.status ?? "locked",
      recordingUrl: item?.recording_url ?? null,
    };
  });
  const nextSession = findNextSession(calendarEntries);

  const completedSessions = progress.filter((item) => item.status === "completed").length;
  const currentWeek = sessions.find((session) => {
    const item = progressBySession.get(session.id);
    return item && item.status !== "locked" && item.status !== "completed";
  })?.week_number;
  const tone = homeworkToneForProgrammeWeek(currentWeek);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{clientName}</h1>
        <p>
          {template?.title ?? "No programme assigned yet"} ·{" "}
          <Link href={`/admin/clients/${id}/`}>Back to client</Link>
          {" · "}
          <Link href="/admin/docs/after-invite-start-the-course/">Week 1 ops guide</Link>
        </p>
      </section>

      <section className="dashboard-panel" id="week1-checklist">
        <h2>Week 1 launch checklist</h2>
        <p className="dashboard-inline-note">
          After invite and intake/consultation, use this list to start the course loop the client sees as “This week”.
          {week1Summary.completeCount}/{week1Summary.totalCount} complete.
        </p>
        <nav className="admin-programme-toc" aria-label="Programme sections">
          <a href="#week1-checklist">Week 1</a>
          <a href="#assign">Assign</a>
          <a href="#journey">Journey</a>
          <a href="#mood-urge-pulse">Mood & urge</a>
          <a href="#flags">Flags</a>
          <a href="#schedule">Schedule</a>
          <a href="#docs">Guides</a>
          <a href="#sessions">Sessions</a>
        </nav>
        <ul className="admin-week1-checklist">
          {week1Checklist.map((item) => (
            <li key={item.id} className={item.done ? "is-complete" : ""}>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
              {item.done ? (
                <span className="portal-pre-course-status">Done</span>
              ) : item.href ? (
                <Link href={item.href} className="button button-small button-secondary">
                  Open
                </Link>
              ) : (
                <span className="portal-pre-course-status">Open</span>
              )}
            </li>
          ))}
        </ul>
        {clientNextStep ? (
          <div className="admin-client-next-step">
            <p className="eyebrow">What the client sees next</p>
            <strong>{clientNextStep.title}</strong>
            <p>{clientNextStep.description}</p>
            <p className="dashboard-inline-note">
              CTA: {clientNextStep.buttonLabel} → {clientNextStep.href}
            </p>
          </div>
        ) : null}
        {urgentFlags.length || highUrgeCheckIns.length ? (
          <div className="admin-safety-alert" role="status">
            <strong>Needs attention</strong>
            <p>
              {urgentFlags.length
                ? `${urgentFlags.length} open urgent/safety flag${urgentFlags.length === 1 ? "" : "s"}.`
                : null}{" "}
              {highUrgeCheckIns.length
                ? `${highUrgeCheckIns.length} recent high-urge check-in${highUrgeCheckIns.length === 1 ? "" : "s"} (craving 4+).`
                : null}
            </p>
            <Link href="#flags" className="button button-small button-secondary">
              Review flags
            </Link>
          </div>
        ) : null}
      </section>

      {scheduled ? <p className="dashboard-inline-note dashboard-success-note">Schedule updated.</p> : null}
      {recordingSaved ? <p className="dashboard-inline-note dashboard-success-note">Recording link saved.</p> : null}
      {docReleased ? (
        <p className="dashboard-inline-note dashboard-success-note">Guide released — it is now visible to the client.</p>
      ) : null}
      {assigned ? <p className="dashboard-inline-note dashboard-success-note">Interactive programme assigned.</p> : null}
      {unlocked ? <p className="dashboard-inline-note dashboard-success-note">Activity unlocked.</p> : null}
      {skipped ? <p className="dashboard-inline-note dashboard-success-note">Activity skipped.</p> : null}
      {flagged ? <p className="dashboard-inline-note dashboard-success-note">Flag added.</p> : null}
      {flagResolved ? <p className="dashboard-inline-note dashboard-success-note">Flag resolved.</p> : null}
      {error ? (
        <p className="dashboard-inline-note dashboard-error-note">
          {programmeErrorMessages[error] ?? "Could not save that change. Please try again."}
        </p>
      ) : null}
      {dataErrors.length ? (
        <section className="dashboard-panel dashboard-data-warning" role="alert">
          <h2>Some results could not be loaded</h2>
          <p>
            The page is showing the results that were available. Refresh after fixing the database or permissions issue;
            do not interpret an empty section as “no client activity”.
          </p>
          <ul>
            {dataErrors.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
          <Link href={`/admin/clients/${id}/programme/`} className="button button-small button-secondary">
            Refresh results
          </Link>
        </section>
      ) : null}
      {enrollmentHistory.length > 1 ? (
        <section className="dashboard-panel">
          <h2>Programme history</h2>
          <p className="dashboard-inline-note">
            Older enrolments are preserved and are not merged into the current results.
          </p>
          <ul className="dashboard-session-list">
            {enrollmentHistory.map((history) => (
              <li key={history.id} className="dashboard-session-item">
                <div>
                  <strong>{history.id === enrollment?.id ? "Current enrolment" : "Historical enrolment"}</strong>
                  <p className="dashboard-inline-note">
                    Version {history.programme_version ?? "—"} · {history.status} · created {history.created_at.slice(0, 10)}
                    {history.journey_completed_at ? ` · completed ${history.journey_completed_at.slice(0, 10)}` : ""}
                  </p>
                  {history.id !== enrollment?.id ? (
                    <Link
                      href={`/admin/clients/${id}/programme/?enrollmentId=${history.id}`}
                      className="button button-small button-secondary"
                    >
                      Review this journey
                    </Link>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {!enrollment ? (
        <section className="dashboard-panel" id="assign">
          <h2>Assign a programme</h2>
          <p className="dashboard-inline-note">
            Prefer the interactive assign action. It stores an immutable content snapshot, unlocks the first journey
            activities, scaffolds live sessions 1–2, and creates client session receipts so their next-step can fire.
          </p>
          <form action={assignInteractiveProgramme} className="dashboard-form">
            <input type="hidden" name="clientProfileId" value={id} />
            <label className="form-field">
              <span>Interactive programme template</span>
              <select name="templateId" required defaultValue={preferredTemplate?.id ?? ""}>
                <option value="">Select template</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.addiction_slug}) · {item.status ?? "legacy"}
                    {preferredTemplate?.id === item.id ? " · matches client focus" : ""}
                  </option>
                ))}
              </select>
            </label>
            {clientProfile.addiction_slug ? (
              <p className="form-hint">
                Preselected from client focus: {clientProfile.addiction_slug}. Change only if you intentionally assign a
                different pack.
              </p>
            ) : (
              <p className="form-hint">Client focus is not set — choose the matching interactive template carefully.</p>
            )}
            <button type="submit" className="button button-primary">
              Assign interactive programme
            </button>
          </form>
          <details className="admin-programme-details">
            <summary>Advanced: legacy assign (sessions only — different client effects)</summary>
            <p className="form-hint">
              Legacy assign creates session receipts and can set a start date, but it is not the primary Week 1 path.
              Prefer interactive assign above unless you are repairing an older enrollment.
            </p>
            <form action={createEnrollment} className="dashboard-form">
              <input type="hidden" name="clientProfileId" value={id} />
              <label className="form-field">
                <span>Programme template</span>
                <select name="templateId" required defaultValue={preferredTemplate?.id ?? ""}>
                  <option value="">Select template</option>
                  {templates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.title} ({item.addiction_slug})
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Start date (session dates are counted from here)</span>
                <input type="date" name="startDate" />
              </label>
              <button type="submit" className="button button-secondary">
                Assign legacy sessions
              </button>
            </form>
          </details>
        </section>
      ) : (
        <>
          <section className="admin-programme-summary">
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Slot</p>
              <p className="admin-programme-stat-value">
                {schedule ? slotLabel(schedule.weekday, schedule.time_slot) : "Not chosen"}
              </p>
              <p className="dashboard-inline-note">
                {schedule ? "Chosen by client" : "Client still needs to pick"}
              </p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Journey progress</p>
              <p className="admin-programme-stat-value">{journey ? `${journey.percentComplete}%` : "—"}</p>
              <p className="dashboard-inline-note">
                {journey
                  ? `${journey.completedActivities}/${journey.totalActivities} activities`
                  : `${completedSessions}/${sessions.length} sessions`}
              </p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Homework (last 7 days)</p>
              <p className="admin-programme-stat-value">{compliancePercent}%</p>
              <p className="dashboard-inline-note">
                {actualTicks} of {expectedTicks} ticks
              </p>
            </article>
            <article className="dashboard-stat-card">
              <p className="dashboard-stat-label">Practice points</p>
              <p className="admin-programme-stat-value">{pointsTotal}</p>
              <p className="dashboard-inline-note">Earned from daily practice</p>
            </article>
          </section>

          {definition ? (
            <>
              <div id="journey">
              <section className="dashboard-panel programme-admin-guide">
                <div className="dashboard-panel-header">
                  <div>
                    <p className="eyebrow">Admin guide</p>
                    <h2>How to read this journey</h2>
                  </div>
                  <Link href="#activity-results" className="dashboard-panel-link">
                    Jump to results
                  </Link>
                </div>
                <details>
                  <summary>Show workflow guidance</summary>
                  <ol>
                    <li>Use Journey progress and the activity path to see what has unlocked, started, or completed.</li>
                    <li>Use Mood & urge pulse for the canonical daily check-in trend.</li>
                    <li>Use Shared answers to read only answers the client chose to share.</li>
                    <li>Add an admin flag when a follow-up or safety action needs a durable handoff.</li>
                  </ol>
                </details>
              </section>
              <section id="activity-results" className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <p className="eyebrow">Client results</p>
                    <h2>At-a-glance outcomes</h2>
                  </div>
                  <Link href={`/admin/clients/${id}/programme/`} className="dashboard-panel-link">
                    Refresh
                  </Link>
                </div>
                <div className="admin-programme-summary">
                  <article className="dashboard-stat-card">
                    <p className="dashboard-stat-label">Completed activities</p>
                    <p className="admin-programme-stat-value">
                      {activityProgress.filter((item) => item.status === "completed").length}/{definition.activities.length}
                    </p>
                  </article>
                  <article className="dashboard-stat-card">
                    <p className="dashboard-stat-label">Results saved</p>
                    <p className="admin-programme-stat-value">
                      {activityProgress.filter((item) => Object.keys(item.public_responses ?? item.responses ?? {}).length > 0).length}
                    </p>
                  </article>
                  <article className="dashboard-stat-card">
                    <p className="dashboard-stat-label">Shared answers</p>
                    <p className="admin-programme-stat-value">{sharedPrivateAnswers.length}</p>
                  </article>
                  <article className="dashboard-stat-card">
                    <p className="dashboard-stat-label">Daily check-ins</p>
                    <p className="admin-programme-stat-value">{dailyCheckIns.length}</p>
                  </article>
                </div>
              </section>
              <ProgrammeJourneyShell
                definition={definition}
                progressRows={activityProgress ?? []}
                currentActivityId={enrollment.current_activity_id}
                pointsTotal={pointsTotal}
                audience="admin"
                clientProfileId={id}
              />
              <ProgrammeProgressTimeline events={activityEvents ?? []} audience="admin" definition={definition} />
              </div>

              <section className="dashboard-panel" id="mood-urge-pulse">
                <h2>Mood & urge pulse</h2>
                <p className="dashboard-inline-note">
                  Canonical daily check-ins from the portal and programme daily activities. Private notes stay hidden unless shared.
                  High-urge rows (craving 4+) are highlighted.
                </p>
                {(dailyCheckIns ?? []).length ? (
                  <div className="dashboard-table-wrap">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Mood</th>
                          <th>Urge</th>
                          <th>Paused</th>
                          <th>Shared note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(dailyCheckIns ?? []).map((checkIn) => (
                          <tr
                            key={checkIn.id}
                            className={checkIn.craving_level >= 4 ? "admin-high-urge-row" : undefined}
                          >
                            <td>{checkIn.check_in_date}</td>
                            <td>{checkIn.mood}</td>
                            <td>
                              {checkIn.craving_level}
                              {checkIn.craving_level >= 4 ? " · high" : ""}
                            </td>
                            <td>{checkIn.pause_taken ? "Yes" : "No"}</td>
                            <td>{checkIn.note ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="dashboard-empty">No daily check-ins yet.</p>
                )}
              </section>

              <section className="dashboard-panel">
                <h2>Shared answers & activity controls</h2>
                <p className="dashboard-inline-note">
                  Free-text answers stay private unless the client ticks “Share with Gerald”. Operational status is always visible.
                  Private answer bodies are loaded only when shared at the database layer.
                </p>
                <ul className="dashboard-session-list">
                  {(activityProgress ?? []).map((item) => {
                    const activity = definition.activities.find((entry) => entry.id === item.activity_id);
                    const sharedPrivate = (sharedPrivateAnswers ?? []).find((row) => row.progress_id === item.id);
                    const responses = mergeAdminVisibleResponses({
                      publicResponses: item.public_responses,
                      legacyResponses: item.responses,
                      sharedPrivateResponses: sharedPrivate?.private_responses ?? null,
                      sharedWithAdmin: item.shared_with_admin,
                    });
                    const visibleEntries = Object.entries(responses).filter(([key]) => key !== "share_with_admin");
                    return (
                      <li key={item.id} id={`activity-${item.activity_id}`} className="admin-session-row">
                        <div className="admin-session-head">
                          <div>
                            <strong>{activity?.title ?? item.activity_id}</strong>
                            <p className="dashboard-inline-note">
                              {item.status}
                              {item.completed_at ? ` · completed ${item.completed_at.slice(0, 10)}` : ""}
                              {item.shared_with_admin ? " · shared" : " · private text hidden"}
                            </p>
                            {visibleEntries.length ? (
                              <ul>
                                {visibleEntries.map(([key, value]) => (
                                  <li key={key}>
                                    <strong>{key}:</strong> {Array.isArray(value) ? value.join(", ") : String(value)}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="dashboard-empty">No shared answer content.</p>
                            )}
                          </div>
                          <div className="admin-session-actions">
                            {item.status === "locked" ? (
                              <form action={adminUnlockActivity}>
                                <input type="hidden" name="clientProfileId" value={id} />
                                <input type="hidden" name="progressId" value={item.id} />
                                <button type="submit" className="button button-small button-secondary">
                                  Unlock
                                </button>
                              </form>
                            ) : null}
                            {item.status !== "completed" && item.status !== "skipped" ? (
                              <details className="admin-programme-details">
                                <summary>Skip</summary>
                                <form action={adminSkipActivity} className="dashboard-form">
                                  <input type="hidden" name="clientProfileId" value={id} />
                                  <input type="hidden" name="progressId" value={item.id} />
                                  <label className="form-field">
                                    <span>Reason</span>
                                    <textarea name="reason" required rows={3} />
                                  </label>
                                  <button type="submit" className="button button-small button-secondary">
                                    Skip activity
                                  </button>
                                </form>
                              </details>
                            ) : null}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>

              <section className="dashboard-panel" id="flags">
                <h2>Admin flags</h2>
                {(adminFlags ?? []).length ? (
                  <ul className="dashboard-session-list">
                    {(adminFlags ?? []).map((flag) => (
                      <li
                        key={flag.id}
                        className={`dashboard-session-item${flag.resolved_at ? "" : flag.severity === "urgent" || flag.flag_type === "safety" ? " admin-flag-urgent" : ""}`}
                      >
                        <div>
                          <strong>
                            {flag.flag_type} · {flag.severity}
                            {flag.resolved_at ? " · resolved" : " · open"}
                          </strong>
                          <p>{flag.note}</p>
                          {flag.resolved_at ? (
                            <p className="dashboard-inline-note">Resolved {flag.resolved_at.slice(0, 10)}</p>
                          ) : null}
                        </div>
                        {!flag.resolved_at ? (
                          <form action={adminResolveProgrammeFlag}>
                            <input type="hidden" name="clientProfileId" value={id} />
                            <input type="hidden" name="flagId" value={flag.id} />
                            <button type="submit" className="button button-small button-secondary">
                              Resolve
                            </button>
                          </form>
                        ) : (
                          <span className="programme-status programme-status-completed">Resolved</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="dashboard-empty">No flags yet.</p>
                )}
                <form action={adminAddProgrammeFlag} className="dashboard-form">
                  <input type="hidden" name="clientProfileId" value={id} />
                  <input type="hidden" name="enrollmentId" value={enrollment.id} />
                  <label className="form-field">
                    <span>Flag type</span>
                    <select name="flagType" defaultValue="note">
                      <option value="note">Note</option>
                      <option value="support">Support</option>
                      <option value="inactive">Inactive</option>
                      <option value="safety">Safety</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Severity</span>
                    <select name="severity" defaultValue="info">
                      <option value="info">Info</option>
                      <option value="watch">Watch</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Note</span>
                    <textarea name="note" required rows={3} />
                  </label>
                  <button type="submit" className="button button-secondary">
                    Add flag
                  </button>
                </form>
              </section>
            </>
          ) : null}

          <section className="dashboard-panel" id="schedule">
            <div className="dashboard-panel-header">
              <h2>Schedule</h2>
              {schedule ? (
                <a href={schedule.meet_url} target="_blank" rel="noreferrer" className="dashboard-panel-link">
                  Open Meet link
                </a>
              ) : null}
            </div>

            {schedule ? (
              <p>
                <strong>{slotLabel(schedule.weekday, schedule.time_slot)}</strong> · first session{" "}
                {formatSessionDateTime(schedule.first_session_at)}
              </p>
            ) : (
              <p className="dashboard-empty">
                The client has not chosen a slot yet. You can set one for them below.
              </p>
            )}

            {nextSession?.scheduledAt ? (
              <p className="dashboard-inline-note">
                Next session: {relativeSessionLabel(nextSession.scheduledAt)} ·{" "}
                {formatSessionDateTime(nextSession.scheduledAt)}
              </p>
            ) : null}

            <details className="admin-programme-details">
              <summary>{schedule ? "Change the slot" : "Set a slot for this client"}</summary>
              <p className="dashboard-inline-note">
                Changing the slot re-dates all eight sessions from the next matching weekday. Let the client know
                before you do this.
              </p>
              <form action={adminSaveEnrollmentSchedule} className="dashboard-form">
                <input type="hidden" name="clientProfileId" value={id} />
                <input type="hidden" name="enrollmentId" value={enrollment.id} />
                <label className="form-field">
                  <span>Session time</span>
                  <select
                    name="slot"
                    required
                    defaultValue={schedule ? encodeSlotValue(schedule.weekday, schedule.time_slot) : ""}
                  >
                    <option value="" disabled>
                      Select a slot
                    </option>
                    {PROGRAMME_SLOT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="button button-secondary">
                  {schedule ? "Update schedule" : "Set schedule"}
                </button>
              </form>
            </details>
          </section>

          <section className="dashboard-panel">
            <h2>Session calendar</h2>
            <p className="dashboard-inline-note">
              Eight live coaching sessions by default (or the programme cadence count). Session 1 is 90 minutes; later sessions are 45. Daily interactive activities are tracked separately.
            </p>
            <ProgrammeCalendar
              entries={calendarEntries}
              nextSessionId={nextSession?.id}
              audience="admin"
              emptyMessage="Dates appear once the client picks a slot, or once you set one above."
            />
          </section>

          <section className="dashboard-panel">
            <h2>Homework compliance</h2>
            <p className="dashboard-inline-note">{homeworkFramingCopy(tone)}</p>

            {dailyTasks.length === 0 ? (
              <p className="dashboard-empty">
                No daily homework tasks are seeded for this template yet. Run the programme seed to add them.
              </p>
            ) : (
              <div className="admin-homework-grid" role="table" aria-label="Daily homework over the last 7 days">
                <div className="admin-homework-row admin-homework-head" role="row">
                  <span role="columnheader">Task</span>
                  {days.map((day) => (
                    <abbr key={day} role="columnheader" title={day}>
                      {dayInitial(day)}
                    </abbr>
                  ))}
                </div>
                {dailyTasks.map((task) => (
                  <div key={task.id} className="admin-homework-row" role="row">
                    <span className="admin-homework-task" role="rowheader">
                      {task.title}
                    </span>
                    {days.map((day) => {
                      const entry = entriesByTaskDate.get(`${task.id}:${day}`);
                      const done = Boolean(entry?.completed);
                      return (
                        <span
                          key={day}
                          role="cell"
                          className={`admin-homework-cell${done ? " is-done" : ""}`}
                          title={`${task.title} · ${day} · ${done ? "completed" : "not completed"}`}
                        >
                          {done ? "✓" : "·"}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </section>

          {programmeDocs.length > 0 ? (
            <section className="dashboard-panel" id="docs">
              <h2>Programme guides</h2>
              <p className="dashboard-inline-note">
                Released guides appear in the client&apos;s portal immediately and can be downloaded as PDFs.
              </p>
              <ul className="dashboard-session-list">
                {programmeDocs.map((doc) => {
                  const released = releasedDocIds.has(doc.id);
                  return (
                    <li key={doc.id} className="dashboard-session-item">
                      <div>
                        <strong>{doc.title}</strong>
                        <p className={released ? "dashboard-inline-note" : "dashboard-empty"}>
                          {released ? "Released to client" : "Not released yet"}
                        </p>
                      </div>
                      {released ? (
                        <span className="programme-status programme-status-completed">Released</span>
                      ) : (
                        <form action={releaseProgrammeDoc}>
                          <input type="hidden" name="clientProfileId" value={id} />
                          <input type="hidden" name="docId" value={doc.id} />
                          <button type="submit" className="button button-small button-secondary">
                            Release
                          </button>
                        </form>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="dashboard-panel" id="sessions">
            <h2>Sessions and recordings</h2>
            <p className="dashboard-inline-note">
              Unlock a session to make it visible to the client. Paste a Drive link after each live session so the
              client can play it back.
            </p>
            <ul className="dashboard-session-list">
              {sessions.map((session) => {
                const item = progressBySession.get(session.id);
                return (
                  <li key={session.id} className="admin-session-row">
                    <div className="admin-session-head">
                      <div>
                        <strong>
                          Session {session.session_number} · {session.title}
                        </strong>
                        <p className="dashboard-inline-note">
                          Week {session.week_number} · {session.content_type}
                          {item?.scheduled_at ? ` · ${formatSessionDateTime(item.scheduled_at)}` : ""}
                          {item?.duration_minutes ? ` · ${item.duration_minutes} min` : ""}
                        </p>
                      </div>
                      <div className="admin-session-actions">
                        <span className={`programme-status programme-status-${item?.status ?? "locked"}`}>
                          {item?.status ?? "locked"}
                        </span>
                        {item?.status === "locked" ? (
                          <form action={unlockSessionProgress}>
                            <input type="hidden" name="progressId" value={item.id} />
                            <input type="hidden" name="clientProfileId" value={id} />
                            <button type="submit" className="button button-small button-secondary">
                              Unlock
                            </button>
                          </form>
                        ) : null}
                      </div>
                    </div>

                    {item ? (
                      <details className="admin-programme-details">
                        <summary>{item.recording_url ? "Recording attached" : "Add a recording"}</summary>
                        <form action={adminSaveSessionRecording} className="dashboard-form">
                          <input type="hidden" name="clientProfileId" value={id} />
                          <input type="hidden" name="progressId" value={item.id} />
                          <label className="form-field">
                            <span>Recording URL (anyone with the link)</span>
                            <input
                              type="url"
                              name="recordingUrl"
                              defaultValue={item.recording_url ?? ""}
                              placeholder="https://drive.google.com/..."
                            />
                          </label>
                          <label className="form-field">
                            <span>Label shown to the client</span>
                            <input
                              type="text"
                              name="recordingLabel"
                              defaultValue={item.recording_label ?? ""}
                              placeholder="Session recording"
                            />
                          </label>
                          <button type="submit" className="button button-small button-secondary">
                            Save recording
                          </button>
                        </form>
                      </details>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
