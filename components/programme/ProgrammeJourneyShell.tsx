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

function statusLabel(status: string, audience: "client" | "admin") {
  if (audience === "admin") {
    switch (status) {
      case "completed":
        return "Completed";
      case "in_progress":
        return "In progress";
      case "available":
        return "Available";
      case "skipped":
        return "Skipped";
      case "locked":
        return "Locked";
      default:
        return status;
    }
  }

  switch (status) {
    case "completed":
      return "Done";
    case "in_progress":
      return "In progress";
    case "available":
      return "Ready";
    case "skipped":
      return "Skipped";
    case "locked":
      return "Unlocks later";
    default:
      return "Upcoming";
  }
}

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
  const activities = definition.activities.slice().sort((a, b) => a.sortOrder - b.sortOrder);
  const activeActivityId = currentActivityId || summary.currentActivity?.id;
  const isAdmin = audience === "admin";

  return (
    <div className="programme-journey-shell">
      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{isAdmin ? "Client journey" : "Journey progress"}</p>
          <p className="admin-programme-stat-value">{summary.percentComplete}%</p>
          <p className="dashboard-inline-note">
            {summary.completedActivities} of {summary.totalActivities}{" "}
            {isAdmin ? "activities completed" : "steps complete"}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{isAdmin ? "Client week" : "Current week"}</p>
          <p className="admin-programme-stat-value">{summary.currentWeek ?? "—"}</p>
          <p className="dashboard-inline-note">
            {summary.currentDay ? `Day ${summary.currentDay}` : "Orientation / focus"}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{isAdmin ? "Practice points" : "Practice points"}</p>
          <p className="admin-programme-stat-value">{pointsTotal}</p>
          <p className="dashboard-inline-note">
            {isAdmin ? "From client daily practice" : "Earned through daily practice"}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">{isAdmin ? "Current client step" : "Continue here"}</p>
          <p className="admin-programme-stat-value programme-next-step-title">
            {summary.currentActivity ? activityLabel(summary.currentActivity) : "Complete"}
          </p>
          {summary.currentActivity && audience === "client" ? (
            <p className="dashboard-inline-note">
              <Link href={`/portal/programme/journey/${summary.currentActivity.id}/`}>Continue journey</Link>
            </p>
          ) : summary.currentActivity && isAdmin && clientProfileId ? (
            <p className="dashboard-inline-note">
              <Link href={`/admin/clients/${clientProfileId}/programme/#activity-${summary.currentActivity.id}`}>
                Review client activity
              </Link>
            </p>
          ) : null}
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <div>
            <p className="eyebrow">{isAdmin ? "Client journey map" : "Your week-by-week path"}</p>
            <h2>{isAdmin ? "Modules and activities" : "Weekly modules"}</h2>
          </div>
          <span className="dashboard-inline-note">
            {summary.completedActivities} of {summary.totalActivities} complete
          </span>
        </div>
        <p className="dashboard-inline-note">
          {isAdmin
            ? "Follow the highlighted current step. Unlock or skip from the activity list when needed."
            : "Follow the highlighted step. Completed activities stay available for review; later steps unlock as you go."}
        </p>
        <div className="programme-module-grid">
          {definition.modules.map((module) => {
            const moduleActivities = activities.filter((activity) => activity.moduleId === module.id);
            const completed = moduleActivities.filter((activity) => progressById.get(activity.id)?.status === "completed").length;
            const moduleHasCurrent = moduleActivities.some((activity) => activity.id === activeActivityId);
            return (
              <article key={module.id} className={`programme-module-card${moduleHasCurrent ? " is-current" : ""}`}>
                <p className="eyebrow">Week {module.number}</p>
                <h3>{module.title}</h3>
                <p>{module.theme}</p>
                <p className="dashboard-inline-note">
                  {completed}/{moduleActivities.length} complete
                </p>
                <ul className="programme-module-activities">
                  {moduleActivities.map((activity) => {
                    const progress = progressById.get(activity.id);
                    const status = progress?.status ?? "locked";
                    const isCurrent = activity.id === activeActivityId;
                    const canOpen = audience === "admin" || status !== "locked";
                    const href =
                      audience === "client"
                        ? `/portal/programme/journey/${activity.id}/`
                        : clientProfileId
                          ? `/admin/clients/${clientProfileId}/programme/#journey-activity-${activity.id}`
                          : undefined;
                    return (
                      <li key={activity.id} className={isCurrent ? "is-current" : undefined}>
                        <span className={`programme-module-activity-marker is-${status}`} aria-hidden="true" />
                        {canOpen && href ? (
                          <Link href={href} aria-current={isCurrent ? "step" : undefined}>
                            {activityLabel(activity)}
                          </Link>
                        ) : (
                          <span>{activityLabel(activity)}</span>
                        )}
                        <small>
                          {isCurrent
                            ? isAdmin
                              ? "Current client step"
                              : "Continue here"
                            : statusLabel(status, audience)}
                        </small>
                      </li>
                    );
                  })}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {isAdmin ? (
        <section className="dashboard-panel" id="journey-activities">
          <h2>Activity review list</h2>
          <ul className="dashboard-session-list">
            {definition.activities
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((activity) => {
                const progress = progressById.get(activity.id);
                const status = progress?.status ?? "locked";
                const href = clientProfileId
                  ? `/admin/clients/${clientProfileId}/programme/#journey-activity-${activity.id}`
                  : undefined;
                return (
                  <li key={activity.id} id={`journey-activity-${activity.id}`} className="dashboard-session-item">
                    <div>
                      <strong>{activityLabel(activity)}</strong>
                      <p className="dashboard-inline-note">
                        {activity.type.replace(/_/g, " ")}
                        {progress?.shared_with_admin ? " · shared with admin" : ""}
                      </p>
                    </div>
                    <div className="admin-session-actions">
                      <span className={`programme-status programme-status-${status === "skipped" ? "locked" : status}`}>
                        {statusLabel(status, "admin")}
                      </span>
                      {href ? (
                        <Link href={href} className="button button-small button-secondary">
                          Review
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
