"use client";

export type CookieConsentState = {
  essential: true;
  analytics: boolean;
  decidedAt: string | null;
};

const CONSENT_KEY = "hfya_cookie_consent";
const CONSENT_COOKIE = "hfya_cookie_consent";

const DEFAULT_CONSENT: CookieConsentState = {
  essential: true,
  analytics: false,
  decidedAt: null,
};

function parseConsent(raw: string | null): CookieConsentState | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    if (parsed.essential !== true) return null;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      decidedAt: typeof parsed.decidedAt === "string" ? parsed.decidedAt : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

function writeCookie(value: string) {
  const maxAge = 60 * 60 * 24 * 365;
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function readCookieConsent(): CookieConsentState {
  if (typeof window === "undefined") return DEFAULT_CONSENT;

  try {
    const fromStorage = parseConsent(localStorage.getItem(CONSENT_KEY));
    if (fromStorage) return fromStorage;

    const cookieMatch = document.cookie
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));

    if (cookieMatch) {
      const decoded = decodeURIComponent(cookieMatch.slice(CONSENT_COOKIE.length + 1));
      const fromCookie = parseConsent(decoded);
      if (fromCookie) {
        localStorage.setItem(CONSENT_KEY, JSON.stringify(fromCookie));
        return fromCookie;
      }
    }
  } catch {
    // Fall through to default.
  }

  return DEFAULT_CONSENT;
}

export function hasAnalyticsConsent() {
  return readCookieConsent().analytics;
}

export function hasConsentDecision() {
  return readCookieConsent().decidedAt !== null;
}

export function saveCookieConsent(analytics: boolean) {
  const next: CookieConsentState = {
    essential: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
    writeCookie(JSON.stringify(next));
  } catch {
    // Storage may be blocked; cookie still helps GTM on reload.
    writeCookie(JSON.stringify(next));
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hfya:consent-change", { detail: next }));
  }

  return next;
}

export function updateGoogleConsentMode(analytics: boolean) {
  if (typeof window === "undefined") return;

  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (!gtag) return;

  gtag("consent", "update", {
    analytics_storage: analytics ? "granted" : "denied",
    ad_storage: analytics ? "granted" : "denied",
    ad_user_data: analytics ? "granted" : "denied",
    ad_personalization: analytics ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  });
}
