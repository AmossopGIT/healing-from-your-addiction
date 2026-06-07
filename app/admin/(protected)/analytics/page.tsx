import type { Metadata } from "next";
import { Suspense } from "react";
import { AnalyticsDashboard } from "@/components/dashboard/AnalyticsDashboard";
import { parseAnalyticsRange } from "@/lib/analytics/types";
import { getAnalyticsBundle } from "@/lib/dashboard/analyticsQueries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Analytics | Admin | Healing From Your Addiction",
  description: "Site analytics dashboard for page views, conversions, and attribution.",
  path: "/admin/analytics/",
  noIndex: true,
});

type AnalyticsPageProps = {
  searchParams: Promise<{ range?: string }>;
};

export default async function AdminAnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const params = await searchParams;
  const range = parseAnalyticsRange(params.range ?? "30");
  const bundle = await getAnalyticsBundle(range);

  return (
    <Suspense fallback={<div className="dashboard-panel">Loading analytics…</div>}>
      <AnalyticsDashboard initialBundle={bundle} />
    </Suspense>
  );
}
