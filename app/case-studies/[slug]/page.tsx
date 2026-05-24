import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudyDisclaimer } from "@/components/CaseStudyDisclaimer";
import { ContentArticleBody } from "@/components/ContentArticleBody";
import { PageSeoContextScript } from "@/components/PageSeoContextScript";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { caseStudies, caseStudyPath, caseStudyTypeLabels } from "@/content/caseStudies";
import { getSeoByPath } from "@/content/seo";
import { getMergedCaseStudyBySlug } from "@/lib/cms/contentSource";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { resolveContentArt } from "@/lib/cms/mappers";
import { cmsCaseStudyToSeoRecord } from "@/lib/cms/seo";
import { absoluteUrl, siteConfig } from "@/lib/constants";
import { programmeLinkForCaseStudy } from "@/lib/caseStudyProgrammeLink";
import { formatBlogDate } from "@/lib/formatBlogDate";
import { createMetadata, createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

export const revalidate = isCmsContentEnabled() ? 300 : false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getMergedCaseStudyBySlug(slug);
  if (!result) {
    return createMetadata({
      title: "Case Study Not Found | Healing From Your Addiction",
      description: "The requested case study could not be found.",
      path: "/case-studies/",
      noIndex: true,
    });
  }

  const { study, cmsRow } = result;
  const art = resolveContentArt(study.heroArtId, cmsRow, "case-study");
  const pageSeo = cmsRow ? cmsCaseStudyToSeoRecord(cmsRow) : getSeoByPath(caseStudyPath(study.slug));

  if (pageSeo) {
    return createPageMetadata(pageSeo, {
      ogImage: art?.src,
      ogImageAlt: art?.alt,
    });
  }

  return createMetadata({
    title: `${study.title} | Healing From Your Addiction`,
    description: study.description,
    path: caseStudyPath(study.slug),
    keywords: [study.primaryKeyword, ...study.secondaryKeywords],
    ogImage: art?.src,
    ogImageAlt: art?.alt,
  });
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getMergedCaseStudyBySlug(slug);
  if (!result) notFound();

  const { study, cmsRow } = result;
  const art = resolveContentArt(study.heroArtId, cmsRow, "case-study");
  const pageSeo = cmsRow ? cmsCaseStudyToSeoRecord(cmsRow) : getSeoByPath(caseStudyPath(study.slug));
  const programme = programmeLinkForCaseStudy(study.addictionSlug);

  return (
    <>
      {pageSeo ? <PageSeoContextScript pageSeo={pageSeo} /> : null}
      <SchemaMarkup
        data={[
          pageSeo
            ? webPageSchema(pageSeo)
            : webPageSchema(study.title, study.description, caseStudyPath(study.slug)),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/blog/" },
            { name: "Case studies", path: "/case-studies/" },
            { name: study.title, path: caseStudyPath(study.slug) },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: study.title,
            description: study.description,
            url: absoluteUrl(caseStudyPath(study.slug)),
            datePublished: study.publishedAt,
            author: {
              "@type": "Person",
              name: siteConfig.owner,
            },
            publisher: {
              "@type": "Organization",
              name: siteConfig.name,
              url: siteConfig.siteUrl,
            },
            keywords: [study.primaryKeyword, ...study.secondaryKeywords, ...study.tagSlugs].join(", "),
            articleSection: "Case study",
            image: art ? [absoluteUrl(art.src)] : undefined,
          },
        ]}
      />

      <article className="section" aria-labelledby="case-study-heading">
        <div className="container narrow">
          <p className="eyebrow">Case study</p>
          <h1 id="case-study-heading">{study.h1}</h1>
          <p className="lead">{study.excerpt}</p>
          <p className="blog-meta-row">
            <span className={`case-study-type-badge case-study-type-${study.caseStudyType}`}>
              {caseStudyTypeLabels[study.caseStudyType]}
            </span>
            <span>{study.addictionSlug.replace(/-/g, " ")}</span>
            <time dateTime={study.publishedAt}>{formatBlogDate(study.publishedAt)}</time>
          </p>
          {art ? <WatercolorArtwork item={art} className="section-artwork blog-hero-art" priority /> : null}
          <ContentArticleBody sections={study.sections} />

          <CaseStudyDisclaimer />

          {programme ? (
            <p className="case-study-programme-link">
              <SiteLink className="button button-secondary" href={programme.primaryHref}>
                View {programme.title} support
              </SiteLink>
            </p>
          ) : null}

          <p className="blog-hub-back">
            <SiteLink className="card-link" href="/case-studies/">
              Back to all case studies
            </SiteLink>
          </p>
        </div>
      </article>
    </>
  );
}
