import type { Metadata } from "next";
import Link from "next/link";
import { SeedProgrammesButton } from "@/components/dashboard/SeedProgrammesButton";
import { catalogueSummary } from "@/lib/programme/interactive/content";
import { getProgrammeReportingSummary } from "@/lib/programme/interactive/reporting";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programmes | Admin",
  description: "Interactive programme templates and publishing status.",
  path: "/admin/programmes/",
  noIndex: true,
});

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const [{ data: templates }, reporting] = await Promise.all([
    supabase.from("programme_templates").select("*").order("addiction_slug"),
    getProgrammeReportingSummary(),
  ]);
  const templateBySlug = new Map((templates ?? []).map((template) => [template.addiction_slug, template]));
  const catalogue = catalogueSummary();

  const readyCount = catalogue.filter((item) => !item.issues.some((issue) => issue.level === "error")).length;
  const reviewCount = catalogue.filter((item) => item.needsManualReview).length;
  const publishedCount = (templates ?? []).filter((template) => template.status === "published").length;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programmes</p>
        <h1>Interactive programme library</h1>
        <p>
          <Link href="/admin/programmes/operations/">Operations</Link>
          {" · "}
          <Link href="/admin/programmes/review/">Source review queue</Link>
          {" · "}
          {catalogue.length} structured journeys from source content · {readyCount} validation-ready · {reviewCount} need
          manual review · {publishedCount} published in database
        </p>
      </section>

      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Definitions</p>
          <p className="admin-programme-stat-value">{catalogue.length}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Ready</p>
          <p className="admin-programme-stat-value">{readyCount}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Manual review</p>
          <p className="admin-programme-stat-value">{reviewCount}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Published</p>
          <p className="admin-programme-stat-value">{publishedCount}</p>
        </article>
      </section>

      <SeedProgrammesButton />

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Engagement funnel</h2>
          <Link href="/admin/programmes/operations/" className="dashboard-panel-link">
            Operations detail
          </Link>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Programme</th>
                <th>Enrolled</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Avg activities done</th>
                <th>Inactive 5+ days</th>
                <th>Safety flags</th>
              </tr>
            </thead>
            <tbody>
              {reporting.map((row) => (
                <tr key={row.addictionSlug}>
                  <td>
                    <Link href={`/admin/programmes/${row.addictionSlug}/`}>{row.title}</Link>
                  </td>
                  <td>{row.enrollments}</td>
                  <td>{row.started}</td>
                  <td>{row.completed}</td>
                  <td>{row.avgCompletedActivities}</td>
                  <td>{row.inactiveActiveClients}</td>
                  <td>{row.safetyFlags}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>All programmes</h2>
          <Link href="/admin/programmes/operations/" className="dashboard-panel-link">
            Open operations view
          </Link>
        </div>
        <div className="dashboard-table-wrap">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Category</th>
                <th>Activities</th>
                <th>DB status</th>
                <th>Validation</th>
              </tr>
            </thead>
            <tbody>
              {catalogue.map((item) => {
                const template = templateBySlug.get(item.slug);
                const errors = item.issues.filter((issue) => issue.level === "error").length;
                const warnings = item.issues.filter((issue) => issue.level === "warning").length;
                return (
                  <tr key={item.slug}>
                    <td>
                      <Link href={`/admin/programmes/${item.slug}/`}>{item.title}</Link>
                    </td>
                    <td>{item.slug}</td>
                    <td>{item.category}</td>
                    <td>{item.activityCount}</td>
                    <td>{template?.status ?? "not seeded"}</td>
                    <td>
                      {errors > 0
                        ? `${errors} error${errors === 1 ? "" : "s"}`
                        : warnings > 0
                          ? `${warnings} warning${warnings === 1 ? "" : "s"}`
                          : "OK"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
