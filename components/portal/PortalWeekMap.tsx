import Link from "next/link";
import type { WeekMapItem } from "@/lib/portal/courseLoop";

type PortalWeekMapProps = {
  weekNumber: number;
  items: WeekMapItem[];
};

export function PortalWeekMap({ weekNumber, items }: PortalWeekMapProps) {
  if (!items.length) return null;

  const doneCount = items.filter((item) => item.status === "done").length;

  return (
    <section className="portal-week-map dashboard-panel">
      <p className="eyebrow">Week map</p>
      <h2>Week {weekNumber} at a glance</h2>
      <p className="dashboard-inline-note">
        Journey, live sessions, and daily practice belong to one week — not separate courses.
      </p>
      <div className="portal-task-progress" aria-hidden="true">
        <div className="portal-task-progress-bar">
          <span style={{ width: `${Math.round((doneCount / Math.max(items.length, 1)) * 100)}%` }} />
        </div>
        <p className="portal-week-map-count">
          {doneCount} of {items.length} complete
        </p>
      </div>
      <ul className="portal-week-map-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={
              item.status === "done"
                ? "is-done"
                : item.status === "current"
                  ? "is-current"
                  : item.status === "locked"
                    ? "is-locked"
                    : ""
            }
          >
            <div className="portal-week-map-step-marker" aria-hidden="true">
              {item.status === "done" ? "✓" : item.status === "current" ? "→" : "·"}
            </div>
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            {item.href && item.status !== "locked" ? (
              <Link href={item.href} className="button button-small button-secondary">
                {item.statusLabel}
              </Link>
            ) : (
              <span className={`portal-week-map-status${item.status === "locked" ? " is-locked" : ""}`}>
                {item.statusLabel}
              </span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
