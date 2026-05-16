import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { FAQSection } from "@/components/FAQSection";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { RevealArticle, RevealDiv } from "@/components/MotionReveal";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProgrammeCard } from "@/components/ProgrammeCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrustSection } from "@/components/TrustSection";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { homeFaqs } from "@/content/faqs";
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
        description="Addiction is often more than the behaviour itself. It can become a loop of stress, emotion, craving, relief and repetition. Healing From Your Addiction helps you work with these patterns through hypnotherapy, EFT and structured support."
        primaryCta="Start Your Confidential Enquiry"
        secondaryCta="Explore the Programmes"
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
            <h2 id="programmes-heading">Current addiction support programmes</h2>
            <p>Start with the programme that matches the pattern you want support with. More categories can be added using the same landing-page system.</p>
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
            {enquiryArtwork ? <WatercolorArtwork item={enquiryArtwork} className="section-inline-art" /> : null}
          </RevealDiv>
          <RevealDiv delay={0.08}>
            <LeadForm />
          </RevealDiv>
        </div>
      </section>
      <CTASection title="Prefer to start with a programme page?" body="The gambling and food addiction pages are built for search intent, Google Ads relevance and confidential enquiry capture." button="View Addiction Programmes" href="/addiction-healing-programmes/" />
    </>
  );
}
