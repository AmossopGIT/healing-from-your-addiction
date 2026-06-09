"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pushDataLayer } from "@/lib/tracking";

export function ThankYouTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const concernType = pathname.match(/\/thank-you\/([^/]+)\/?$/)?.[1] ?? "general";
    pushDataLayer("thank_you_view", {
      page_type: "conversion_destination",
      concern_type: concernType,
    });
  }, [pathname]);

  return null;
}
