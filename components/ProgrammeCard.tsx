import type { Programme } from "@/content/programmes";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryByCategory } from "@/content/artGallery";

type ProgrammeCardProps = {
  programme: Programme;
};

export function ProgrammeCard({ programme }: ProgrammeCardProps) {
  const label = programme.status === "active" ? "View programme" : "View details";
  const statusLabel = programme.status === "active" ? "Active" : programme.status === "coming-soon" ? "Coming soon" : "Enquiry open";
  const artwork = artGalleryByCategory.get(programme.slug);

  return (
    <article className="programme-card">
      {artwork ? <WatercolorArtwork item={artwork} className="card-artwork" fill sizes="(min-width: 900px) 24vw, 92vw" /> : null}
      <div>
        <p className={`status status-${programme.status}`}>{statusLabel}</p>
        <h3>{programme.title}</h3>
        <p>{programme.description}</p>
      </div>
      <TrackedLink
        href={programme.primaryHref}
        className="card-link"
        tracking={{
          eventName: "programme_card_click",
          ctaName: programme.title,
          payload: {
            programme_status: programme.status,
            programme_slug: programme.slug,
            programme_primary_href: programme.primaryHref,
            programme_pillar_href: programme.pillarHref,
          },
        }}
      >
        {label}
      </TrackedLink>
    </article>
  );
}
