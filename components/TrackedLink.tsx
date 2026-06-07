"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { SiteLink } from "@/components/SiteLink";
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

function isInternalPath(href: string | undefined) {
  return Boolean(href && href.startsWith("/") && !href.startsWith("//"));
}

export function TrackedLink({ tracking, onClick, children, href, ...props }: TrackedLinkProps) {
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

  if (isInternalPath(href)) {
    return (
      <SiteLink href={href!} {...props} onClick={handleClick} data-analytics-tracked={tracking ? "true" : undefined}>
        {children}
      </SiteLink>
    );
  }

  return (
    <a {...props} href={href} onClick={handleClick} data-analytics-tracked={tracking ? "true" : undefined}>
      {children}
    </a>
  );
}
