"use client";

import { emailHref, siteConfig, whatsappHref } from "@/lib/constants";
import { TrackedLink } from "@/components/TrackedLink";

type StickyMobileCTAProps = {
  enquireLabel?: string;
};

export function StickyMobileCTA({ enquireLabel = "Enquire" }: StickyMobileCTAProps) {
  return (
    <div className="sticky-mobile-cta" aria-label="Mobile contact options">
      <TrackedLink
        href="/need-help/"
        className="button button-primary"
        tracking={{ ctaName: enquireLabel, payload: { cta_location: "sticky_mobile" } }}
      >
        {enquireLabel}
      </TrackedLink>
      <TrackedLink
        href={whatsappHref()}
        className="button button-secondary"
        tracking={{ eventName: "whatsapp_click", linkLocation: "sticky_mobile_cta" }}
      >
        WhatsApp
      </TrackedLink>
      <TrackedLink
        href={emailHref()}
        className="visually-hidden"
        tracking={{ eventName: "email_click", linkLocation: "sticky_mobile_cta", payload: { email: siteConfig.email } }}
      >
        Email
      </TrackedLink>
    </div>
  );
}
