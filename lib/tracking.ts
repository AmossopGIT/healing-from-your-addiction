"use client";

import { collectEvent } from "@/lib/analytics/collect";
import { hasAnalyticsConsent } from "@/lib/analytics/consent";
import { getSeoByPath } from "@/content/seo";

type DataLayerPayload = Record<string, unknown>;

declare global {
  interface Window {
    dataLayer?: DataLayerPayload[];
  }
}

function normalizePath(path: string) {
  if (!path) return "/";
  if (path === "/") return path;
  return path.endsWith("/") ? path : `${path}/`;
}

export function getCurrentSeoContext() {
  if (typeof window === "undefined") return {};

  const embedded = document.getElementById("page-seo-context");
  if (embedded?.textContent) {
    try {
      const parsed = JSON.parse(embedded.textContent) as {
        path?: string;
        pageType?: string;
        primaryKeyword?: string;
        conversionGoal?: string;
      };
      if (parsed.path) {
        return {
          landing_page: parsed.path,
          page_type: parsed.pageType,
          primary_keyword: parsed.primaryKeyword,
          conversion_goal: parsed.conversionGoal,
        };
      }
    } catch {
      // Fall back to static SEO lookup.
    }
  }

  const page = getSeoByPath(normalizePath(window.location.pathname));
  if (!page) {
    return {
      landing_page: window.location.pathname,
    };
  }

  return {
    landing_page: page.path,
    page_type: page.pageType,
    primary_keyword: page.primaryKeyword,
    conversion_goal: page.conversionGoal,
  };
}

export function pushDataLayer(event: string, payload: DataLayerPayload = {}) {
  if (typeof window === "undefined") return;

  const seo = getCurrentSeoContext();
  const consentTier = hasAnalyticsConsent() ? "analytics" : "essential";

  collectEvent({
    event_name: event,
    page_path: window.location.pathname,
    consent_tier: consentTier,
    ...seo,
    properties: payload,
  });

  if (!hasAnalyticsConsent()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_path: window.location.pathname,
    ...seo,
    ...payload,
  });
}

export function trackCtaClick(ctaName: string, extra: DataLayerPayload = {}) {
  pushDataLayer("cta_click", {
    cta_name: ctaName,
    ...extra,
  });
}

export function trackWhatsAppClick(linkLocation: string) {
  pushDataLayer("whatsapp_click", { link_location: linkLocation });
}

export function trackEmailClick(linkLocation: string, email?: string) {
  pushDataLayer("email_click", { link_location: linkLocation, email });
}

export function trackPhoneClick(linkLocation: string) {
  pushDataLayer("phone_click", { link_location: linkLocation });
}
