import type { AnalyticsBundle, AnalyticsRange } from "@/lib/analytics/types";
import { getAnalyticsBundle } from "@/lib/dashboard/analyticsQueries";

export type AnalyticsProviderSource = "first_party" | "ga4" | "gsc";

export type ProviderResult<T> =
  | { status: "ok"; data: T }
  | { status: "not_configured"; message: string }
  | { status: "error"; message: string };

export async function getFirstPartyReport(range: AnalyticsRange): Promise<ProviderResult<AnalyticsBundle>> {
  try {
    const data = await getAnalyticsBundle(range);
    return { status: "ok", data };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Failed to load analytics.",
    };
  }
}

export async function getGa4Report(_range: AnalyticsRange): Promise<ProviderResult<null>> {
  const propertyId = process.env.GA4_PROPERTY_ID?.trim();
  if (!propertyId) {
    return {
      status: "not_configured",
      message: "GA4 Reporting API is not connected yet. Add GA4_PROPERTY_ID and a service account in a future release.",
    };
  }

  return {
    status: "not_configured",
    message: "GA4 API credentials are present but the connector is not enabled in this build.",
  };
}

export async function getGscReport(_range: AnalyticsRange): Promise<ProviderResult<null>> {
  const siteUrl = process.env.GSC_SITE_URL?.trim();
  if (!siteUrl) {
    return {
      status: "not_configured",
      message: "Search Console API is not connected yet. Add GSC_SITE_URL and credentials in a future release.",
    };
  }

  return {
    status: "not_configured",
    message: "Search Console credentials are present but the connector is not enabled in this build.",
  };
}

export async function getAnalyticsReport(source: AnalyticsProviderSource, range: AnalyticsRange) {
  switch (source) {
    case "first_party":
      return getFirstPartyReport(range);
    case "ga4":
      return getGa4Report(range);
    case "gsc":
      return getGscReport(range);
    default:
      return { status: "error", message: "Unknown analytics source." } as const;
  }
}
