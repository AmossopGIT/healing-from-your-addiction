"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/tracking";

export function ThankYouTracker() {
  useEffect(() => {
    pushDataLayer("thank_you_view", {
      page_type: "conversion_destination",
    });
  }, []);

  return null;
}
