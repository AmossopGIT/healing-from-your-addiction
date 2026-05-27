import { withBasePath } from "@/lib/basePath";

const productionSiteUrl = "https://healingfromyouraddiction.co.za";
const localhostPattern = /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?$/i;

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
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const configuredOrigin = configured ? normalizeOrigin(configured) : null;
  const browserOrigin = getBrowserOrigin();

  if (configuredOrigin) {
    if (process.env.NODE_ENV === "production" && isLocalhostOrigin(configuredOrigin)) {
      return productionSiteUrl;
    }
    return configuredOrigin;
  }

  if (browserOrigin) {
    return browserOrigin;
  }

  return productionSiteUrl;
}

export function buildAuthEmailRedirect(path: string) {
  return new URL(withBasePath(path), `${getAuthEmailOrigin()}/`).toString();
}
