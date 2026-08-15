import Link from "next/link";
import type { WeekMapItem } from "@/lib/portal/courseLoop";

type PortalWeekMapProps = {
  weekNumber: number;
  items: WeekMapItem[];
};

export function PortalWeekMap({ weekNumber, items }: PortalWeekMapProps) {
  if (!items.length) return null;

  return (
    <section className="portal-week-map dashboard-panel">
      <p className="eyebrow">Week map</p>
      <h2>Week {weekNumber} at a glance</h2>
      <p className="dashboard-inline-note">
        Journey, live sessions, and daily practice belong to one week — not separate courses.
      </p>
      <ul className="portal-week-map-list">
        {items.map((item) => (
          <li
            key={item.id}
            className={item.status === "done" ? "is-done" : item.status === "current" ? "is-current" : ""}
          >
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
            {item.href && item.status !== "locked" ? (
              <Link href={item.href} className="button button-small button-secondary">
                {item.statusLabel}
              </Link>
            ) : (
              <span className="portal-week-map-status">{item.statusLabel}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
