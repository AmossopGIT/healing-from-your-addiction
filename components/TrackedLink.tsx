"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import {
  pushDataLayer,
  trackCtaClick,
  trackEmailClick,
  trackPhoneClick,
  trackWhatsAppClick,
} from "@/lib/tracking";

type TrackingConfig = {
  eventName?: "cta_click" | "whatsapp_click" | "email_click" | "phone_click" | "programme_card_click";
  ctaName?: string;
  linkLocation?: string;
  payload?: Record<string, unknown>;
};

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  tracking?: TrackingConfig;
};

export function TrackedLink({ tracking, onClick, children, ...props }: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (tracking?.eventName === "whatsapp_click") {
      trackWhatsAppClick(tracking.linkLocation || tracking.ctaName || "link");
    } else if (tracking?.eventName === "email_click") {
      trackEmailClick(tracking.linkLocation || tracking.ctaName || "link", tracking.payload?.email as string | undefined);
    } else if (tracking?.eventName === "phone_click") {
      trackPhoneClick(tracking.linkLocation || tracking.ctaName || "link");
    } else if (tracking?.eventName === "programme_card_click") {
      pushDataLayer("programme_card_click", {
        programme_name: tracking.ctaName,
        ...tracking.payload,
      });
    } else if (tracking?.ctaName) {
      trackCtaClick(tracking.ctaName, tracking.payload);
    }

    onClick?.(event);
  }

  return (
    <a {...props} onClick={handleClick}>
      {children}
    </a>
  );
}
