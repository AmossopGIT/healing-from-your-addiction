"use client";

import { useEffect } from "react";
import { pushDataLayer } from "@/lib/tracking";

export function NeedHelpPageTracker() {
  useEffect(() => {
    pushDataLayer("need_help_page_view", {
      page_type: "contact",
      conversion_goal: "Start the confidential help wizard or use direct contact options.",
    });
  }, []);

  return null;
}
