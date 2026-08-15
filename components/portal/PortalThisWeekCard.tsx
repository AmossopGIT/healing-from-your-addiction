import Link from "next/link";
import type { ThisWeekModel } from "@/lib/portal/courseLoop";

type PortalThisWeekCardProps = {
  thisWeek: ThisWeekModel;
};

export function PortalThisWeekCard({ thisWeek }: PortalThisWeekCardProps) {
  return (
    <section className="portal-this-week dashboard-panel">
      <div className="portal-this-week-header">
        <p className="eyebrow">This week</p>
        <p className="portal-this-week-badge">Week {thisWeek.weekNumber}</p>
      </div>
      <h2>{thisWeek.headline}</h2>
      <p>{thisWeek.summary}</p>

      <ul className="portal-this-week-meta">
        {thisWeek.journeyTitle ? (
          <li>
            <span className="portal-this-week-meta-label">Journey</span>
            {thisWeek.journeyHref ? (
              <Link href={thisWeek.journeyHref}>{thisWeek.journeyTitle}</Link>
            ) : (
              <span>{thisWeek.journeyTitle}</span>
            )}
          </li>
        ) : null}
        {thisWeek.sessionTitle ? (
          <li>
            <span className="portal-this-week-meta-label">Live session</span>
            {thisWeek.sessionHref ? (
              <Link href={thisWeek.sessionHref}>{thisWeek.sessionTitle}</Link>
            ) : (
              <span>{thisWeek.sessionTitle}</span>
            )}
          </li>
        ) : null}
        {thisWeek.sessionLockedReason ? (
          <li className="portal-this-week-locked">{thisWeek.sessionLockedReason}</li>
        ) : null}
        <li>
          <span className="portal-this-week-meta-label">Check-in</span>
          <span>{thisWeek.checkInDone ? "Done today" : "Still open"}</span>
        </li>
        {thisWeek.practiceTotalCount > 0 ? (
          <li>
            <span className="portal-this-week-meta-label">Practice</span>
            <span>
              {thisWeek.practiceDoneCount}/{thisWeek.practiceTotalCount} today
            </span>
          </li>
        ) : null}
        {thisWeek.remainingLiveSessions > 0 ? (
          <li>
            <span className="portal-this-week-meta-label">Live track</span>
            <span>
              {thisWeek.remainingLiveSessions} session
              {thisWeek.remainingLiveSessions === 1 ? "" : "s"} remaining
            </span>
          </li>
        ) : null}
      </ul>

      <Link href={thisWeek.primaryHref} className="button button-primary button-small">
        {thisWeek.primaryLabel}
      </Link>
    </section>
  );
}
