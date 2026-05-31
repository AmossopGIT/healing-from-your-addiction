import { Disclaimer } from "@/components/Disclaimer";
import { NeedHelpPageTracker } from "@/components/NeedHelpPageTracker";
import { NeedHelpWizard } from "@/components/NeedHelpWizard";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { TrackedLink } from "@/components/TrackedLink";
import { WatercolorArtwork } from "@/components/WatercolorArtwork";
import { artGalleryById } from "@/content/artGallery";
import { seoPages } from "@/content/seo";
import { emailHref, siteConfig, whatsappHref } from "@/lib/constants";
import { breadcrumbSchema, professionalServiceSchema, webPageSchema } from "@/lib/schema";
import { createPageMetadata } from "@/lib/seo";

const pageSeo = seoPages.needHelp;
const wizardArt = artGalleryById.get("confidential-enquiry");

export const metadata = createPageMetadata(pageSeo);

type PageProps = {
  searchParams: Promise<{ concern?: string }>;
};

export default async function NeedHelpPage({ searchParams }: PageProps) {
  const { concern } = await searchParams;

  return (
    <>
      <NeedHelpPageTracker />
      <SchemaMarkup
        data={[
          professionalServiceSchema(),
          webPageSchema(pageSeo),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact/" },
            { name: "Need help", path: "/need-help/" },
          ]),
        ]}
      />
      <section className="need-help-hero page-hero-flush section-band">
        <div className="container need-help-hero-grid">
          {wizardArt ? (
            <WatercolorArtwork
              item={wizardArt}
              className="need-help-hero-art hero-visual"
              priority
              sizes="(min-width: 900px) 28vw, 92vw"
            />
          ) : null}
          <div className="need-help-hero-copy">
            <p className="eyebrow">Need help wizard</p>
            <h1>Confidential enquiry, one calm step at a time</h1>
            <p className="lead">
              A short guided flow to share your concern, contact details, and how urgent support feels — without a long
              form on one screen.
            </p>
            <p className="need-help-hero-note">
              Prefer a direct message?{" "}
              <TrackedLink href={whatsappHref()} tracking={{ eventName: "whatsapp_click", linkLocation: "need_help_page" }}>
                WhatsApp Gerald
              </TrackedLink>{" "}
              or{" "}
              <TrackedLink
                href={emailHref()}
                tracking={{ eventName: "email_click", linkLocation: "need_help_page", payload: { email: siteConfig.email } }}
              >
                email
              </TrackedLink>
              .
            </p>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="need-help-wizard-heading">
        <div className="container narrow">
          <h2 id="need-help-wizard-heading" className="visually-hidden">
            Confidential help wizard
          </h2>
          <NeedHelpWizard defaultConcern={concern} />
        </div>
      </section>

      <Disclaimer />
    </>
  );
}
