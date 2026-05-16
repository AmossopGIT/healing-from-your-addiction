import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import type { Phase1Page } from "@/content/phase1Pages";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";

type SeoContentPageProps = {
  page: Phase1Page;
  breadcrumbs: Array<{ name: string; path: string }>;
};

export function SeoContentPage({ page, breadcrumbs }: SeoContentPageProps) {
  const artwork = page.artId ? artGalleryById.get(page.artId) : undefined;

  return (
    <>
      <SchemaMarkup data={[webPageSchema(page.seo), serviceSchema(page.seo), breadcrumbSchema(breadcrumbs)]} />
      <Hero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        primaryCta={page.hero.primaryCta}
        secondaryCta={page.hero.secondaryCta}
        secondaryHref={page.hero.secondaryHref}
      >
        {page.showLeadForm ? (
          <LeadForm
            defaultConcern={page.defaultConcern}
            formTitle={page.hero.primaryCta ?? "Start your confidential enquiry"}
            submitLabel={page.hero.primaryCta ?? "Send enquiry"}
            compact
          />
        ) : artwork ? (
          <WatercolorArtwork item={artwork} className="hero-visual" priority sizes="(min-width: 900px) 42vw, 92vw" />
        ) : null}
      </Hero>

      <section className="section" aria-labelledby={`${page.seo.pageType}-sections-heading`}>
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">What to know</p>
            <h2 id={`${page.seo.pageType}-sections-heading`}>{page.seo.primaryKeyword}</h2>
            <p>{page.seo.searchIntent}</p>
          </div>
          <div className="info-grid">
            {page.sections.map((section, index) => (
              <RevealArticle className="info-card" key={section.title} delay={index * 0.06}>
                {index === 0 && artwork ? <WatercolorArtwork item={artwork} className="card-artwork" fill /> : null}
                {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                {section.bullets ? (
                  <ul>
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </RevealArticle>
            ))}
          </div>
        </div>
      </section>

      {page.links.length ? (
        <section className="section section-muted" aria-labelledby={`${page.seo.pageType}-links-heading`}>
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Related support</p>
              <h2 id={`${page.seo.pageType}-links-heading`}>Continue through the support path</h2>
            </RevealDiv>
            <div className="programme-grid two-col">
              {page.links.map((link) => (
                <article className="programme-card" key={link.href}>
                  <div>
                    <p className="status">Internal link</p>
                    <h3>{link.label}</h3>
                    <p>Continue to the next page in the addiction support and enquiry journey.</p>
                  </div>
                  <SiteLink className="card-link" href={link.href}>
                    View page
                  </SiteLink>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <Disclaimer />
      {page.showLeadForm ? (
        <section className="section form-section" aria-labelledby={`${page.seo.pageType}-form-heading`}>
          <div className="container form-layout">
            <div>
              <p className="eyebrow">Private next step</p>
              <h2 id={`${page.seo.pageType}-form-heading`}>Start your confidential enquiry</h2>
              <p>Share the concern and choose how Gerald should respond. This is a non-emergency enquiry.</p>
            </div>
            <LeadForm defaultConcern={page.defaultConcern} />
          </div>
        </section>
      ) : null}
      {page.finalCta ? (
        <CTASection
          title={page.finalCta.title}
          body={page.finalCta.body}
          button={page.finalCta.button}
          href={page.finalCta.href}
        />
      ) : (
        <CTASection
          title="Ready to ask about support?"
          body="Start with a private enquiry and choose your preferred contact method."
          button="Start Your Healing Program"
          href="/contact/"
        />
      )}
    </>
  );
}
