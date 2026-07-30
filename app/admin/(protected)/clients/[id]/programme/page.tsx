import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createEnrollment, unlockSessionProgress } from "@/lib/dashboard/programmeActions";
import { adminSaveEnrollmentSchedule, adminSaveSessionRecording } from "@/lib/dashboard/scheduleActions";
import { releaseProgrammeDoc } from "@/lib/dashboard/homeworkActions";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getAdminClientBundle, getClientContentReceipts } from "@/lib/dashboard/queries";
import { PROGRAMME_TIME_SLOTS, PROGRAMME_WEEKDAYS, slotLabel } from "@/lib/programme/schedule";
import { homeworkToneForProgrammeWeek, homeworkFramingCopy } from "@/lib/programme/homework";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ scheduled?: string; recordingSaved?: string; docReleased?: string; error?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client programme | Admin",
    description: "Manage client programme.",
    path: `/admin/clients/${id}/programme/`,
    noIndex: true,
  });
}

export default async function AdminClientProgrammePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { scheduled, recordingSaved, docReleased, error } = await searchParams;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const {
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
  } = bundle;
  const progressBySession = new Map(progress.map((item) => [item.session_id, item]));

  const docReceipts = enrollment
    ? await getClientContentReceipts(id, {
        contentKind: "programme_doc",
        contentIds: programmeDocs.map((doc) => doc.id),
      })
    : [];
  const releasedDocIds = new Set(docReceipts.map((receipt) => receipt.content_id));

  const today = new Date().toISOString().slice(0, 10);
  const entriesByTaskDate = new Map(
    homeworkEntries.map((entry) => [`${entry.task_id}:${entry.entry_date}`, entry]),
  );
  const completedHomework = homeworkEntries.filter((entry) => entry.completed).length;
  const homeworkDays = new Set(homeworkEntries.filter((entry) => entry.completed).map((entry) => entry.entry_date));
  const currentWeek = sessions.find((session) => {
    const item = progressBySession.get(session.id);
    return item && item.status !== "locked" && item.status !== "completed";
  })?.week_number;
  const tone = homeworkToneForProgrammeWeek(currentWeek);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme</p>
        <h1>{template?.title ?? "Assign programme"}</h1>
        <p>
          <Link href={`/admin/clients/${id}/`}>Back to client</Link>
        </p>
      </section>

      {scheduled ? <p className="dashboard-inline-note dashboard-success-note">Schedule updated.</p> : null}
      {recordingSaved ? <p className="dashboard-inline-note dashboard-success-note">Recording link saved.</p> : null}
      {docReleased ? <p className="dashboard-inline-note dashboard-success-note">Programme guide released.</p> : null}
      {error ? <p className="dashboard-inline-note">Could not save that change. Please try again.</p> : null}

      {!enrollment ? (
        <section className="dashboard-panel">
          <h2>Assign programme</h2>
          <form action={createEnrollment} className="dashboard-form">
            <input type="hidden" name="clientProfileId" value={id} />
            <label className="form-field">
              <span>Template</span>
              <select name="templateId" required>
                <option value="">Select template</option>
                {templates.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} ({item.addiction_slug})
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Start date</span>
              <input type="date" name="startDate" />
            </label>
            <button type="submit" className="button button-primary">
              Create enrollment
            </button>
          </form>
        </section>
      ) : (
        <>
          <section className="dashboard-panel">
            <h2>Schedule</h2>
            {schedule ? (
              <p>
                Client chose <strong>{slotLabel(schedule.weekday, schedule.time_slot)}</strong>. First session{" "}
                {formatDashboardDate(schedule.first_session_at)}.{" "}
                <a href={schedule.meet_url} target="_blank" rel="noreferrer">
                  Meet link
                </a>
              </p>
            ) : (
              <p className="dashboard-empty">Client has not chosen a slot yet.</p>
            )}
            <form action={adminSaveEnrollmentSchedule} className="dashboard-form">
              <input type="hidden" name="clientProfileId" value={id} />
              <input type="hidden" name="enrollmentId" value={enrollment.id} />
              <label className="form-field">
                <span>Weekday</span>
                <select name="weekday" required defaultValue={schedule?.weekday ?? ""}>
                  <option value="" disabled>
                    Select day
                  </option>
                  {PROGRAMME_WEEKDAYS.map((day) => (
                    <option key={day.value} value={day.value}>
                      {day.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Time</span>
                <select name="timeSlot" required defaultValue={schedule?.time_slot ?? ""}>
                  <option value="" disabled>
                    Select time
                  </option>
                  {PROGRAMME_TIME_SLOTS.map((slot) => (
                    <option key={slot.value} value={slot.value}>
                      {slot.label}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="button button-secondary">
                {schedule ? "Override schedule" : "Set schedule"}
              </button>
            </form>
          </section>

          <section className="dashboard-panel">
            <h2>Homework compliance</h2>
            <p>
              {completedHomework} completed entries · {homeworkDays.size} active days · {pointsTotal} points
            </p>
            <p className="dashboard-inline-note">{homeworkFramingCopy(tone)}</p>
            {homeworkTasks.length === 0 ? (
              <p className="dashboard-empty">No homework tasks seeded for this template yet.</p>
            ) : (
              <ul className="dashboard-session-list">
                {homeworkTasks.map((task) => {
                  const todayEntry = entriesByTaskDate.get(`${task.id}:${today}`);
                  return (
                    <li key={task.id} className="dashboard-session-item">
                      <div>
                        <strong>{task.title}</strong>
                        <p>
                          {task.task_type} · {task.points} pts · today:{" "}
                          {todayEntry?.completed ? "done" : "not yet"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {programmeDocs.length > 0 ? (
            <section className="dashboard-panel">
              <h2>Programme guides</h2>
              <ul className="dashboard-session-list">
                {programmeDocs.map((doc) => {
                  const released = releasedDocIds.has(doc.id);
                  return (
                    <li key={doc.id} className="dashboard-session-item">
                      <div>
                        <strong>{doc.title}</strong>
                        <p>{released ? "Released to client" : "Not released"}</p>
                      </div>
                      {!released ? (
                        <form action={releaseProgrammeDoc}>
                          <input type="hidden" name="clientProfileId" value={id} />
                          <input type="hidden" name="docId" value={doc.id} />
                          <button type="submit" className="button button-small button-secondary">
                            Release
                          </button>
                        </form>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="dashboard-panel">
            <h2>Sessions</h2>
            <ul className="dashboard-session-list">
              {sessions.map((session) => {
                const item = progressBySession.get(session.id);
                return (
                  <li key={session.id} className="dashboard-session-item">
                    <div>
                      <strong>{session.title}</strong>
                      <p>
                        Week {session.week_number} · {session.content_type} · {item?.status ?? "locked"}
                        {item?.scheduled_at ? ` · ${formatDashboardDate(item.scheduled_at)}` : null}
                        {item?.duration_minutes ? ` · ${item.duration_minutes} min` : null}
                      </p>
                      {item?.recording_url ? (
                        <p className="dashboard-inline-note">
                          Recording:{" "}
                          <a href={item.recording_url} target="_blank" rel="noreferrer">
                            {item.recording_label || "Open link"}
                          </a>
                        </p>
                      ) : null}
                      {item ? (
                        <form action={adminSaveSessionRecording} className="dashboard-form">
                          <input type="hidden" name="clientProfileId" value={id} />
                          <input type="hidden" name="progressId" value={item.id} />
                          <label className="form-field">
                            <span>Recording URL</span>
                            <input
                              type="url"
                              name="recordingUrl"
                              defaultValue={item.recording_url ?? ""}
                              placeholder="https://drive.google.com/..."
                            />
                          </label>
                          <label className="form-field">
                            <span>Label</span>
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
                      ) : null}
                    </div>
                    {item?.status === "locked" ? (
                      <form action={unlockSessionProgress}>
                        <input type="hidden" name="progressId" value={item.id} />
                        <input type="hidden" name="clientProfileId" value={id} />
                        <button type="submit" className="button button-small button-secondary">
                          Unlock
                        </button>
                      </form>
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
