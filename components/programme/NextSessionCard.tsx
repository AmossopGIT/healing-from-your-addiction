import Link from "next/link";
import {
  formatSessionDateTime,
  relativeSessionLabel,
  type ProgrammeCalendarEntry,
} from "@/lib/programme/schedule";

type NextSessionCardProps = {
  entry: ProgrammeCalendarEntry | null;
  meetUrl: string | null;
  calendarHref?: string;
};

export function NextSessionCard({ entry, meetUrl, calendarHref }: NextSessionCardProps) {
  if (!entry?.scheduledAt) {
    return (
      <section className="dashboard-panel programme-next">
        <p className="eyebrow">Next session</p>
        <h2>All sessions complete</h2>
        <p className="dashboard-inline-note">
          There is nothing scheduled right now. Gerald will be in touch about what comes next.
        </p>
      </section>
    );
  }

  const scheduledAt = entry.scheduledAt;
  const isToday = relativeSessionLabel(scheduledAt) === "Today";

  return (
    <section className={`dashboard-panel programme-next${isToday ? " is-today" : ""}`}>
      <p className="eyebrow">Next session</p>
      <h2>
        Session {entry.sessionNumber} · {entry.title}
      </h2>
      <p className="programme-next-when">
        <strong>{relativeSessionLabel(scheduledAt)}</strong>
        <span>{formatSessionDateTime(scheduledAt)}</span>
        {entry.durationMinutes ? <span>{entry.durationMinutes} minutes</span> : null}
      </p>

      <div className="programme-next-actions">
        {meetUrl ? (
          <a href={meetUrl} target="_blank" rel="noreferrer" className="button button-primary button-small">
            Join on Google Meet
          </a>
        ) : null}
        {entry.href ? (
          <Link href={entry.href} className="button button-secondary button-small">
            Open session
          </Link>
        ) : null}
        {calendarHref ? (
          <a href={calendarHref} className="button button-secondary button-small" download>
            Add to my calendar
          </a>
        ) : null}
      </div>

      <p className="dashboard-inline-note">
        The Meet link stays the same for every session, so you can save it once.
      </p>
    </section>
  );
}
