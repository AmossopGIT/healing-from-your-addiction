import Link from "next/link";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import type { ClientActivityProgress } from "@/types/database";
import { activityLabel } from "@/lib/programme/interactive/content";
import { summarizeJourney } from "@/lib/programme/interactive/progress";

type ProgrammeJourneyShellProps = {
  definition: InteractiveProgrammeDefinition;
  progressRows: ClientActivityProgress[];
  currentActivityId?: string | null;
  pointsTotal: number;
  audience?: "client" | "admin";
  clientProfileId?: string;
};

export function ProgrammeJourneyShell({
  definition,
  progressRows,
  currentActivityId,
  pointsTotal,
  audience = "client",
  clientProfileId,
}: ProgrammeJourneyShellProps) {
  const summary = summarizeJourney(definition, progressRows, currentActivityId);
  const progressById = new Map(progressRows.map((row) => [row.activity_id, row]));

  return (
    <div className="programme-journey-shell">
      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Journey progress</p>
          <p className="admin-programme-stat-value">{summary.percentComplete}%</p>
          <p className="dashboard-inline-note">
            {summary.completedActivities} of {summary.totalActivities} activities
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Current week</p>
          <p className="admin-programme-stat-value">{summary.currentWeek ?? "—"}</p>
          <p className="dashboard-inline-note">
            {summary.currentDay ? `Day ${summary.currentDay}` : "Orientation / focus"}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Practice points</p>
          <p className="admin-programme-stat-value">{pointsTotal}</p>
          <p className="dashboard-inline-note">Earned through daily practice</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Next step</p>
          <p className="admin-programme-stat-value programme-next-step-title">
            {summary.currentActivity ? activityLabel(summary.currentActivity) : "Complete"}
          </p>
          {summary.currentActivity && audience === "client" ? (
            <p className="dashboard-inline-note">
              <Link href={`/portal/programme/journey/${summary.currentActivity.id}/`}>Continue journey</Link>
            </p>
          ) : null}
        </article>
      </section>

      <section className="dashboard-panel">
        <h2>Weekly modules</h2>
        <div className="programme-module-grid">
          {definition.modules.map((module) => {
            const moduleActivities = definition.activities.filter((activity) => activity.moduleId === module.id);
            const completed = moduleActivities.filter((activity) => progressById.get(activity.id)?.status === "completed").length;
            return (
              <article key={module.id} className="programme-module-card">
                <p className="eyebrow">Week {module.number}</p>
                <h3>{module.title}</h3>
                <p>{module.theme}</p>
                <p className="dashboard-inline-note">
                  {completed}/{moduleActivities.length} complete
                </p>
                <ul className="programme-focus-list">
                  {module.focus.slice(0, 3).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Activity path</h2>
        <ul className="dashboard-session-list">
          {definition.activities
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((activity) => {
              const progress = progressById.get(activity.id);
              const status = progress?.status ?? "locked";
              const href =
                audience === "client"
                  ? `/portal/programme/journey/${activity.id}/`
                  : clientProfileId
                    ? `/admin/clients/${clientProfileId}/programme/#activity-${activity.id}`
                    : undefined;
              const canOpen = audience === "admin" || status !== "locked";
              return (
                <li key={activity.id} id={`activity-${activity.id}`} className="dashboard-session-item">
                  <div>
                    <strong>{activityLabel(activity)}</strong>
                    <p className="dashboard-inline-note">
                      {activity.type.replace(/_/g, " ")}
                      {progress?.shared_with_admin ? " · shared with admin" : ""}
                    </p>
                  </div>
                  <div className="admin-session-actions">
                    <span className={`programme-status programme-status-${status === "skipped" ? "locked" : status}`}>
                      {status}
                    </span>
                    {canOpen && href ? (
                      <Link href={href} className="button button-small button-secondary">
                        {audience === "admin" ? "Review" : status === "completed" ? "Review" : "Open"}
                      </Link>
                    ) : null}
                  </div>
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}
