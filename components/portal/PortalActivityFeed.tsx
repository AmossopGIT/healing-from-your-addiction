import Link from "next/link";
import { groupPortalActivity, type PortalActivityItem } from "@/lib/portal/activityFeed";

type PortalActivityFeedProps = {
  items: PortalActivityItem[];
};

export function PortalActivityFeed({ items }: PortalActivityFeedProps) {
  const groups = groupPortalActivity(items);

  return (
    <section className="portal-home-activity dashboard-panel">
      <h2>Recent activity</h2>
      {groups.length ? (
        <div className="portal-home-activity-groups">
          {groups.map((group) => (
            <div key={group.dayKey} className="portal-home-activity-group">
              <h3>{group.dayLabel}</h3>
              <ul className="portal-home-activity-list">
                {group.items.map((item) => (
                  <li key={item.id}>
                    {item.href ? (
                      <Link href={item.href} className="portal-home-activity-link">
                        <strong>{item.label}</strong>
                        {item.detail ? <span>{item.detail}</span> : null}
                      </Link>
                    ) : (
                      <div className="portal-home-activity-link">
                        <strong>{item.label}</strong>
                        {item.detail ? <span>{item.detail}</span> : null}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p className="dashboard-empty">Your recent portal activity will appear here as you check in, open sessions, and message Gerald.</p>
      )}
    </section>
  );
}
