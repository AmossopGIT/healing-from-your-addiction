import { FAQSection } from "@/components/FAQSection";
import { Hero } from "@/components/Hero";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { homeFaqs, gamblingFaqs, foodFaqs } from "@/content/faqs";
import { seoPages } from "@/content/seo";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, faqSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.faqs;
const faqs = [...homeFaqs, ...gamblingFaqs, ...foodFaqs];

export const metadata = createPageMetadata(pageSeo);

export default function FaqsPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          webPageSchema(pageSeo),
          faqSchema(faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQs", path: pageSeo.path },
          ]),
        ]}
      />
      <Hero
        eyebrow="Frequently asked questions"
        title="Addiction hypnotherapy FAQs"
        description="Answers about confidentiality, safety, gambling addiction support, food addiction support, healing packages and when medical care may be required."
        primaryCta="Compare healing packages"
        primaryHref="/programs/healing-packages/"
        secondaryCta="Start a Confidential Enquiry"
        secondaryHref="/contact/"
      />
      <FAQSection title="Common questions" faqs={faqs} />
    </>
  );
}
