import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { HealingPackagesPathPreview } from "@/components/HealingPackagesPathPreview";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { RevealDiv } from "@/components/MotionReveal";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById, artGalleryByCategory } from "@/content/artGallery";
import { addictionMoneyLinks } from "@/content/phase1Pages";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, serviceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.programmes;

export const metadata = createPageMetadata(pageSeo);

export default function ProgramsPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          webPageSchema(pageSeo),
          serviceSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Programs", path: pageSeo.path },
          ]),
        ]}
      />

      <Hero
        heroArtId="programme-overview"
        eyebrow="Addiction healing programs"
        title="Progressive healing packages for addiction patterns"
        description="Compare Free Start tools, Foundation and Transformation monthly support, the Complete Healing Plan, and the Master Plan 30-day fast-track — then choose the addiction page that matches your pattern."
        primaryCta="Compare healing packages"
        primaryHref={seoPages.healingPackages.path}
        secondaryCta="Browse addiction types"
        secondaryHref={seoPages.addictions.path}
      />

      <HealingPackagesPathPreview
        eyebrow="Healing packages"
        title="Start at the level you can afford"
        description="The commercial path is no longer a single R12,000 doorway. Support level and investment rise together."
        showCompare
        trackingLocation="programs_packages_path"
      />

      <section className="section section-muted" aria-labelledby="programs-addiction-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">By addiction type</p>
            <h2 id="programs-addiction-heading">Match the pattern, then choose a package</h2>
            <p>Each addiction page explains the loop. Packages explain how much support you can start with.</p>
          </div>
          <div className="programme-grid two-col">
            {addictionMoneyLinks.slice(0, 4).map((link, index) => {
              const linkArt = link.linkArtId
                ? artGalleryById.get(link.linkArtId)
                : link.artSlug
                  ? artGalleryByCategory.get(link.artSlug)
                  : undefined;

              return (
                <RevealDiv key={link.href} delay={index * 0.06}>
                  <article className="programme-card">
                    {linkArt ? (
                      <WatercolorArtwork item={linkArt} className="card-artwork" fill sizes="(min-width: 900px) 24vw, 92vw" />
                    ) : null}
                    <div>
                      <p className="status">Addiction support</p>
                      <h3>{link.label}</h3>
                      <p>Understand the pattern, then enquire about the package that fits.</p>
                    </div>
                    <SiteLink className="card-link" href={link.href}>
                      View support
                    </SiteLink>
                  </article>
                </RevealDiv>
              );
            })}
          </div>
          <p className="healing-packages-gentle">
            <SiteLink href={seoPages.addictions.path}>See all addiction support pages</SiteLink>
            {" · "}
            <SiteLink href={seoPages.fourWeekProgram.path}>Master Plan / intensive session rhythm</SiteLink>
          </p>
        </div>
      </section>

      <CTASection
        title="Ready to choose a package?"
        body="Open the full package details, then send a confidential enquiry naming Free Start, Foundation, Transformation, Complete Healing, or Master Plan."
        button="Open healing packages"
        href={seoPages.healingPackages.path}
      />

      <section className="section" id="enquiry" aria-labelledby="programs-enquiry-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Confidential enquiry</p>
            <h2 id="programs-enquiry-heading">Ask about the package that fits</h2>
            <p className="section-intro">
              Share the addiction concern and which package level you are considering. If you are unsure, say so — we
              will help you choose.
            </p>
          </div>
          <LeadForm formTitle="Enquire about healing support" submitLabel="Send enquiry" compact />
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
