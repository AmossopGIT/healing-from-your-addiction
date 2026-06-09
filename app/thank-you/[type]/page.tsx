import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CTASection } from "@/components/CTASection";
import { Disclaimer } from "@/components/Disclaimer";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { ThankYouTracker } from "@/components/ThankYouTracker";
import { TrackedLink } from "@/components/TrackedLink";
import { emailHref, siteConfig, whatsappHref } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";
import { breadcrumbSchema, webPageSchema } from "@/lib/schema";

type PageProps = {
  params: Promise<{ type: string }>;
};

const thankYouPages = {
  "gambling-addiction": {
    title: "Gambling Enquiry Received | Healing From Your Addiction",
    h1: "Thank you. Your gambling recovery enquiry has been received.",
    description: "Thank you for your confidential gambling addiction enquiry. Gerald Crawford will respond as soon as possible.",
    returnHref: "/addictions/gambling-addiction-help/",
    returnLabel: "Return to Gambling Program",
  },
  "food-addiction": {
    title: "Food Addiction Enquiry Received | Healing From Your Addiction",
    h1: "Thank you. Your food recovery enquiry has been received.",
    description: "Thank you for your confidential food addiction or binge eating enquiry. Gerald Crawford will respond as soon as possible.",
    returnHref: "/addictions/food-addiction-binge-eating-help/",
    returnLabel: "Return to Food Program",
  },
  "general-enquiry": {
    title: "Enquiry Received | Healing From Your Addiction",
    h1: "Thank you. Your confidential enquiry has been received.",
    description: "Thank you for your confidential enquiry. Gerald Crawford will respond as soon as possible.",
    returnHref: "/addictions/",
    returnLabel: "Explore Addiction Support",
  },
} as const;

export function generateStaticParams() {
  return Object.keys(thankYouPages).map((type) => ({ type }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { type } = await params;
  const page = thankYouPages[type as keyof typeof thankYouPages];
  if (!page) {
    return createMetadata({
      title: "Thank You | Healing From Your Addiction",
      description: "Thank you for your confidential enquiry.",
      path: "/thank-you/",
      noIndex: true,
    });
  }

  return createMetadata({
    title: page.title,
    description: page.description,
    path: `/thank-you/${type}/`,
    noIndex: true,
  });
}

export default async function ThankYouTypePage({ params }: PageProps) {
  const { type } = await params;
  const page = thankYouPages[type as keyof typeof thankYouPages];
  if (!page) notFound();

  const path = `/thank-you/${type}/`;

  return (
    <>
      <ThankYouTracker />
      <SchemaMarkup
        data={[
          webPageSchema(page.title, page.description, path),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Thank You", path },
          ]),
        ]}
      />
      <section className="thank-you section-band page-hero-flush" aria-labelledby="thank-you-heading">
        <div className="container narrow thank-you-card">
          <p className="eyebrow">Enquiry received</p>
          <h1 id="thank-you-heading">{page.h1}</h1>
          <p className="lead">Gerald will review your intake and respond as soon as possible using the contact method you selected.</p>
          <p>If your situation becomes medically urgent, contact emergency services or your GP immediately.</p>
          <div className="button-row">
            <TrackedLink href={whatsappHref()} className="button button-primary" tracking={{ eventName: "whatsapp_click", linkLocation: `thank_you_${type}` }}>
              WhatsApp Gerald
            </TrackedLink>
            <TrackedLink href={emailHref()} className="button button-secondary" tracking={{ eventName: "email_click", linkLocation: `thank_you_${type}`, payload: { email: siteConfig.email } }}>
              Email Gerald
            </TrackedLink>
          </div>
        </div>
      </section>
      <Disclaimer title="If this is urgent" />
      <section className="section section-band">
        <div className="container narrow">
          <h2>Create your client portal account</h2>
          <p>While you wait for Gerald to respond, you can create a free portal account to prepare for your programme and keep materials in one place.</p>
          <TrackedLink href="/portal/sign-up/" className="button button-secondary" tracking={{ eventName: "cta_click", linkLocation: "thank_you_portal_signup", payload: { cta_name: "Create portal account" } }}>
            Create portal account
          </TrackedLink>
        </div>
      </section>
      <CTASection title="Continue reading while you wait" body="You can return to the relevant support page or explore the wider addiction support hub." button={page.returnLabel} href={page.returnHref} />
    </>
  );
}
