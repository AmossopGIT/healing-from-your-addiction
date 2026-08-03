import Link from "next/link";
import {
  formatSessionDayNumber,
  formatSessionMonth,
  formatSessionTime,
  groupEntriesByWeek,
  relativeSessionLabel,
  type ProgrammeCalendarEntry,
} from "@/lib/programme/schedule";
import type { SessionProgressStatus } from "@/types/database";

const statusLabels: Record<SessionProgressStatus, string> = {
  locked: "Locked",
  available: "Ready",
  in_progress: "In progress",
  completed: "Completed",
};

const weekTone: Record<number, string> = {
  1: "Settling in",
  2: "Going deeper",
  3: "Integrating",
  4: "Consolidating",
};

type ProgrammeCalendarProps = {
  entries: ProgrammeCalendarEntry[];
  nextSessionId?: string | null;
  emptyMessage?: string;
  /** Admins see locked sessions as normal rows; clients see them dimmed and unclickable. */
  audience?: "client" | "admin";
};

export function ProgrammeCalendar({
  entries,
  nextSessionId,
  emptyMessage = "Session dates appear once a slot is chosen.",
  audience = "client",
}: ProgrammeCalendarProps) {
  const scheduled = entries.filter((entry) => entry.scheduledAt);

  if (scheduled.length === 0) {
    return <p className="dashboard-empty">{emptyMessage}</p>;
  }

  const weeks = groupEntriesByWeek(scheduled);
  const monthLabel = formatSessionMonth(scheduled[0].scheduledAt as string);
  const lastMonthLabel = formatSessionMonth(scheduled[scheduled.length - 1].scheduledAt as string);

  return (
    <div className="programme-calendar">
      <p className="programme-calendar-range">
        {monthLabel === lastMonthLabel ? monthLabel : `${monthLabel} – ${lastMonthLabel}`}
        <span> · all times South African time</span>
      </p>

      {weeks.map((week) => (
        <section key={week.weekNumber} className="programme-calendar-week">
          <header className="programme-calendar-week-header">
            <span className="programme-calendar-week-label">Week {week.weekNumber}</span>
            {weekTone[week.weekNumber] ? (
              <span className="programme-calendar-week-tone">{weekTone[week.weekNumber]}</span>
            ) : null}
          </header>

          <ul className="programme-calendar-days">
            {week.entries.map((entry) => {
              const scheduledAt = entry.scheduledAt as string;
              const isNext = nextSessionId === entry.id;
              const isLocked = entry.status === "locked";
              const clickable = Boolean(entry.href) && (audience === "admin" || !isLocked);

              const body = (
                <>
                  <span className="programme-calendar-date" aria-hidden="true">
                    <strong>{formatSessionDayNumber(scheduledAt)}</strong>
                    <span>{formatSessionTime(scheduledAt)}</span>
                  </span>
                  <span className="programme-calendar-detail">
                    <span className="programme-calendar-session">Session {entry.sessionNumber}</span>
                    <span className="programme-calendar-title">{entry.title}</span>
                    <span className="programme-calendar-meta">
                      {relativeSessionLabel(scheduledAt)}
                      {entry.durationMinutes ? ` · ${entry.durationMinutes} min` : null}
                    </span>
                  </span>
                  <span className={`programme-status programme-status-${entry.status}`}>
                    {statusLabels[entry.status]}
                  </span>
                </>
              );

              const className = [
                "programme-calendar-day",
                isNext ? "is-next" : "",
                isLocked ? "is-locked" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <li key={entry.id}>
                  {clickable ? (
                    <Link href={entry.href as string} className={`${className} is-clickable`}>
                      {body}
                    </Link>
                  ) : (
                    <div className={className}>{body}</div>
                  )}
                  {entry.recordingUrl ? (
                    <a
                      className="programme-calendar-recording"
                      href={entry.recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Recording available
                    </a>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
