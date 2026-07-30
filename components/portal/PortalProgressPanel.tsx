type ProgressRingProps = {
  label: string;
  value: string;
  progress: number;
  accent?: "teal" | "gold" | "neutral";
};

function ProgressRing({ label, value, progress, accent = "teal" }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const degrees = clamped * 360;

  return (
    <div className={`portal-home-ring portal-home-ring-${accent}`}>
      <div
        className="portal-home-ring-chart"
        style={{ background: `conic-gradient(var(--ring-color) ${degrees}deg, var(--ring-track) 0deg)` }}
        aria-hidden="true"
      >
        <div className="portal-home-ring-inner">
          <strong>{value}</strong>
        </div>
      </div>
      <span className="portal-home-ring-label">{label}</span>
    </div>
  );
}

type PortalProgressPanelProps = {
  completedSessionCount: number;
  availableSessionCount: number;
  engagementStreak: number;
  pauseCountThisWeek: number;
  abstinenceDays: number;
  showAbstinence: boolean;
  pointsTotal?: number;
  milestones: Array<{ id: string; label: string; achieved: boolean }>;
};

export function PortalProgressPanel({
  completedSessionCount,
  availableSessionCount,
  engagementStreak,
  pauseCountThisWeek,
  abstinenceDays,
  showAbstinence,
  pointsTotal = 0,
  milestones,
}: PortalProgressPanelProps) {
  const programmeProgress = availableSessionCount > 0 ? completedSessionCount / availableSessionCount : 0;
  const rhythmProgress = Math.min(engagementStreak / 7, 1);
  const pauseProgress = Math.min(pauseCountThisWeek / 7, 1);
  const abstinenceProgress = showAbstinence ? Math.min(abstinenceDays / 30, 1) : 0;
  const pointsProgress = Math.min(pointsTotal / 100, 1);

  return (
    <section className="portal-home-progress dashboard-panel">
      <h2>Your progress</h2>
      <div className="portal-home-ring-grid">
        {availableSessionCount > 0 ? (
          <ProgressRing
            label="Programme"
            value={`${completedSessionCount}/${availableSessionCount}`}
            progress={programmeProgress}
          />
        ) : null}
        <ProgressRing label="Rhythm" value={engagementStreak > 0 ? String(engagementStreak) : "—"} progress={rhythmProgress} />
        <ProgressRing label="Pauses this week" value={String(pauseCountThisWeek)} progress={pauseProgress} accent="gold" />
        {pointsTotal > 0 || availableSessionCount > 0 ? (
          <ProgressRing label="Practice points" value={String(pointsTotal)} progress={pointsProgress} accent="gold" />
        ) : null}
        {showAbstinence ? (
          <ProgressRing label="Days tracked" value={String(abstinenceDays)} progress={abstinenceProgress} accent="neutral" />
        ) : null}
      </div>
      <div className="portal-home-milestones">
        {milestones.map((milestone) => (
          <span
            key={milestone.id}
            className={`portal-home-milestone${milestone.achieved ? " is-achieved" : ""}`}
          >
            {milestone.label}
          </span>
        ))}
      </div>
    </section>
  );
}
