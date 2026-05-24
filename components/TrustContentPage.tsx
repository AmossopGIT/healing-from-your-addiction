import type { ReactNode } from "react";
import { CTASection } from "@/components/CTASection";
import { Hero } from "@/components/Hero";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import type { TrustPage, TrustTestimony } from "@/content/trustPages";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

type TrustContentPageProps = {
  page: TrustPage;
  breadcrumbs: Array<{ name: string; path: string }>;
  topSlot?: ReactNode;
  bottomSlot?: ReactNode;
};

function renderBullet(bullet: string) {
  if (bullet.includes("Privacy Policy")) {
    const parts = bullet.split("Privacy Policy");
    return (
      <>
        {parts[0]}
        <SiteLink href="/privacy-policy/">Privacy Policy</SiteLink>
        {parts[1]}
      </>
    );
  }
  if (bullet.includes("Medical Disclaimer")) {
    const parts = bullet.split("Medical Disclaimer");
    return (
      <>
        {parts[0]}
        <SiteLink href="/medical-disclaimer/">Medical Disclaimer</SiteLink>
        {parts[1]}
      </>
    );
  }
  return bullet;
}

export function TrustContentPage({ page, breadcrumbs, topSlot, bottomSlot }: TrustContentPageProps) {
  return (
    <>
      <SchemaMarkup data={[webPageSchema(page.seo), breadcrumbSchema(breadcrumbs)]} />
      <Hero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        description={page.hero.description}
        primaryCta={page.hero.primaryCta}
        primaryHref={page.hero.primaryHref}
        secondaryCta={page.hero.secondaryCta}
        secondaryHref={page.hero.secondaryHref}
        heroArtId={page.heroArtId}
      />

      {topSlot}

      {page.sections.map((section, index) => {
        const sectionArt = section.artId ? artGalleryById.get(section.artId) : undefined;

        return (
          <section
            key={section.title}
            className={`section${index % 2 === 1 ? " section-muted" : ""}`}
            aria-labelledby={`trust-section-${index}`}
          >
            <div className="container">
              <RevealDiv className="section-heading">
                {section.eyebrow ? <p className="eyebrow">{section.eyebrow}</p> : null}
                <h2 id={`trust-section-${index}`}>{section.title}</h2>
              </RevealDiv>
              <div className={section.h3Items?.length ? "trust-split-grid" : "narrow prose"}>
                <div>
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                  ))}
                  {section.bullets?.length ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet.slice(0, 48)}>{renderBullet(bullet)}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
                {sectionArt ? (
                  <WatercolorArtwork
                    item={sectionArt}
                    className="trust-section-art"
                    fill
                    sizes="(min-width: 900px) 32vw, 92vw"
                  />
                ) : null}
              </div>
              {section.h3Items?.length ? (
                <div className="trust-h3-grid">
                  {section.h3Items.map((item, itemIndex) => (
                    <RevealArticle className="info-card" key={item.h3} delay={itemIndex * 0.05}>
                      <h3>{item.h3}</h3>
                      <p>{item.body}</p>
                    </RevealArticle>
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        );
      })}

      {page.testimonies?.length ? (
        <section className="section section-muted" aria-labelledby="testimonies-list-heading">
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Illustrative reflections</p>
              <h2 id="testimonies-list-heading">What people describe after pattern-focused support</h2>
            </RevealDiv>
            <div className="testimony-grid">
              {page.testimonies.map((item: TrustTestimony, index) => (
                <RevealArticle className="testimony-card" key={item.name} delay={index * 0.04}>
                  <h3>{item.name}</h3>
                  <blockquote cite="">{item.quote}</blockquote>
                </RevealArticle>
              ))}
            </div>
            {page.closingParagraphs?.length ? (
              <div className="narrow prose testimony-closing">
                {page.closingParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {bottomSlot}

      {page.links.length > 0 ? (
        <section className="section" aria-labelledby="trust-links-heading">
          <div className="container">
            <RevealDiv className="section-heading">
              <p className="eyebrow">Related pages</p>
              <h2 id="trust-links-heading">Continue exploring</h2>
            </RevealDiv>
            <ul className="trust-link-list">
              {page.links.map((link) => (
                <li key={link.href}>
                  <SiteLink href={link.href}>{link.label}</SiteLink>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {page.finalCta ? (
        <CTASection
          title={page.finalCta.title}
          body={page.finalCta.body}
          button={page.finalCta.button}
          href={page.finalCta.href ?? "/contact/#enquiry"}
        />
      ) : null}
    </>
  );
}
