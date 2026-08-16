import { formatDashboardDate } from "@/lib/dashboard/constants";
import type { ClientJourneySnapshot } from "@/lib/portal/courseLoop";

type AdminJourneySnapshotProps = {
  snapshot: ClientJourneySnapshot;
  compact?: boolean;
};

export function AdminJourneySnapshot({ snapshot, compact = false }: AdminJourneySnapshotProps) {
  const passwordLabel =
    snapshot.passwordSet === true
      ? "Password set"
      : snapshot.passwordSet === false
        ? "Password not set yet"
        : "Password status unknown";

  const intakeLabel = snapshot.intakeComplete
    ? `Intake complete (${snapshot.intakeAnswered}/${snapshot.intakeTotal || snapshot.intakeAnswered})`
    : snapshot.intakeTotal > 0
      ? `Intake ${snapshot.intakeAnswered}/${snapshot.intakeTotal}`
      : snapshot.intakeAnswered > 0
        ? `Intake ${snapshot.intakeAnswered} answered`
        : "Intake not started";

  return (
    <div className={`admin-journey-snapshot${compact ? " is-compact" : ""}`}>
      <div className="admin-journey-snapshot-header">
        <p className="eyebrow">Journey snapshot</p>
        <span className="status-badge status-badge-intake-in-progress">{snapshot.stageLabel}</span>
      </div>
      <ul className="admin-journey-snapshot-list">
        <li>
          {snapshot.inviteSent
            ? `Invite sent${snapshot.inviteSentAt ? ` · ${formatDashboardDate(snapshot.inviteSentAt)}` : ""}`
            : "Invite not sent"}
        </li>
        <li>{passwordLabel}</li>
        <li>{snapshot.onboarded ? "Onboarded" : "Not onboarded yet"}</li>
        <li>{intakeLabel}</li>
        {snapshot.weekNumber ? <li>Current week {snapshot.weekNumber}</li> : null}
        <li>{snapshot.nextStepSentence}</li>
        <li>
          Last activity:{" "}
          {snapshot.lastActivityAt ? formatDashboardDate(snapshot.lastActivityAt) : "No activity yet"}
        </li>
        {snapshot.openFlagCount > 0 ? <li>{snapshot.openFlagCount} open flag(s)</li> : null}
      </ul>
    </div>
  );
}
