import { RevealDiv } from "@/components/MotionReveal";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { healingPackages, healingPackagesPhilosophy } from "@/content/healingPackages";
import { seoPages } from "@/content/seo";

type HealingPackagesPathPreviewProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  showCompare?: boolean;
  muted?: boolean;
  ctaLabel?: string;
  trackingLocation?: string;
};

export function HealingPackagesPathPreview({
  eyebrow = "The path",
  title = "Choose the level of support that fits",
  description = "Begin where you are — free tools, monthly support, comprehensive healing, or a 30-day fast-track.",
  showCompare = false,
  muted = false,
  ctaLabel = "Compare healing packages",
  trackingLocation = "packages_path_preview",
}: HealingPackagesPathPreviewProps) {
  return (
    <section
      className={`section healing-packages-section${muted ? " section-muted" : ""}`}
      aria-labelledby="site-packages-path-heading"
    >
      <div className="container">
        <div className="section-heading healing-packages-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2 id="site-packages-path-heading">{title}</h2>
          <p>{description}</p>
        </div>

        <nav className="healing-path-nav" aria-label="Healing package path">
          <ol className="healing-path-list">
            {healingPackages.map((pkg, index) => {
              const artwork = artGalleryById.get(pkg.artId);

              return (
                <li key={pkg.id}>
                  <RevealDiv delay={index * 0.04} className="healing-path-item">
                    <TrackedLink
                      href={`${seoPages.healingPackages.path}#${pkg.id}`}
                      className={`healing-path-step healing-path-step-${pkg.tone}`}
                      tracking={{
                        ctaName: `path_${pkg.letter}_${pkg.stepVerb}`,
                        payload: {
                          cta_location: trackingLocation,
                          package_id: pkg.id,
                          package_letter: pkg.letter,
                        },
                      }}
                    >
                      {artwork ? (
                        <WatercolorArtwork
                          item={artwork}
                          className="healing-path-art"
                          sizes="(min-width: 1100px) 10vw, (min-width: 720px) 18vw, 40vw"
                        />
                      ) : null}
                      <span className="healing-path-letter">{pkg.letter}</span>
                      <span className="healing-path-verb">{pkg.stepVerb}</span>
                      <span className="healing-path-support">{pkg.supportLevel}</span>
                      <span className="healing-path-price">{pkg.investment}</span>
                    </TrackedLink>
                  </RevealDiv>
                </li>
              );
            })}
          </ol>
        </nav>

        {showCompare ? (
          <div className="healing-compare-grid healing-compare-grid-preview">
            {healingPackages.map((pkg, index) => (
              <RevealDiv key={pkg.id} delay={Math.min(index * 0.03, 0.12)} className={`healing-compare-card healing-package-${pkg.tone}`}>
                <p className="eyebrow">
                  {pkg.letter} · {pkg.name}
                </p>
                <dl className="healing-compare-dl">
                  <div>
                    <dt>Duration</dt>
                    <dd>{pkg.duration}</dd>
                  </div>
                  <div>
                    <dt>Support</dt>
                    <dd>
                      <strong>{pkg.supportLevel}</strong>
                    </dd>
                  </div>
                  <div>
                    <dt>Investment</dt>
                    <dd>{pkg.investment}</dd>
                  </div>
                </dl>
              </RevealDiv>
            ))}
          </div>
        ) : null}

        <p className="healing-packages-gentle healing-packages-preview-note">{healingPackagesPhilosophy}</p>

        <div className="button-row healing-packages-preview-cta">
          <TrackedLink
            href={seoPages.healingPackages.path}
            className="button button-primary"
            tracking={{
              ctaName: ctaLabel,
              payload: { cta_location: trackingLocation },
            }}
          >
            {ctaLabel}
          </TrackedLink>
          <TrackedLink
            href="#enquiry"
            className="button button-secondary"
            tracking={{
              ctaName: "Enquire about a package",
              payload: { cta_location: trackingLocation },
            }}
          >
            Enquire about a package
          </TrackedLink>
        </div>
      </div>
    </section>
  );
}
