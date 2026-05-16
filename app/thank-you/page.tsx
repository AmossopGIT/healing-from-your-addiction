import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { ThankYouTracker } from "@/components/ThankYouTracker";
import { TrackedLink } from "@/components/TrackedLink";
import { seoPages } from "@/content/seo";
import { emailHref, siteConfig, whatsappHref } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";

const pageSeo = seoPages.thankYou;

export const metadata = createPageMetadata(pageSeo);

export default function ThankYouPage() {
  return (
    <>
      <ThankYouTracker />
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Thank You", path: "/thank-you/" },
          ]),
        ]}
      />
      <section className="thank-you section-band page-hero-flush" aria-labelledby="thank-you-heading">
        <div className="container narrow thank-you-card">
          <p className="eyebrow">Enquiry received</p>
          <h1 id="thank-you-heading">Thank you. Your confidential enquiry has been received.</h1>
          <p className="lead">
            Gerald will respond as soon as possible using the contact method you selected.
          </p>
          <div className="button-row">
            <TrackedLink
              href={whatsappHref()}
              className="button button-primary"
              tracking={{ eventName: "whatsapp_click", linkLocation: "thank_you_page" }}
            >
              WhatsApp Gerald
            </TrackedLink>
            <TrackedLink
              href={emailHref()}
              className="button button-secondary"
              tracking={{ eventName: "email_click", linkLocation: "thank_you_page", payload: { email: siteConfig.email } }}
            >
              Email Gerald
            </TrackedLink>
          </div>
        </div>
      </section>
      <Disclaimer title="If this is urgent" />
      <CTASection
        title="Return to the programmes"
        body="You can continue reading about the current gambling and food addiction support pages while you wait for a response."
        button="View Programmes"
        href="/addiction-healing-programmes/"
      />
    </>
  );
}
