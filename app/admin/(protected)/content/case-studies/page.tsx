import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Case Studies CMS | Admin",
  description: "Manage case studies.",
  path: "/admin/content/case-studies/",
  noIndex: true,
});

export default async function AdminCaseStudyListPage() {
  const studies = await fetchAllCmsCaseStudies(true);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Case studies</h1>
        <Link className="button button-primary" href="/admin/content/case-studies/new/">
          New case study
        </Link>
      </section>
      <section className="dashboard-panel">
        {studies.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {studies.map((study) => (
                  <tr key={study.id}>
                    <td>
                      <Link href={`/admin/content/case-studies/${study.id}/`}>{study.title}</Link>
                    </td>
                    <td>{study.slug}</td>
                    <td>{study.case_study_type}</td>
                    <td>
                      <span className={`cms-status-badge cms-status-${study.workflow_status}`}>
                        {cmsWorkflowStatusLabels[study.workflow_status]}
                      </span>
                    </td>
                    <td>{formatDashboardDate(study.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No CMS case studies yet.</p>
        )}
      </section>
    </div>
  );
}
