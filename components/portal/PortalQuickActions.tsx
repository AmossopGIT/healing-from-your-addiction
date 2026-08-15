import Link from "next/link";
import type { ThisWeekFocusKind } from "@/lib/portal/courseLoop";

type PortalQuickActionsProps = {
  nextSessionHref: string | null;
  nextSessionLabel: string | null;
  journeyHref?: string | null;
  journeyLabel?: string | null;
  focusKind?: ThisWeekFocusKind | null;
  showPauseAction?: boolean;
};

export function PortalQuickActions({
  nextSessionHref,
  nextSessionLabel,
  journeyHref = null,
  journeyLabel = null,
  focusKind = null,
  showPauseAction = true,
}: PortalQuickActionsProps) {
  const preferJourney = focusKind === "journey" && journeyHref;

  return (
    <section className="portal-home-quick-actions dashboard-panel">
      <h2>More ways to pause</h2>
      <p className="dashboard-inline-note">Secondary links — your main step is in This week above.</p>
      <div className="portal-home-action-row">
        {showPauseAction ? (
          <Link href="/portal/#daily-check-in" className="portal-home-action-chip">
            <span className="portal-home-action-label">Pause</span>
            <span className="portal-home-action-detail">Log a check-in</span>
          </Link>
        ) : null}
        {preferJourney ? (
          <Link href={journeyHref} className="portal-home-action-chip">
            <span className="portal-home-action-label">Journey</span>
            <span className="portal-home-action-detail">{journeyLabel ?? "Continue"}</span>
          </Link>
        ) : nextSessionHref ? (
          <Link href={nextSessionHref} className="portal-home-action-chip">
            <span className="portal-home-action-label">Live session</span>
            <span className="portal-home-action-detail">{nextSessionLabel ?? "Open programme"}</span>
          </Link>
        ) : (
          <Link href="/portal/programme/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Programme</span>
            <span className="portal-home-action-detail">View week map</span>
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
