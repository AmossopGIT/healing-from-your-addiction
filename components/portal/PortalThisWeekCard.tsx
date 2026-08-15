import Link from "next/link";
import { artGalleryById } from "@/content/artGallery";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { nextStepFromThisWeek, type ThisWeekModel } from "@/lib/portal/courseLoop";

type PortalThisWeekCardProps = {
  thisWeek: ThisWeekModel;
  /** When true, this card is the only primary CTA (default). */
  primary?: boolean;
};

export function PortalThisWeekCard({ thisWeek, primary = true }: PortalThisWeekCardProps) {
  const nextStep = nextStepFromThisWeek(thisWeek);
  const art = artGalleryById.get(nextStep.artId);

  return (
    <section
      className={`portal-this-week dashboard-panel${primary ? " dashboard-panel-highlight portal-this-week-hero" : ""}`}
    >
      <div className="portal-this-week-layout">
        <div className="portal-this-week-copy">
          <div className="portal-this-week-header">
            <p className="eyebrow">Do this now</p>
            <p className="portal-this-week-badge">Week {thisWeek.weekNumber}</p>
          </div>
          <h2>{thisWeek.headline}</h2>
          <p>{thisWeek.summary}</p>

          <ul className="portal-this-week-meta">
            {thisWeek.journeyTitle ? (
              <li>
                <span className="portal-this-week-meta-label">Journey</span>
                {thisWeek.journeyHref ? (
                  <Link href={thisWeek.journeyHref}>{thisWeek.journeyTitle}</Link>
                ) : (
                  <span>{thisWeek.journeyTitle}</span>
                )}
              </li>
            ) : null}
            {thisWeek.sessionTitle ? (
              <li>
                <span className="portal-this-week-meta-label">Live session</span>
                {thisWeek.sessionHref ? (
                  <Link href={thisWeek.sessionHref}>{thisWeek.sessionTitle}</Link>
                ) : (
                  <span>{thisWeek.sessionTitle}</span>
                )}
              </li>
            ) : null}
            {thisWeek.sessionLockedReason ? (
              <li className="portal-this-week-locked">{thisWeek.sessionLockedReason}</li>
            ) : null}
            <li>
              <span className="portal-this-week-meta-label">Check-in</span>
              <span>{thisWeek.checkInDone ? "Done today" : "Still open"}</span>
            </li>
            {thisWeek.practiceTotalCount > 0 ? (
              <li>
                <span className="portal-this-week-meta-label">Practice</span>
                <span>
                  {thisWeek.practiceDoneCount}/{thisWeek.practiceTotalCount} today
                </span>
              </li>
            ) : null}
            {thisWeek.remainingLiveSessions > 0 ? (
              <li>
                <span className="portal-this-week-meta-label">Live track</span>
                <span>
                  {thisWeek.remainingLiveSessions} session
                  {thisWeek.remainingLiveSessions === 1 ? "" : "s"} remaining
                </span>
              </li>
            ) : null}
          </ul>

          <Link href={thisWeek.primaryHref} className="button button-primary button-small">
            {thisWeek.primaryLabel}
          </Link>
        </div>
        {primary && art ? (
          <div className="portal-this-week-art">
            <WatercolorArtwork item={art} sizes="140px" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
