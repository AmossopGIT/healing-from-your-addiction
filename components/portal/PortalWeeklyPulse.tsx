import type { ClientDailyCheckIn } from "@/types/database";

type PortalWeeklyPulseProps = {
  recentCheckIns: ClientDailyCheckIn[];
  pauseCountThisWeek: number;
  engagementStreak: number;
};

const moodLabels: Record<ClientDailyCheckIn["mood"], string> = {
  calm: "Calm",
  steady: "Steady",
  low: "Low",
  anxious: "Anxious",
  irritable: "Irritable",
};

export function PortalWeeklyPulse({ recentCheckIns, pauseCountThisWeek, engagementStreak }: PortalWeeklyPulseProps) {
  const weekCheckIns = recentCheckIns.slice(0, 7).reverse();
  const averageCraving = weekCheckIns.length
    ? (weekCheckIns.reduce((sum, checkIn) => sum + checkIn.craving_level, 0) / weekCheckIns.length).toFixed(1)
    : "—";

  return (
    <section className="portal-home-weekly-pulse dashboard-panel">
      <h2>Your week at a glance</h2>
      <div className="portal-home-pulse-stats">
        <div className="portal-home-pulse-stat">
          <span className="portal-home-pulse-label">Check-ins</span>
          <strong>{weekCheckIns.length}</strong>
        </div>
        <div className="portal-home-pulse-stat">
          <span className="portal-home-pulse-label">Pauses logged</span>
          <strong>{pauseCountThisWeek}</strong>
        </div>
        <div className="portal-home-pulse-stat">
          <span className="portal-home-pulse-label">Rhythm streak</span>
          <strong>{engagementStreak > 0 ? engagementStreak : "—"}</strong>
        </div>
        <div className="portal-home-pulse-stat">
          <span className="portal-home-pulse-label">Avg craving</span>
          <strong>{averageCraving}</strong>
        </div>
      </div>
      {weekCheckIns.length ? (
        <ul className="portal-home-pulse-list">
          {weekCheckIns.map((checkIn) => (
            <li key={checkIn.id}>
              <span>{checkIn.check_in_date}</span>
              <span>{moodLabels[checkIn.mood]}</span>
              <span>Craving {checkIn.craving_level}/5</span>
              {checkIn.pause_taken ? <span className="portal-home-pulse-pause">Pause</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="dashboard-inline-note">Your weekly pulse will build as you complete daily check-ins.</p>
      )}
    </section>
  );
}
