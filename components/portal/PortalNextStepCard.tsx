import Link from "next/link";
import { artGalleryById } from "@/content/artGallery";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import type { PortalNextStep } from "@/lib/portal/nextStep";

type PortalNextStepCardProps = {
  nextStep: PortalNextStep;
};

export function PortalNextStepCard({ nextStep }: PortalNextStepCardProps) {
  const art = artGalleryById.get(nextStep.artId);

  return (
    <section className="portal-home-next-step dashboard-panel dashboard-panel-highlight">
      <div className="portal-home-next-step-copy">
        <p className="eyebrow">Your next step</p>
        <h2>{nextStep.title}</h2>
        <p>{nextStep.description}</p>
        <Link href={nextStep.href} className="button button-primary button-small">
          {nextStep.buttonLabel}
        </Link>
      </div>
      {art ? (
        <div className="portal-home-next-step-art">
          <WatercolorArtwork item={art} sizes="120px" />
        </div>
      ) : null}
    </section>
  );
}
