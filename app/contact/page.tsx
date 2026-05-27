import { Disclaimer } from "@/components/Disclaimer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { seoPages } from "@/content/seo";
import { emailHref, formatSouthAfricanPhone, phoneHref, siteConfig, whatsappHref } from "@/lib/constants";
import { createPageMetadata } from "@/lib/seo";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";
import { FaFacebook, FaInstagram } from "react-icons/fa6";

const pageSeo = seoPages.contact;

const whatsappArt = artGalleryById.get("contact-whatsapp");
const emailArt = artGalleryById.get("contact-email");
const phoneArt = artGalleryById.get("contact-phone");
const displayPhone = formatSouthAfricanPhone(siteConfig.phone);

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
        title="Start with a confidential, structured enquiry"
        description="Use the form or contact options below to share your current challenges, urgency and preferred follow-up channel. This is non-emergency support triage."
        primaryCta="Use the Enquiry Form"
        secondaryCta="WhatsApp Gerald"
        secondaryHref="#contact-options"
      >
        <LeadForm />
      </Hero>

      <section className="section" id="contact-options" aria-labelledby="contact-options-heading">
        <div className="container three-grid">
          <article className="contact-card contact-card-channel">
            <h2 id="contact-options-heading">Follow Healing From Your Addiction</h2>
            <p>Stay connected for updates, guidance and new resources.</p>
            <div className="button-row">
              <TrackedLink
                href="https://www.facebook.com/profile.php?id=61590084852348"
                className="button button-secondary button-small"
                target="_blank"
                rel="noopener noreferrer"
                tracking={{ ctaName: "facebook_contact", linkLocation: "contact_page" }}
              >
                <FaFacebook className="button-icon" aria-hidden="true" />
                <span>Facebook</span>
              </TrackedLink>
              <TrackedLink
                href="https://www.instagram.com/healingfromyouraddiction/"
                className="button button-secondary button-small"
                target="_blank"
                rel="noopener noreferrer"
                tracking={{ ctaName: "instagram_contact", linkLocation: "contact_page" }}
              >
                <FaInstagram className="button-icon" aria-hidden="true" />
                <span>Instagram</span>
              </TrackedLink>
            </div>
          </article>
          <article className="contact-card contact-card-channel">
            {whatsappArt ? (
              <WatercolorArtwork item={whatsappArt} className="card-artwork" fill sizes="(min-width: 900px) 28vw, 92vw" />
            ) : null}
            <h2>WhatsApp</h2>
            <p>Use WhatsApp if you prefer a direct, private first message.</p>
            <TrackedLink
              href={whatsappHref()}
              className="button button-secondary"
              tracking={{ eventName: "whatsapp_click", linkLocation: "contact_page" }}
            >
              WhatsApp Gerald
            </TrackedLink>
          </article>
          <article className="contact-card contact-card-channel">
            {emailArt ? (
              <WatercolorArtwork item={emailArt} className="card-artwork" fill sizes="(min-width: 900px) 28vw, 92vw" />
            ) : null}
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
            {phoneArt ? (
              <WatercolorArtwork item={phoneArt} className="card-artwork" fill sizes="(min-width: 900px) 28vw, 92vw" />
            ) : null}
            <h2>Phone</h2>
            <p>Tap to call directly.</p>
            <TrackedLink
              href={phoneHref()}
              className="button button-secondary"
              tracking={{ eventName: "phone_click", linkLocation: "contact_page" }}
            >
              {displayPhone || "Phone enquiry"}
            </TrackedLink>
          </article>
        </div>
      </section>

      <section className="section section-muted" aria-labelledby="privacy-heading">
        <div className="container narrow prose">
          <p className="eyebrow">Privacy and confidentiality</p>
          <h2 id="privacy-heading">Your enquiry is treated respectfully</h2>
          <p>
            Addiction-related enquiries can feel sensitive. The form asks only for information needed to respond safely and appropriately. If you are facing severe withdrawal symptoms, overdose risk, or immediate danger, contact emergency medical services or a doctor now.
          </p>
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
