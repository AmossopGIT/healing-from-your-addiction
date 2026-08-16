import Link from "next/link";
import type { PreCourseChecklistItem } from "@/lib/portal/courseLoop";

type PortalPreCourseChecklistProps = {
  items: PreCourseChecklistItem[];
  title?: string;
  intro?: string;
};

export function PortalPreCourseChecklist({
  items,
  title = "Before your course starts",
  intro = "Complete these steps. Gerald assigns your programme after intake and consultation are ready.",
}: PortalPreCourseChecklistProps) {
  const remaining = items.filter((item) => !item.done).length;
  const doneCount = items.filter((item) => item.done).length;

  return (
    <section className="portal-pre-course dashboard-panel">
      <p className="eyebrow">Pre-course</p>
      <h2>{title}</h2>
      <p className="dashboard-inline-note">{intro}</p>
      <div className="portal-task-progress" aria-hidden="true">
        <div className="portal-task-progress-bar">
          <span style={{ width: `${Math.round((doneCount / Math.max(items.length, 1)) * 100)}%` }} />
        </div>
        <p className="portal-pre-course-count">
          {remaining === 0
            ? "All set — waiting for assignment."
            : `${doneCount} of ${items.length} complete · ${remaining} still open`}
        </p>
      </div>
      <ul className="portal-pre-course-list">
        {items.map((item) => {
          const statusClass = item.done ? "is-complete" : item.href ? "is-current" : "is-waiting";
          return (
            <li key={item.id} className={statusClass}>
              <div className="portal-pre-course-step-marker" aria-hidden="true">
                {item.done ? "✓" : item.href ? "→" : "…"}
              </div>
              <div>
                <strong>{item.label}</strong>
                <p>{item.detail}</p>
              </div>
              {item.done ? (
                <span className="portal-pre-course-status">Done</span>
              ) : item.href ? (
                <Link href={item.href} className="button button-small button-secondary">
                  Continue
                </Link>
              ) : (
                <span className="portal-pre-course-status is-waiting">Waiting</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
