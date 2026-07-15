import type { Metadata } from "next";
import Link from "next/link";
import { AdminTablePagination } from "@/components/dashboard/AdminTablePagination";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { buildPageHref, paginateItems, parsePageParam } from "@/lib/cms/pagination";
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

type PageProps = { searchParams: Promise<{ draftsPage?: string; attentionPage?: string }> };

export default async function AdminContentPage({ searchParams }: PageProps) {
  const params = await searchParams;
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

  type DraftRow = {
    key: string;
    title: string;
    contentType: "Blog" | "Case study";
    slug: string;
    plannedDate: string | null;
    editHref: string;
  };

  const draftRows: DraftRow[] = [
    ...livePublishedBlogs.map((post) => ({
      key: `blog-${post.id}`,
      title: post.title,
      contentType: "Blog" as const,
      slug: post.slug,
      plannedDate: post.published_at,
      editHref: `/admin/content/blog/${post.id}/`,
    })),
    ...draftCaseStudies.map((study) => ({
      key: `case-study-${study.id}`,
      title: study.title,
      contentType: "Case study" as const,
      slug: study.slug,
      plannedDate: study.published_at,
      editHref: `/admin/content/case-studies/${study.id}/`,
    })),
  ];

  const draftsPage = paginateItems(draftRows, parsePageParam(params.draftsPage));
  const attentionPage = paginateItems(attention, parsePageParam(params.attentionPage));

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
          Drafts land here after sync or save. Click Edit, then use Publishing to make the article live or schedule it.
        </p>
        {draftsPage.totalCount ? (
          <>
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
                  {draftsPage.items.map((row) => (
                    <tr key={row.key}>
                      <td>{row.title}</td>
                      <td>{row.contentType}</td>
                      <td>{row.slug}</td>
                      <td>{row.plannedDate ? formatDashboardDate(row.plannedDate) : "—"}</td>
                      <td>
                        <Link href={row.editHref}>Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminTablePagination
              page={draftsPage.page}
              totalPages={draftsPage.totalPages}
              totalCount={draftsPage.totalCount}
              prevHref={
                draftsPage.page > 1
                  ? buildPageHref(
                      "/admin/content/",
                      { attentionPage: params.attentionPage },
                      draftsPage.page - 1,
                      "draftsPage",
                    )
                  : null
              }
              nextHref={
                draftsPage.page < draftsPage.totalPages
                  ? buildPageHref(
                      "/admin/content/",
                      { attentionPage: params.attentionPage },
                      draftsPage.page + 1,
                      "draftsPage",
                    )
                  : null
              }
            />
          </>
        ) : (
          <p className="dashboard-empty">No drafts in CMS yet.</p>
        )}
      </section>

      <section className="dashboard-panel">
        <h2>Needs attention</h2>
        {attentionPage.totalCount ? (
          <>
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
                  {attentionPage.items.map((item) => (
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
                        {item.scheduledFor
                          ? formatDashboardDate(item.scheduledFor)
                          : formatDashboardDate(item.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminTablePagination
              page={attentionPage.page}
              totalPages={attentionPage.totalPages}
              totalCount={attentionPage.totalCount}
              prevHref={
                attentionPage.page > 1
                  ? buildPageHref(
                      "/admin/content/",
                      { draftsPage: params.draftsPage },
                      attentionPage.page - 1,
                      "attentionPage",
                    )
                  : null
              }
              nextHref={
                attentionPage.page < attentionPage.totalPages
                  ? buildPageHref(
                      "/admin/content/",
                      { draftsPage: params.draftsPage },
                      attentionPage.page + 1,
                      "attentionPage",
                    )
                  : null
              }
            />
          </>
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

    </div>
  );
}
