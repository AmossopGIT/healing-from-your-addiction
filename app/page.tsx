import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { FAQSection } from "@/components/FAQSection";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProgrammeCard } from "@/components/ProgrammeCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { SiteLink } from "@/components/SiteLink";
import { TrustSection } from "@/components/TrustSection";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { homeFaqs } from "@/content/faqs";
import { addictionMoneyLinks } from "@/content/phase1Pages";
import { programmes } from "@/content/programmes";
import { seoPages } from "@/content/seo";
import { processSteps } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, organizationSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.home;

export const metadata = createPageMetadata(pageSeo);

const patternSteps = [
  { label: "Trigger", artId: "pattern-trigger" },
  { label: "Craving", artId: "pattern-craving" },
  { label: "Behaviour", artId: "pattern-behaviour" },
  { label: "Relief or reward", artId: "pattern-relief" },
  { label: "Repeat", artId: "pattern-repeat" },
] as const;
const approachCards = [
  {
    title: "Subconscious patterns",
    body: "Repeated behaviours can become automatic. Hypnotherapy may support new associations and responses.",
    artId: "approach-subconscious",
  },
  {
    title: "Emotional triggers",
    body: "EFT and awareness work may help calm the emotional charge that often drives cravings.",
    artId: "approach-emotional",
  },
  {
    title: "Practical reinforcement",
    body: "Daily steps help make the work more grounded between sessions and during high-risk moments.",
    artId: "approach-practical",
  },
];

export default function HomePage() {
  const activeProgrammes = programmes.slice(0, 2);
  const patternArtwork = artGalleryById.get("pattern-map");
  const enquiryArtwork = artGalleryById.get("confidential-enquiry");

  return (
    <>
      <SchemaMarkup
        data={[
          organizationSchema(),
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([{ name: "Home", path: "/" }]),
        ]}
      />
      <Hero
        eyebrow="Confidential addiction pattern support in South Africa"
        title="Heal the pattern behind the addiction"
        description="Addiction is often a loop of trigger, craving, behaviour, relief and repetition. Healing From Your Addiction helps you work with that pattern through a structured 4-week, 8-session programme, hypnotherapy, EFT-informed support and daily reinforcement."
        primaryCta="Start Your Healing Program"
        secondaryCta="Explore Addiction Support"
        secondaryHref="/addictions/"
      />

      <section className="section pattern-section" aria-labelledby="pattern-heading">
        <div className="container split-grid">
          <RevealDiv>
            <p className="eyebrow">Addiction as a pattern</p>
            <h2 id="pattern-heading">You are not broken. The loop can be understood.</h2>
            <p className="section-intro">
              Many addictive behaviours become automatic because the mind links a trigger to relief, reward or escape. The work begins by making that loop visible.
            </p>
          </RevealDiv>
          <RevealDiv className="section-art-stack pattern-section-visual" delay={0.08}>
            {patternArtwork ? (
              <WatercolorArtwork
                item={patternArtwork}
                className="section-artwork pattern-section-hero-art"
                fill
                sizes="(min-width: 900px) 42vw, 92vw"
              />
            ) : null}
            <div className="loop-row" aria-label="Addiction pattern loop">
              {patternSteps.map((step) => {
                const artwork = artGalleryById.get(step.artId);

                return (
                  <article className="loop-step" key={step.artId}>
                    {artwork ? <WatercolorArtwork item={artwork} className="loop-step-art" fill sizes="(min-width: 900px) 18vw, 88vw" /> : null}
                    <p>{step.label}</p>
                  </article>
                );
              })}
            </div>
          </RevealDiv>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="programmes-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Programmes</p>
            <h2 id="programmes-heading">What Healing From Your Addiction helps with</h2>
            <p>Start with the addiction type that matches the pattern you want support with. The strongest current programmes are gambling addiction and food addiction / binge eating.</p>
          </div>
          <div className="programme-grid two-col">
            {activeProgrammes.map((programme, index) => (
              <RevealDiv key={programme.title} delay={index * 0.08}>
                <ProgrammeCard programme={programme} />
              </RevealDiv>
            ))}
          </div>
        </div>
      </section>

      <TrustSection />
      <ProcessSteps steps={processSteps} />

      <section className="section" aria-labelledby="addiction-types-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Addiction types</p>
            <h2 id="addiction-types-heading">One addiction type, one page, one clear enquiry path</h2>
            <p>Each addiction page is structured for search intent, Google Ads relevance and confidential lead capture.</p>
          </div>
          <div className="programme-grid">
            {addictionMoneyLinks.map((link) => (
              <article className="programme-card" key={link.href}>
                <div>
                  <p className="status">Support page</p>
                  <h3>{link.label}</h3>
                  <p>Learn how the trigger, craving and behaviour loop can be mapped for this concern.</p>
                </div>
                <SiteLink className="card-link" href={link.href}>
                  View support
                </SiteLink>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="approach-heading">
        <div className="container split-grid">
          <RevealDiv>
            <p className="eyebrow">The approach</p>
            <h2 id="approach-heading">Why hypnotherapy, EFT and subconscious work may support change</h2>
          </RevealDiv>
          <div className="info-grid compact-grid">
            {approachCards.map((card) => {
              const artwork = artGalleryById.get(card.artId);

              return (
                <RevealArticle className="info-card" key={card.title}>
                  {artwork ? <WatercolorArtwork item={artwork} className="card-artwork" fill /> : null}
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                </RevealArticle>
              );
            })}
          </div>
        </div>
      </section>

      <FAQSection title="Common questions before enquiring" faqs={homeFaqs} />
      <Disclaimer />

      <section className="section form-section" aria-labelledby="home-form-heading">
        <div className="container form-layout">
          <RevealDiv>
            <p className="eyebrow">Confidential next step</p>
            <h2 id="home-form-heading">Start your confidential enquiry</h2>
            <p>Use the form to share the concern and choose how Gerald should respond. This is an enquiry, not emergency support.</p>
            <p className="form-section-alt">
              Prefer one question at a time?{" "}
              <SiteLink href="/need-help/">Use the confidential help wizard</SiteLink>.
            </p>
            {enquiryArtwork ? <WatercolorArtwork item={enquiryArtwork} className="section-inline-art" /> : null}
          </RevealDiv>
          <RevealDiv delay={0.08}>
            <LeadForm compact hideHeading />
          </RevealDiv>
        </div>
      </section>
      <CTASection title="Prefer to start with the programme structure?" body="The 4-week, 8-session programme explains the support rhythm, daily reinforcement and safety boundaries before you enquire." button="View the 4-Week Program" href="/programs/4-week-addiction-healing-program/" />
    </>
  );
}
