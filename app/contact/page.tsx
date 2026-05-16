import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrackedLink } from "@/components/TrackedLink";
import { seoPages } from "@/content/seo";
import { emailHref, phoneHref, siteConfig, whatsappHref } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.contact;

export const metadata = createPageMetadata(pageSeo);

export default function ContactPage() {
  return (
    <>
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact/" },
          ]),
        ]}
      />
      <Hero
        eyebrow="Contact Gerald Crawford"
        title="Start with a confidential enquiry"
        description="Use the form or contact options below to ask about addiction pattern support. Choose WhatsApp, phone or email as your preferred response method."
        primaryCta="Use the Enquiry Form"
        secondaryCta="WhatsApp Gerald"
        secondaryHref="#contact-options"
      >
        <LeadForm />
      </Hero>

      <section className="section" id="contact-options" aria-labelledby="contact-options-heading">
        <div className="container three-grid">
          <article className="contact-card">
            <h2 id="contact-options-heading">WhatsApp</h2>
            <p>Use WhatsApp if you prefer a direct, private first message.</p>
            <TrackedLink
              href={whatsappHref()}
              className="button button-secondary"
              tracking={{ eventName: "whatsapp_click", linkLocation: "contact_page" }}
            >
              WhatsApp Gerald
            </TrackedLink>
          </article>
          <article className="contact-card">
            <h2>Email</h2>
            <p>Send a confidential enquiry by email.</p>
            <TrackedLink
              href={emailHref()}
              className="button button-secondary"
              tracking={{ eventName: "email_click", linkLocation: "contact_page", payload: { email: siteConfig.email } }}
            >
              {siteConfig.email}
            </TrackedLink>
          </article>
          <article className="contact-card">
            <h2>Phone</h2>
            <p>{siteConfig.phone ? "Tap to call directly." : "Add a public phone number in the environment variables when ready."}</p>
            <TrackedLink
              href={phoneHref()}
              className="button button-secondary"
              tracking={{ eventName: "phone_click", linkLocation: "contact_page" }}
            >
              {siteConfig.phone || "Phone enquiry"}
            </TrackedLink>
          </article>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="privacy-heading">
        <div className="container narrow prose">
          <p className="eyebrow">Privacy and confidentiality</p>
          <h2 id="privacy-heading">Your enquiry is treated respectfully</h2>
          <p>
            Addiction-related enquiries can feel sensitive. The form asks only for the information needed to respond and understand the concern. Do not include emergency medical information in the form; use urgent care or emergency services where required.
          </p>
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
