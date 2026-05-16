import { useEffect } from "react";
import { pushDataLayer } from "@/lib/tracking";

export function useThankYouTracking() {
  useEffect(() => {
    pushDataLayer("thank_you_view", {
      page_type: "conversion_destination",
    });
  }, []);
}
