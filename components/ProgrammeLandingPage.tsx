import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { FAQSection } from "@/components/FAQSection";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrustSection } from "@/components/TrustSection";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { foodSupportLinks, gamblingSupportLinks } from "@/content/phase1Pages";
import { getSeoByPath } from "@/content/seo";
import type { LandingPageContent } from "@/content/types";
import { breadcrumbSchema, faqSchema, professionalServiceSchema, serviceSchema, webPageSchema } from "@/lib/schema";

type ProgrammeLandingPageProps = {
  content: LandingPageContent;
};

export function ProgrammeLandingPage({ content }: ProgrammeLandingPageProps) {
  const programmeArtwork = artGalleryById.get("programme-overview");
  const dailyArtwork = artGalleryById.get("process-integration");
  const pageSeo = getSeoByPath(content.path);
  const relatedLinks = content.defaultConcern === "Gambling" ? gamblingSupportLinks : content.defaultConcern === "Food / binge eating" ? foodSupportLinks : [];
  const schema = [
    professionalServiceSchema(),
    pageSeo ? webPageSchema(pageSeo) : webPageSchema(content.seo.title, content.seo.description, content.path),
    ...(pageSeo ? [serviceSchema(pageSeo)] : []),
    breadcrumbSchema([
      { name: "Home", path: "/" },
      { name: content.breadcrumbLabel, path: content.path },
    ]),
    faqSchema(content.faqs),
  ];

  return (
    <>
      <SchemaMarkup data={schema} />
      <Hero
        eyebrow={content.hero.eyebrow}
        title={content.hero.title}
        description={content.hero.description}
        primaryCta={content.hero.primaryCta}
        secondaryCta="WhatsApp Gerald"
        secondaryHref="/contact/#contact-options"
      >
        <LeadForm defaultConcern={content.defaultConcern} formTitle={content.hero.primaryCta} submitLabel={content.hero.primaryCta} compact />
      </Hero>

      <section className="section" aria-labelledby="pain-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">What this can feel like</p>
            <h2 id="pain-heading">{content.painSection.title}</h2>
            <p className="section-intro">{content.painSection.intro}</p>
          </div>
          <div className="pain-grid">
            {content.painSection.points.map((point) => {
              const artwork = point.artId ? artGalleryById.get(point.artId) : undefined;

              return (
                <div className="mini-card pain-card" key={point.text}>
                  {artwork ? <WatercolorArtwork item={artwork} className="card-artwork" fill sizes="(min-width: 900px) 22vw, 88vw" /> : null}
                  <p>{point.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="programme-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Programme overview</p>
            <h2 id="programme-heading">{content.programme.title}</h2>
            {programmeArtwork ? <WatercolorArtwork item={programmeArtwork} className="section-inline-art" /> : null}
          </div>
          <div className="prose">
            <p>{content.programme.body}</p>
            {content.programme.points ? (
              <ul className="check-list">
                {content.programme.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </section>

      <CTASection
        title="4 weeks. 8 sessions. R12,000."
        body="The programme is structured to map the pattern, work with cravings and triggers, reinforce daily change and prepare for high-risk moments."
        button={content.hero.primaryCta}
      />

      <section className="section" aria-labelledby="education-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">How the pattern works</p>
            <h2 id="education-heading">Why subconscious and emotional pattern work may help</h2>
          </div>
          <div className="info-grid">
            {content.education.map((section) => (
              <article className="info-card" key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
                {section.points ? (
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="sessions-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">8 sessions / 4 weeks</p>
            <h2 id="sessions-heading">What the sessions focus on</h2>
          </div>
          <div className="session-grid">
            {content.sessionFocus.map((session) => (
              <article className="session-card" key={session.title}>
                <span>{session.label}</span>
                <h3>{session.title}</h3>
                <p>{session.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="daily-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Between sessions</p>
            <h2 id="daily-heading">Daily reinforcement steps</h2>
            <p className="section-intro">Small repeated actions help make the support practical outside the session space.</p>
            {dailyArtwork ? <WatercolorArtwork item={dailyArtwork} className="section-inline-art" /> : null}
          </div>
          <ul className="check-list large-list">
            {content.dailySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </section>

      {relatedLinks.length ? (
        <section className="section section-muted" aria-labelledby="related-support-heading">
          <div className="container">
            <div className="section-heading">
              <p className="eyebrow">Support pages</p>
              <h2 id="related-support-heading">Go deeper into this pattern</h2>
              <p>These pages support the main programme page and match the searches people often make before they enquire.</p>
            </div>
            <div className="programme-grid two-col">
              {relatedLinks.map((link) => (
                <article className="programme-card" key={link.href}>
                  <div>
                    <p className="status">Related topic</p>
                    <h3>{link.label}</h3>
                    <p>Read the connected support page and return to the programme enquiry when ready.</p>
                  </div>
                  <a className="card-link" href={link.href}>
                    Read more
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <TrustSection title={content.trust.title} body={content.trust.body} />
      <FAQSection faqs={content.faqs} />
      <Disclaimer />
      <section className="section form-section" aria-labelledby="programme-bottom-form-heading">
        <div className="container form-layout">
          <div>
            <p className="eyebrow">Confidential next step</p>
            <h2 id="programme-bottom-form-heading">{content.finalCta.title}</h2>
            <p>{content.finalCta.body}</p>
          </div>
          <LeadForm defaultConcern={content.defaultConcern} formTitle={content.finalCta.title} submitLabel={content.finalCta.button} />
        </div>
      </section>
      <CTASection title={content.finalCta.title} body={content.finalCta.body} button={content.finalCta.button} />
    </>
  );
}


