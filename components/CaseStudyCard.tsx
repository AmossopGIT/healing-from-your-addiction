import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import {
  caseStudyPath,
  caseStudyTypeLabels,
  type CaseStudy,
} from "@/content/caseStudies";
import { formatBlogDate } from "@/lib/formatBlogDate";

type CaseStudyCardProps = {
  study: CaseStudy;
  showArt?: boolean;
};

export function CaseStudyCard({ study, showArt = true }: CaseStudyCardProps) {
  const art = artGalleryById.get(study.heroArtId);

  return (
    <article className="case-study-card">
      {showArt && art ? (
        <SiteLink href={caseStudyPath(study.slug)} className="case-study-card-art-link" aria-hidden tabIndex={-1}>
          <WatercolorArtwork item={art} className="card-artwork" sizes="(min-width: 900px) 28vw, 94vw" />
        </SiteLink>
      ) : null}
      <div className="case-study-card-body">
        <div className="blog-meta-row">
          <span className={`case-study-type-badge case-study-type-${study.caseStudyType}`}>
            {caseStudyTypeLabels[study.caseStudyType]}
          </span>
          <span className="case-study-addiction-label">{study.addictionSlug.replace(/-/g, " ")}</span>
          <time dateTime={study.publishedAt}>{formatBlogDate(study.publishedAt)}</time>
        </div>
        <h3>
          <SiteLink href={caseStudyPath(study.slug)} className="case-study-card-title">
            {study.title}
          </SiteLink>
        </h3>
        <p>{study.excerpt}</p>
        <SiteLink className="card-link" href={caseStudyPath(study.slug)}>
          Read case study
        </SiteLink>
      </div>
    </article>
  );
}
