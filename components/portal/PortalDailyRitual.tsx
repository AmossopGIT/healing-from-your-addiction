import Link from "next/link";
import type { DailyAffirmation } from "@/lib/portal/dailyAffirmation";
import type { PortalNextStep } from "@/lib/portal/nextStep";
import type { ClientDailyCheckIn, ClientHomeworkEntry, HomeworkTone, ProgrammeHomeworkTask } from "@/types/database";
import { PortalCheckInForm } from "@/components/portal/PortalCheckInForm";
import { toggleHomeworkTask } from "@/lib/dashboard/homeworkActions";
import { homeworkFramingCopy } from "@/lib/programme/homework";

type PortalDailyRitualProps = {
  dailyAffirmation: DailyAffirmation | null;
  affirmationNote: string | null;
  todayCheckIn: ClientDailyCheckIn | null;
  nextStep: PortalNextStep;
  showCheckIn: boolean;
  homeworkTasks?: ProgrammeHomeworkTask[];
  todayHomeworkEntries?: ClientHomeworkEntry[];
  homeworkTone?: HomeworkTone;
  pointsTotal?: number;
};

export function PortalDailyRitual({
  dailyAffirmation,
  affirmationNote,
  todayCheckIn,
  nextStep,
  showCheckIn,
  homeworkTasks = [],
  todayHomeworkEntries = [],
  homeworkTone = "standard",
  pointsTotal = 0,
}: PortalDailyRitualProps) {
  const entryByTask = new Map(todayHomeworkEntries.map((entry) => [entry.task_id, entry]));
  const dailyTasks = homeworkTasks.filter((task) => task.cadence === "daily");

  return (
    <section className="portal-home-ritual dashboard-panel" id="daily-check-in">
      <h2>Daily ritual</h2>
      <p className="dashboard-inline-note">
        {homeworkFramingCopy(homeworkTone)}
        {pointsTotal > 0 ? ` · ${pointsTotal} practice points` : null}
      </p>
      <div className="portal-home-ritual-grid">
        {showCheckIn ? (
          <article className="portal-home-ritual-card">
            <div className="portal-home-ritual-card-header">
              <p className="eyebrow">Check-in</p>
              {todayCheckIn ? <span className="portal-home-ritual-done">Done today</span> : null}
            </div>
            <h3>How are you right now?</h3>
            <PortalCheckInForm todayCheckIn={todayCheckIn} />
          </article>
        ) : null}

        <article className="portal-home-ritual-card">
          <p className="eyebrow">Affirmation</p>
          <h3>Today's line</h3>
          {dailyAffirmation ? (
            <>
              <blockquote className="portal-home-affirmation">{dailyAffirmation.text}</blockquote>
              <p className="dashboard-inline-note">{dailyAffirmation.sectionTitle}</p>
              {affirmationNote ? <p className="portal-home-affirmation-note">{affirmationNote}</p> : null}
            </>
          ) : (
            <p className="dashboard-empty">Your daily affirmation will appear once your support focus is set.</p>
          )}
        </article>

        {dailyTasks.length > 0 ? (
          <article className="portal-home-ritual-card">
            <p className="eyebrow">Practice</p>
            <h3>Today's ticks</h3>
            <ul className="dashboard-session-list">
              {dailyTasks.map((task) => {
                const entry = entryByTask.get(task.id);
                const done = Boolean(entry?.completed);
                return (
                  <li key={task.id} className="dashboard-session-item">
                    <div>
                      <strong>{task.title}</strong>
                      <p>{done ? `Done · +${entry?.points_awarded ?? task.points} pts` : `${task.points} pts`}</p>
                    </div>
                    <form action={toggleHomeworkTask}>
                      <input type="hidden" name="taskId" value={task.id} />
                      <input type="hidden" name="completed" value={done ? "false" : "true"} />
                      <input type="hidden" name="redirectTo" value="/portal/" />
                      <button type="submit" className="button button-small button-secondary">
                        {done ? "Undo" : "Mark done"}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </article>
        ) : (
          <article className="portal-home-ritual-card">
            <p className="eyebrow">Micro-action</p>
            <h3>One small step</h3>
            <p>{nextStep.description}</p>
            <Link href={nextStep.href} className="button button-secondary button-small">
              {nextStep.buttonLabel}
            </Link>
          </article>
        )}
      </div>
    </section>
  );
}
