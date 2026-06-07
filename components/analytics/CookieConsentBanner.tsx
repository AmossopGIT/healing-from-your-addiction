"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  hasConsentDecision,
  readCookieConsent,
  saveCookieConsent,
  updateGoogleConsentMode,
} from "@/lib/analytics/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    setVisible(!hasConsentDecision());
  }, []);

  if (!visible) return null;

  function accept(analytics: boolean) {
    saveCookieConsent(analytics);
    updateGoogleConsentMode(analytics);
    setVisible(false);
  }

  const consent = readCookieConsent();

  return (
    <div className="cookie-consent-banner" role="dialog" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-inner">
        <div className="cookie-consent-copy">
          <p className="eyebrow">Cookies & privacy</p>
          <h2 id="cookie-consent-title">Your privacy choices</h2>
          <p>
            We use essential first-party analytics to understand how the site is used and improve support
            pathways. With your consent, we also enable analytics cookies through Google Tag Manager.
          </p>
          {showDetails ? (
            <p className="cookie-consent-details">
              Essential tracking records anonymous page views and conversion steps before you choose.
              Analytics cookies help us measure campaigns in GA4 after you accept. Read our{" "}
              <Link href="/privacy-policy/">privacy policy</Link>.
            </p>
          ) : null}
        </div>
        <div className="cookie-consent-actions">
          <button type="button" className="button button-primary" onClick={() => accept(true)}>
            Accept all
          </button>
          <button type="button" className="button button-secondary" onClick={() => accept(false)}>
            Essential only
          </button>
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setShowDetails((value) => !value)}
          >
            {showDetails ? "Hide details" : "Manage"}
          </button>
        </div>
        {consent.decidedAt ? null : (
          <p className="cookie-consent-note">No choice saved yet — essential analytics are active now.</p>
        )}
      </div>
    </div>
  );
}
