import Link from "next/link";
import { AnalyticsSparkline } from "@/components/dashboard/AnalyticsSparkline";
import { getAnalyticsSummary } from "@/lib/dashboard/analyticsQueries";

export async function AnalyticsOverviewStrip() {
  let summary;
  try {
    summary = await getAnalyticsSummary(30);
  } catch {
    return null;
  }

  return (
    <section className="dashboard-panel dashboard-analytics-overview">
      <div className="dashboard-panel-header">
        <div>
          <h2>Site activity (30 days)</h2>
          <p className="dashboard-inline-note">First-party analytics across consent tiers</p>
        </div>
        <Link href="/admin/analytics/" className="dashboard-panel-link">
          Open full analytics →
        </Link>
      </div>

      <div className="dashboard-stat-grid dashboard-stat-grid-4">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Page views</p>
          <p className="dashboard-stat-value">{summary.summary.pageViews.toLocaleString()}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Sessions</p>
          <p className="dashboard-stat-value">{summary.summary.sessions.toLocaleString()}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Form submits</p>
          <p className="dashboard-stat-value">{summary.summary.formSubmits.toLocaleString()}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">CTA clicks</p>
          <p className="dashboard-stat-value">{summary.summary.ctaClicks.toLocaleString()}</p>
        </article>
      </div>

      <AnalyticsSparkline data={summary.dailySeries} />
    </section>
  );
}
