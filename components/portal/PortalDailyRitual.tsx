import Link from "next/link";
import type { DailyAffirmation } from "@/lib/portal/dailyAffirmation";
import type { PortalNextStep } from "@/lib/portal/nextStep";
import type { ClientDailyCheckIn } from "@/types/database";
import { PortalCheckInForm } from "@/components/portal/PortalCheckInForm";

type PortalDailyRitualProps = {
  dailyAffirmation: DailyAffirmation | null;
  affirmationNote: string | null;
  todayCheckIn: ClientDailyCheckIn | null;
  nextStep: PortalNextStep;
  showCheckIn: boolean;
};

export function PortalDailyRitual({
  dailyAffirmation,
  affirmationNote,
  todayCheckIn,
  nextStep,
  showCheckIn,
}: PortalDailyRitualProps) {
  return (
    <section className="portal-home-ritual dashboard-panel" id="daily-check-in">
      <h2>Daily ritual</h2>
      <p className="dashboard-inline-note">Three small steps you can finish in under a minute.</p>
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

        <article className="portal-home-ritual-card">
          <p className="eyebrow">Micro-action</p>
          <h3>One small step</h3>
          <p>{nextStep.description}</p>
          <Link href={nextStep.href} className="button button-secondary button-small">
            {nextStep.buttonLabel}
          </Link>
        </article>
      </div>
    </section>
  );
}
