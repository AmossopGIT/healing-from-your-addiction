import { Suspense } from "react";
import { CaseStudyGrid } from "@/components/CaseStudyGrid";
import { CaseStudyHubFilters } from "@/components/CaseStudyHubFilters";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { caseStudies } from "@/content/caseStudies";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.caseStudies;

const addictionOptions = [...new Set(caseStudies.map((study) => study.addictionSlug))].sort();

export const metadata = createPageMetadata(pageSeo);

export default function CaseStudiesHubPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Resources", path: "/blog/" },
            { name: "Case studies", path: "/case-studies/" },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Addiction support case studies",
            url: "https://healingfromyouraddiction.co.za/case-studies/",
            description: pageSeo.description,
          },
        ]}
      />

      <section className="section-band page-hero-flush blog-hub-hero" aria-labelledby="case-studies-heading">
        <div className="container">
          <p className="eyebrow">Case studies</p>
          <h1 id="case-studies-heading">Real-world support examples and programme resources</h1>
          <p className="section-intro narrow">
            Outcome stories, EFT scripts, programme outlines, intake questions, and affirmations — organised by addiction
            topic and resource type.
          </p>
          <nav className="blog-category-nav" aria-label="Related resources">
            <SiteLink href="/blog/" className="blog-category-pill">
              All resources
            </SiteLink>
            <SiteLink href="/blog/#topic-healing-program" className="blog-category-pill">
              Articles
            </SiteLink>
          </nav>
          <p className="blog-hub-count blog-hub-hero-count">{caseStudies.length} case studies</p>
        </div>
      </section>

      <section className="section" aria-labelledby="case-studies-filter-heading">
        <div className="container">
          <h2 id="case-studies-filter-heading" className="visually-hidden">
            Filter case studies
          </h2>
          <Suspense fallback={<p className="section-intro">Loading filters…</p>}>
            <CaseStudyHubFilters addictionOptions={addictionOptions} />
          </Suspense>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="case-studies-grid-heading">
        <div className="container">
          <h2 id="case-studies-grid-heading" className="visually-hidden">
            Case study library
          </h2>
          <Suspense fallback={<p className="section-intro">Loading case studies…</p>}>
            <CaseStudyGrid />
          </Suspense>
        </div>
      </section>
    </>
  );
}
