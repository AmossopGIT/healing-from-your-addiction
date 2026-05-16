"use client";

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

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    page_path: window.location.pathname,
    ...getCurrentSeoContext(),
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
