import { withBasePath } from "@/lib/basePath";
import { siteConfig } from "@/lib/constants";

const productionSiteUrl = siteConfig.siteUrl.replace(/\/$/, "");
const localhostPattern = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i;
const productionHostPattern = /healingfromyouraddiction\.co\.za$/i;

function normalizeOrigin(value: string) {
  return value.replace(/\/+$/, "");
}

function isLocalhostOrigin(value: string) {
  try {
    return localhostPattern.test(new URL(value).origin);
  } catch {
    return false;
  }
}

function getBrowserOrigin() {
  if (typeof window === "undefined") {
    return null;
  }

  return normalizeOrigin(window.location.origin);
}

export function getAuthEmailOrigin() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim() || productionSiteUrl;
  const configuredOrigin = normalizeOrigin(configured);
  const browserOrigin = getBrowserOrigin();

  if (process.env.NODE_ENV === "production") {
    if (isLocalhostOrigin(configuredOrigin)) {
      return productionSiteUrl;
    }
    return configuredOrigin;
  }

  if (browserOrigin && productionHostPattern.test(new URL(browserOrigin).hostname)) {
    return browserOrigin;
  }

  if (browserOrigin && !isLocalhostOrigin(browserOrigin)) {
    return browserOrigin;
  }

  if (!isLocalhostOrigin(configuredOrigin)) {
    return configuredOrigin;
  }

  return browserOrigin ?? productionSiteUrl;
}

export function buildAuthEmailRedirect(path: string) {
  return new URL(withBasePath(path), `${getAuthEmailOrigin()}/`).toString();
}
