import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { ProcessSteps } from "@/components/ProcessSteps";
import { ProgrammeCard } from "@/components/ProgrammeCard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { programmes } from "@/content/programmes";
import { seoPages } from "@/content/seo";
import { processSteps } from "@/content/site";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.programmes;

export const metadata = createPageMetadata(pageSeo);

export default function ProgrammesPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Addiction Healing Programmes", path: "/addiction-healing-programmes/" },
          ]),
        ]}
      />
      <Hero
        eyebrow="Addiction healing programmes"
        title="A scalable support system for addiction patterns"
        description="Start with gambling addiction or food addiction / binge eating support now. Additional addiction categories can be expanded into dedicated SEO and Google Ads landing pages when ready."
        primaryCta="Start Your Confidential Enquiry"
        secondaryCta="Gambling Addiction Help"
        secondaryHref="/gambling-addiction-help/"
      />

      <section className="section" aria-labelledby="programme-grid-heading">
        <div className="container">
          <div className="section-heading">
            <p className="eyebrow">Current and future categories</p>
            <h2 id="programme-grid-heading">Choose the pattern you want support with</h2>
            <p>Each category now has a dedicated pillar URL. Active programmes are fully expanded, while other categories support confidential enquiries now.</p>
          </div>
          <div className="programme-grid">
            {programmes.map((programme) => (
              <ProgrammeCard key={programme.title} programme={programme} />
            ))}
          </div>
        </div>
      </section>

      <ProcessSteps
        steps={processSteps}
        title="The shared programme rhythm"
        intro="Each dedicated pillar page follows the same lead-capture structure while adapting language, FAQs, schema and conversion copy for that category."
      />
      <Disclaimer />
      <section className="section form-section" aria-labelledby="programmes-form-heading">
        <div className="container form-layout">
          <div>
            <p className="eyebrow">Confidential enquiry</p>
            <h2 id="programmes-form-heading">Ask about a programme</h2>
            <p>Use this form if you are unsure which category fits, or if you want to ask about a coming support area.</p>
          </div>
          <LeadForm />
        </div>
      </section>
    </>
  );
}
