import type { ProgrammeActivityEvent } from "@/types/database";

type ProgrammeProgressTimelineProps = {
  events: ProgrammeActivityEvent[];
  audience: "client" | "admin";
};

const eventLabels: Record<ProgrammeActivityEvent["event_type"], string> = {
  started: "Started",
  viewed: "Viewed",
  saved: "Progress saved",
  completed: "Completed",
  unlocked: "Next step unlocked",
  skipped: "Skipped",
  paused: "Paused",
  resumed: "Resumed",
  safety_flag: "Support flag raised",
  module_completed: "Week completed",
  programme_completed: "Programme completed",
};

export function ProgrammeProgressTimeline({ events, audience }: ProgrammeProgressTimelineProps) {
  const visibleEvents = events.filter((event) => event.event_type !== "viewed").slice(0, 12);

  return (
    <section className="dashboard-panel programme-progress-timeline">
      <div className="dashboard-panel-header">
        <div>
          <p className="eyebrow">Progress history</p>
          <h2>{audience === "admin" ? "Recent client activity" : "Your recent progress"}</h2>
        </div>
        <span className="dashboard-inline-note">
          {events.length} recorded {events.length === 1 ? "event" : "events"}
        </span>
      </div>
      {visibleEvents.length ? (
        <ol className="programme-progress-timeline-list">
          {visibleEvents.map((event) => (
            <li key={event.id} className="programme-progress-timeline-item">
              <span className={`programme-progress-dot is-${event.event_type}`} aria-hidden="true" />
              <div>
                <strong>{eventLabels[event.event_type]}</strong>
                {event.activity_id ? <span className="dashboard-inline-note"> · {event.activity_id}</span> : null}
                <p className="dashboard-inline-note">
                  {new Intl.DateTimeFormat("en-ZA", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Africa/Johannesburg",
                  }).format(new Date(event.occurred_at))}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="dashboard-empty">
          {audience === "admin"
            ? "No server-confirmed progress events yet. This is different from an empty answer."
            : "Your progress history will appear here as you work through the journey."}
        </p>
      )}
    </section>
  );
}
