"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "hfya_post_onboarding_next";

export function OnboardingNextField() {
  const [nextPath, setNextPath] = useState("/portal/?onboarded=1");

  useEffect(() => {
    try {
      const stored = window.sessionStorage.getItem(STORAGE_KEY);
      if (stored && stored.startsWith("/portal/") && !stored.startsWith("//")) {
        setNextPath(stored);
        window.sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Ignore storage access issues.
    }
  }, []);

  return <input type="hidden" name="redirectTo" value={nextPath} />;
}
