import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.about;

export const metadata = createPageMetadata(pageSeo);

export default function AboutGeraldPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About Gerald Crawford", path: "/about-gerald-crawford/" },
          ]),
        ]}
      />
      <Hero
        eyebrow="About Gerald Crawford"
        title="A calm, confidential approach to addiction pattern support"
        description="Gerald Crawford works with hypnotherapy, EFT, healing-focused education and subconscious pattern support for people who want help with cravings, emotional triggers and addictive loops."
        primaryCta="Start Your Confidential Enquiry"
        secondaryCta="View Programmes"
        secondaryHref="/addiction-healing-programmes/"
      />

      <section className="section" aria-labelledby="who-heading">
        <div className="container split-grid">
          <div>
            <p className="eyebrow">Who Gerald is</p>
            <h2 id="who-heading">Support that starts with understanding, not judgement</h2>
          </div>
          <div className="prose">
            <p>
              Gerald Crawford is presented through Healing From Your Addiction as a Certified Clinical Hypnosis Practitioner, healer, guide and educator. His work focuses on the emotional, subconscious and behavioural patterns that can keep addiction loops active.
            </p>
            <p>
              The site positions his support carefully: this is not a rehab clinic, medical detox service or emergency service. It is confidential hypnotherapy, EFT, coaching-style support and education for people ready to explore the pattern behind the behaviour.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="qualifications-heading">
        <div className="container three-grid">
          <article className="info-card">
            <h2 id="qualifications-heading">Qualifications</h2>
            <p>Clinical hypnosis practitioner positioning, EFT-informed support, healing education and pattern-focused work.</p>
          </article>
          <article className="info-card">
            <h2>Approach</h2>
            <p>Understand the loop, calm the emotional trigger, rehearse a new response and reinforce change between sessions.</p>
          </article>
          <article className="info-card">
            <h2>What to expect</h2>
            <p>A private conversation, clear boundaries, structured support and respectful language without cure claims or guarantees.</p>
          </article>
        </div>
      </section>

      <section className="section" aria-labelledby="why-heading">
        <div className="container narrow prose">
          <p className="eyebrow">Why addiction patterns</p>
          <h2 id="why-heading">The behaviour is only one part of the pattern</h2>
          <p>
            Gambling, binge eating and other behavioural loops often involve stress, anticipation, relief, shame, repetition and automatic response. Gerald's approach is built around helping people understand those patterns and create more choice in the moments where the urge usually takes over.
          </p>
        </div>
      </section>

      <Disclaimer title="Professional boundaries" />
      <CTASection
        title="Speak to Gerald confidentially"
        body="If you are ready to ask about support, start with a private enquiry and choose WhatsApp, phone or email as your preferred response method."
        button="Start Your Confidential Enquiry"
        href="/contact/#enquiry"
      />
    </>
  );
}
