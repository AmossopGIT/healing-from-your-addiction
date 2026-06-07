"use client";

import { useEffect } from "react";
import { hasConsentDecision, readCookieConsent, updateGoogleConsentMode } from "@/lib/analytics/consent";

export function ConsentRestore() {
  useEffect(() => {
    if (!hasConsentDecision()) return;
    updateGoogleConsentMode(readCookieConsent().analytics);
  }, []);

  return null;
}
