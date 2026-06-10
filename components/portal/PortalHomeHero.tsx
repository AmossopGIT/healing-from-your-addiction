import { artGalleryById } from "@/content/artGallery";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import type { PortalHomeHeroModel } from "@/lib/portal/homeState";

type PortalHomeHeroProps = {
  hero: PortalHomeHeroModel;
};

export function PortalHomeHero({ hero }: PortalHomeHeroProps) {
  const art = artGalleryById.get(hero.artId);

  return (
    <section className="portal-home-hero dashboard-panel">
      <div className="portal-home-hero-copy">
        <p className="eyebrow">{hero.greeting}</p>
        <h1>{hero.headline}</h1>
        <p className="portal-home-hero-subtext">{hero.subtext}</p>
        <div className="portal-home-hero-metrics">
          <div className="portal-home-metric">
            <span className="portal-home-metric-label">{hero.primaryMetricLabel}</span>
            <strong className="portal-home-metric-value">{hero.primaryMetricValue}</strong>
          </div>
          {hero.secondaryMetricLabel ? (
            <div className="portal-home-metric">
              <span className="portal-home-metric-label">{hero.secondaryMetricLabel}</span>
              <strong className="portal-home-metric-value">{hero.secondaryMetricValue}</strong>
            </div>
          ) : null}
        </div>
      </div>
      {art ? (
        <div className="portal-home-hero-art">
          <WatercolorArtwork item={art} sizes="160px" />
        </div>
      ) : null}
    </section>
  );
}
