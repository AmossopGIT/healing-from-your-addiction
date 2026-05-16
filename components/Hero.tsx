import type { ReactNode } from "react";
import { RevealDiv } from "@/components/MotionReveal";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";

type HeroProps = {
  eyebrow?: string;
  title: string;
  description: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  children?: ReactNode;
};

export function Hero({
  eyebrow,
  title,
  description,
  primaryCta,
  primaryHref = "#enquiry",
  secondaryCta,
  secondaryHref = "/addiction-healing-programmes/",
  children,
}: HeroProps) {
  return (
    <section className="hero page-hero-flush section-band">
      <div className="container hero-grid">
        <RevealDiv className="hero-copy">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p className="lead">{description}</p>
          {(primaryCta || secondaryCta) && (
            <div className="button-row">
              {primaryCta ? (
                <TrackedLink
                  href={primaryHref}
                  className="button button-primary"
                  tracking={{ ctaName: primaryCta, payload: { cta_location: "hero" } }}
                >
                  {primaryCta}
                </TrackedLink>
              ) : null}
              {secondaryCta ? (
                <TrackedLink
                  href={secondaryHref}
                  className="button button-secondary"
                  tracking={{ ctaName: secondaryCta, payload: { cta_location: "hero" } }}
                >
                  {secondaryCta}
                </TrackedLink>
              ) : null}
            </div>
          )}
          <div className="trust-strip" aria-label="Key trust signals">
            <span>Confidential enquiry</span>
            <span>South Africa</span>
            <span>Pattern-focused support</span>
          </div>
        </RevealDiv>
        <RevealDiv className="hero-side" delay={0.08}>
          {children || <HeroVisual />}
        </RevealDiv>
      </div>
    </section>
  );
}

function HeroVisual() {
  const artwork = artGalleryById.get("home-hero") ?? artGalleryById.get("pattern-loop");

  if (!artwork) {
    return null;
  }

  return (
    <WatercolorArtwork
      item={artwork}
      className="hero-visual"
      priority
      sizes="(min-width: 900px) 42vw, 92vw"
    />
  );
}
