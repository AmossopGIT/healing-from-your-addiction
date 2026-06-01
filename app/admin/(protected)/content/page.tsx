import type { Metadata } from "next";
import Link from "next/link";
import { BackfillCmsButton } from "@/components/dashboard/BackfillCmsButton";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { fetchAllCmsBlogPosts, fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels, type CmsWorkflowStatus } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Content CMS | Admin",
  description: "Manage blog posts and case studies.",
  path: "/admin/content/",
  noIndex: true,
});

const WORKFLOW_STATUSES: CmsWorkflowStatus[] = ["draft", "in_review", "approved", "scheduled", "published", "archived"];

const SCHEDULED_SOON_MS = 7 * 24 * 60 * 60 * 1000;

type AttentionItem = {
  id: string;
  contentType: "blog" | "case-study";
  title: string;
  workflowStatus: CmsWorkflowStatus;
  scheduledFor: string | null;
  updatedAt: string;
  editHref: string;
  reason: "in_review" | "scheduled_soon";
};

export default async function AdminContentPage() {
  const [blogPosts, caseStudies] = await Promise.all([fetchAllCmsBlogPosts(true), fetchAllCmsCaseStudies(true)]);

  const workflowCounts = Object.fromEntries(WORKFLOW_STATUSES.map((status) => [status, 0])) as Record<CmsWorkflowStatus, number>;
  const attention: AttentionItem[] = [];
  const now = Date.now();

  for (const post of blogPosts) {
    workflowCounts[post.workflow_status] += 1;
    if (post.workflow_status === "in_review") {
      attention.push({
        id: post.id,
        contentType: "blog",
        title: post.title,
        workflowStatus: post.workflow_status,
        scheduledFor: post.scheduled_for,
        updatedAt: post.updated_at,
        editHref: `/admin/content/blog/${post.id}/`,
        reason: "in_review",
      });
    } else if (
      post.workflow_status === "scheduled" &&
      post.scheduled_for &&
      new Date(post.scheduled_for).getTime() - now <= SCHEDULED_SOON_MS
    ) {
      attention.push({
        id: post.id,
        contentType: "blog",
        title: post.title,
        workflowStatus: post.workflow_status,
        scheduledFor: post.scheduled_for,
        updatedAt: post.updated_at,
        editHref: `/admin/content/blog/${post.id}/`,
        reason: "scheduled_soon",
      });
    }
  }

  for (const study of caseStudies) {
    workflowCounts[study.workflow_status] += 1;
    if (study.workflow_status === "in_review") {
      attention.push({
        id: study.id,
        contentType: "case-study",
        title: study.title,
        workflowStatus: study.workflow_status,
        scheduledFor: study.scheduled_for,
        updatedAt: study.updated_at,
        editHref: `/admin/content/case-studies/${study.id}/`,
        reason: "in_review",
      });
    } else if (
      study.workflow_status === "scheduled" &&
      study.scheduled_for &&
      new Date(study.scheduled_for).getTime() - now <= SCHEDULED_SOON_MS
    ) {
      attention.push({
        id: study.id,
        contentType: "case-study",
        title: study.title,
        workflowStatus: study.workflow_status,
        scheduledFor: study.scheduled_for,
        updatedAt: study.updated_at,
        editHref: `/admin/content/case-studies/${study.id}/`,
        reason: "scheduled_soon",
      });
    }
  }

  attention.sort((a, b) => {
    if (a.reason !== b.reason) return a.reason === "in_review" ? -1 : 1;
    const aTime = a.scheduledFor ?? a.updatedAt;
    const bTime = b.scheduledFor ?? b.updatedAt;
    return aTime < bTime ? -1 : 1;
  });

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog and case study publishing</h1>
        <p>Create structured content with SEO metadata, watercolor hero art, and editorial workflow.</p>
        <p className="cms-feature-flag">
          CMS public rendering: <strong>{isCmsContentEnabled() ? "enabled" : "disabled"}</strong> (set{" "}
          <code>NEXT_PUBLIC_CMS_CONTENT_ENABLED=true</code> after backfill)
        </p>
      </section>

      <section className="dashboard-panel cms-publish-checklist">
        <h2>Publish checklist</h2>
        <ol>
          <li>Run backfill from static content (below) if CMS tables are empty.</li>
          <li>Review drafts and move items through in review → approved → published.</li>
          <li>Set <code>NEXT_PUBLIC_CMS_CONTENT_ENABLED=true</code> and verify public blog and case study routes.</li>
        </ol>
      </section>

      <section className="dashboard-stat-grid dashboard-stat-grid-6">
        {WORKFLOW_STATUSES.map((status) => (
          <article key={status} className="dashboard-stat-card">
            <p className="dashboard-stat-label">{cmsWorkflowStatusLabels[status]}</p>
            <p className="dashboard-stat-value">{workflowCounts[status]}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-stat-grid">
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Blog posts</p>
          <p className="dashboard-stat-value">{blogPosts.length}</p>
        </div>
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Case studies</p>
          <p className="dashboard-stat-value">{caseStudies.length}</p>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="cms-list-actions">
          <Link className="button button-primary" href="/admin/content/blog/new/">
            New blog post
          </Link>
          <Link className="button button-secondary" href="/admin/content/case-studies/new/">
            New case study
          </Link>
          <Link className="button button-secondary" href="/admin/content/blog/">
            All blog posts
          </Link>
          <Link className="button button-secondary" href="/admin/content/case-studies/">
            All case studies
          </Link>
        </div>
      </section>

      <section className="dashboard-panel">
        <h2>Needs attention</h2>
        {attention.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {attention.map((item) => (
                  <tr key={`${item.contentType}-${item.id}`}>
                    <td>
                      <Link href={item.editHref}>{item.title}</Link>
                    </td>
                    <td>{item.contentType === "blog" ? "Blog" : "Case study"}</td>
                    <td>
                      <span className={`cms-status-badge cms-status-${item.workflowStatus}`}>
                        {cmsWorkflowStatusLabels[item.workflowStatus]}
                      </span>
                    </td>
                    <td>{item.reason === "in_review" ? "In review" : "Scheduled soon"}</td>
                    <td>
                      {item.scheduledFor ? formatDashboardDate(item.scheduledFor) : formatDashboardDate(item.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No content in review or scheduled within the next 7 days.</p>
        )}
      </section>

      <section className="dashboard-two-col">
        <div className="dashboard-panel">
          <h2>Recent blog drafts</h2>
          {blogPosts.slice(0, 5).map((post) => (
            <p key={post.id}>
              <Link href={`/admin/content/blog/${post.id}/`}>{post.title}</Link> —{" "}
              {cmsWorkflowStatusLabels[post.workflow_status]}
            </p>
          ))}
        </div>
        <div className="dashboard-panel">
          <h2>Recent case studies</h2>
          {caseStudies.slice(0, 5).map((study) => (
            <p key={study.id}>
              <Link href={`/admin/content/case-studies/${study.id}/`}>{study.title}</Link> —{" "}
              {cmsWorkflowStatusLabels[study.workflow_status]}
            </p>
          ))}
        </div>
      </section>

      <BackfillCmsButton />
    </div>
  );
}
