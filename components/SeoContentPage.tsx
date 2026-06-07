import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { ProgrammeCard } from "@/components/ProgrammeCard";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryByCategory, artGalleryById } from "@/content/artGallery";
import { programmes } from "@/content/programmes";
import type { Phase1Page } from "@/content/phase1Pages";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";

type SeoContentPageProps = {
  page: Phase1Page;
  breadcrumbs: Array<{ name: string; path: string }>;
  useProgrammeCards?: boolean;
};

export function SeoContentPage({ page, breadcrumbs, useProgrammeCards = false }: SeoContentPageProps) {
  const formArtId = page.heroArtId ?? page.artId;
  const formArtwork = formArtId ? artGalleryById.get(formArtId) : undefined;
  const heroSideArtId = page.showLeadForm && formArtId ? formArtId : undefined;
  const hubProgrammes = useProgrammeCards
    ? programmes.filter((programme) => page.links.some((link) => link.href === programme.primaryHref))
    : [];

  return (
    <>
      <SchemaMarkup data={[webPageSchema(page.seo), serviceSchema(page.seo), breadcrumbSchema(breadcrumbs)]} />
      <Hero
        heroArtId={heroSideArtId}
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        primaryCta={page.hero.primaryCta}
        primaryHref="#enquiry"
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
        ) : formArtwork ? (
          <WatercolorArtwork item={formArtwork} className="hero-visual" priority sizes="(min-width: 900px) 42vw, 92vw" />
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
            {page.sections.map((section, index) => {
              const sectionArt = section.artId ? artGalleryById.get(section.artId) : undefined;

              return (
                <RevealArticle className="info-card" key={section.title} delay={index * 0.06}>
                  {sectionArt ? <WatercolorArtwork item={sectionArt} className="card-artwork" fill /> : null}
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
              );
            })}
          </div>
        </div>
      </section>

      {useProgrammeCards && hubProgrammes.length > 0 ? (
        <section className="section section-muted" aria-labelledby={`${page.seo.pageType}-programmes-heading`}>
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Addiction types</p>
              <h2 id={`${page.seo.pageType}-programmes-heading`}>Choose the pattern that fits best</h2>
            </RevealDiv>
            <div className="programme-grid">
              {hubProgrammes.map((programme, index) => (
                <RevealDiv key={programme.slug} delay={index * 0.08}>
                  <ProgrammeCard programme={programme} />
                </RevealDiv>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {!useProgrammeCards && page.links.length > 0 ? (
        <section className="section section-muted" aria-labelledby={`${page.seo.pageType}-links-heading`}>
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Related support</p>
              <h2 id={`${page.seo.pageType}-links-heading`}>Continue through the support path</h2>
            </RevealDiv>
            <div className="programme-grid two-col">
              {page.links.map((link, index) => {
                const linkArt = link.linkArtId
                  ? artGalleryById.get(link.linkArtId)
                  : link.artSlug
                    ? artGalleryByCategory.get(link.artSlug)
                    : undefined;

                return (
                  <RevealDiv key={link.href} delay={index * 0.06}>
                    <article className="programme-card">
                      {linkArt ? <WatercolorArtwork item={linkArt} className="card-artwork" fill sizes="(min-width: 900px) 24vw, 92vw" /> : null}
                      <div>
                        <p className="status">Related page</p>
                        <h3>{link.label}</h3>
                        <p>Continue to the next page in the addiction support and enquiry journey.</p>
                      </div>
                      <SiteLink className="card-link" href={link.href}>
                        View page
                      </SiteLink>
                    </article>
                  </RevealDiv>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      <Disclaimer />
      {page.showLeadForm ? (
        <section className="section form-section" aria-labelledby={`${page.seo.pageType}-form-heading`} id="enquiry">
          <div className="container form-layout form-layout-sticky">
            <RevealDiv className="form-layout-aside">
              <p className="eyebrow">Private next step</p>
              <h2 id={`${page.seo.pageType}-form-heading`}>Start your confidential enquiry</h2>
              <p>Share the concern and choose how Gerald should respond. This is a non-emergency enquiry.</p>
              <p className="form-section-alt">
                Prefer one question at a time?{" "}
                <SiteLink href="/need-help/">Use the confidential help wizard</SiteLink>.
              </p>
              {formArtwork ? <WatercolorArtwork item={formArtwork} className="section-inline-art form-layout-art" /> : null}
            </RevealDiv>
            <RevealDiv className="form-layout-main" delay={0.08}>
              <LeadForm
                defaultConcern={page.defaultConcern}
                formTitle={page.hero.primaryCta ?? "Start your confidential enquiry"}
                submitLabel={page.hero.primaryCta ?? "Send enquiry"}
                compact
                hideHeading
              />
            </RevealDiv>
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
