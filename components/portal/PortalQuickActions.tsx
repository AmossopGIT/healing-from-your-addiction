import Link from "next/link";

type PortalQuickActionsProps = {
  nextSessionHref: string | null;
  nextSessionLabel: string | null;
  showPauseAction?: boolean;
};

export function PortalQuickActions({ nextSessionHref, nextSessionLabel, showPauseAction = true }: PortalQuickActionsProps) {
  return (
    <section className="portal-home-quick-actions dashboard-panel">
      <h2>Quick actions</h2>
      <p className="dashboard-inline-note">When an urge rises, choose a small pause instead of acting on autopilot.</p>
      <div className="portal-home-action-row">
        {showPauseAction ? (
          <Link href="/portal/#daily-check-in" className="portal-home-action-chip">
            <span className="portal-home-action-label">Pause</span>
            <span className="portal-home-action-detail">Log a check-in</span>
          </Link>
        ) : null}
        {nextSessionHref ? (
          <Link href={nextSessionHref} className="portal-home-action-chip">
            <span className="portal-home-action-label">Next session</span>
            <span className="portal-home-action-detail">{nextSessionLabel ?? "Open programme"}</span>
          </Link>
        ) : (
          <Link href="/portal/programme/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Programme</span>
            <span className="portal-home-action-detail">View sessions</span>
          </Link>
        )}
        <Link href="/portal/messages/" className="portal-home-action-chip">
          <span className="portal-home-action-label">Message Gerald</span>
          <span className="portal-home-action-detail">Secure chat</span>
        </Link>
        <Link href="/portal/resources/" className="portal-home-action-chip">
          <span className="portal-home-action-label">Resources</span>
          <span className="portal-home-action-detail">Shared files</span>
        </Link>
      </div>
    </section>
  );
}
