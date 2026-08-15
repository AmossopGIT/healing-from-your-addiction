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

  return (
    <section className="portal-pre-course dashboard-panel">
      <p className="eyebrow">Pre-course</p>
      <h2>{title}</h2>
      <p className="dashboard-inline-note">{intro}</p>
      <p className="portal-pre-course-count">
        {remaining === 0 ? "All set — waiting for assignment." : `${remaining} step${remaining === 1 ? "" : "s"} still open`}
      </p>
      <ul className="portal-pre-course-list">
        {items.map((item) => (
          <li key={item.id} className={item.done ? "is-complete" : ""}>
            <div>
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            {item.done ? (
              <span className="portal-pre-course-status">Done</span>
            ) : (
              <Link href={item.href} className="button button-small button-secondary">
                Continue
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
