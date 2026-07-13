import type { Metadata } from "next";
import Link from "next/link";
import { BackfillCmsButton } from "@/components/dashboard/BackfillCmsButton";
import { CmsSyncStatus } from "@/components/dashboard/CmsSyncStatus";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { fetchAllCmsBlogPosts, fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { buildStaticInventory } from "@/lib/cms/staticInventory";
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

type RecentContentItem = {
  id: string;
  contentType: "blog" | "case-study";
  title: string;
  workflowStatus: CmsWorkflowStatus;
  updatedAt: string;
  editHref: string;
};

export default async function AdminContentPage() {
  const [blogPosts, caseStudies] = await Promise.all([fetchAllCmsBlogPosts(true), fetchAllCmsCaseStudies(true)]);
  const inventory = buildStaticInventory(blogPosts, caseStudies);

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

  const recentContent: RecentContentItem[] = [
    ...blogPosts.map((post) => ({
      id: post.id,
      contentType: "blog" as const,
      title: post.title,
      workflowStatus: post.workflow_status,
      updatedAt: post.updated_at,
      editHref: `/admin/content/blog/${post.id}/`,
    })),
    ...caseStudies.map((study) => ({
      id: study.id,
      contentType: "case-study" as const,
      title: study.title,
      workflowStatus: study.workflow_status,
      updatedAt: study.updated_at,
      editHref: `/admin/content/case-studies/${study.id}/`,
    })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 8);

  const livePublishedBlogs = blogPosts
    .filter((post) => post.workflow_status === "draft")
    .sort((a, b) => {
      const aDate = a.published_at ?? a.updated_at;
      const bDate = b.published_at ?? b.updated_at;
      return bDate.localeCompare(aDate);
    });

  const draftCaseStudies = caseStudies
    .filter((study) => study.workflow_status === "draft")
    .sort((a, b) => {
      const aDate = a.published_at ?? a.updated_at;
      const bDate = b.published_at ?? b.updated_at;
      return bDate.localeCompare(aDate);
    });

  const cmsDraftCount =
    inventory.cmsDraftBlogCount + inventory.cmsDraftCaseStudyCount;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog and case study publishing</h1>
        <p>Create structured content with SEO metadata, watercolor hero art, and editorial workflow.</p>
        <p className="cms-feature-flag">
          CMS public rendering: <strong>{isCmsContentEnabled() ? "enabled" : "disabled"}</strong> (set{" "}
          <code>NEXT_PUBLIC_CMS_CONTENT_ENABLED=true</code> after verifying CMS matches live content)
        </p>
      </section>

      <section className="dashboard-panel cms-content-inventory">
        <h2>Content inventory</h2>
        <div className="dashboard-stat-grid dashboard-stat-grid-4">
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-label">Live site (static)</p>
            <p className="dashboard-stat-value">
              {inventory.staticBlogCount} blogs · {inventory.staticCaseStudyCount} case studies
            </p>
          </div>
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-label">In CMS (drafts ready)</p>
            <p className="dashboard-stat-value">
              {inventory.cmsDraftBlogCount} blogs · {inventory.cmsDraftCaseStudyCount} case studies
            </p>
          </div>
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-label">In CMS (published)</p>
            <p className="dashboard-stat-value">
              {inventory.cmsPublishedBlogCount} blogs · {inventory.cmsPublishedCaseStudyCount} case studies
            </p>
          </div>
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-label">Draft queue total</p>
            <p className="dashboard-stat-value">{cmsDraftCount}</p>
          </div>
          <div className="dashboard-stat-card">
            <p className="dashboard-stat-label">CMS total</p>
            <p className="dashboard-stat-value">
              {inventory.cmsBlogCount} blogs · {inventory.cmsCaseStudyCount} case studies
            </p>
          </div>
        </div>
        {inventory.missingBlogSlugs.length || inventory.missingCaseStudySlugs.length ? (
          <div className="cms-inventory-missing">
            <p>
              <strong>Missing from CMS</strong> (will sync on next deploy):
            </p>
            {inventory.missingBlogSlugs.length ? (
              <p>
                Blog slugs: <code>{inventory.missingBlogSlugs.join(", ")}</code>
              </p>
            ) : null}
            {inventory.missingCaseStudySlugs.length ? (
              <p>
                Case study slugs: <code>{inventory.missingCaseStudySlugs.join(", ")}</code>
              </p>
            ) : null}
          </div>
        ) : (
          <p className="dashboard-empty">All live static content is present in CMS.</p>
        )}
      </section>

      <section className="dashboard-panel cms-publish-checklist">
        <h2>Publish checklist</h2>
        <ol>
          <li>Static content syncs on deploy as CMS drafts — review, edit, then publish when ready.</li>
          <li>Open a draft below, check SEO and sections, then submit for review or publish.</li>
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
        <h2>Drafts ready to publish</h2>
        <p className="cms-field-help">
          Synced live content lands here as drafts. Click Edit to review structured sections and SEO, then publish when ready.
        </p>
        {livePublishedBlogs.length || draftCaseStudies.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Slug</th>
                  <th>Planned date</th>
                  <th>Edit</th>
                </tr>
              </thead>
              <tbody>
                {livePublishedBlogs.map((post) => (
                  <tr key={`blog-${post.id}`}>
                    <td>{post.title}</td>
                    <td>Blog</td>
                    <td>{post.slug}</td>
                    <td>{post.published_at ? formatDashboardDate(post.published_at) : "—"}</td>
                    <td>
                      <Link href={`/admin/content/blog/${post.id}/`}>Edit</Link>
                    </td>
                  </tr>
                ))}
                {draftCaseStudies.map((study) => (
                  <tr key={`case-study-${study.id}`}>
                    <td>{study.title}</td>
                    <td>Case study</td>
                    <td>{study.slug}</td>
                    <td>{study.published_at ? formatDashboardDate(study.published_at) : "—"}</td>
                    <td>
                      <Link href={`/admin/content/case-studies/${study.id}/`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No drafts in CMS yet. Sync runs on deploy.</p>
        )}
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

      <section className="dashboard-panel">
        <h2>Recent content</h2>
        {recentContent.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentContent.map((item) => (
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
                    <td>{formatDashboardDate(item.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No CMS content yet.</p>
        )}
      </section>

      <BackfillCmsButton />
      <CmsSyncStatus />
    </div>
  );
}
