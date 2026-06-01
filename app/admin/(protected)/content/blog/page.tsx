import type { Metadata } from "next";
import Link from "next/link";
import { cmsWorkflowFilterStatuses, fetchCmsBlogList } from "@/lib/cms/listQueries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Blog CMS | Admin",
  description: "Manage blog posts.",
  path: "/admin/content/blog/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ status?: string; q?: string }> };

function buildBlogHref(params: { status?: string; q?: string }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  const query = search.toString();
  return query ? `/admin/content/blog/?${query}` : "/admin/content/blog/";
}

export default async function AdminBlogListPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { posts, totalCount } = await fetchCmsBlogList(filters);
  const hasFilters = Boolean(filters.status || filters.q);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog posts</h1>
        <p>
          <Link href="/admin/content/">← Content hub</Link>
          {hasFilters ? ` · Showing ${totalCount} result${totalCount === 1 ? "" : "s"}` : null}
        </p>
        <Link className="button button-primary" href="/admin/content/blog/new/">
          New blog post
        </Link>
      </section>

      <form className="dashboard-search-form" action="/admin/content/blog/" method="get">
        {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
        <label className="form-field dashboard-search-field">
          <span className="visually-hidden">Search blog posts</span>
          <input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Search by title" maxLength={80} />
        </label>
        <button type="submit" className="button button-secondary">
          Search
        </button>
        {filters.q ? (
          <Link href={buildBlogHref({ status: filters.status })} className="button button-secondary">
            Clear search
          </Link>
        ) : null}
      </form>

      <section className="dashboard-filter-row">
        <Link href={buildBlogHref({ q: filters.q })} className={!filters.status ? "dashboard-filter-active" : "dashboard-filter-link"}>
          All
        </Link>
        {cmsWorkflowFilterStatuses.map((status) => (
          <Link
            key={status}
            href={buildBlogHref({ status, q: filters.q })}
            className={filters.status === status ? "dashboard-filter-active" : "dashboard-filter-link"}
          >
            {cmsWorkflowStatusLabels[status]}
          </Link>
        ))}
      </section>

      <section className="dashboard-panel">
        {posts.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/content/blog/${post.id}/`}>{post.title}</Link>
                    </td>
                    <td>{post.slug}</td>
                    <td>
                      <span className={`cms-status-badge cms-status-${post.workflow_status}`}>
                        {cmsWorkflowStatusLabels[post.workflow_status]}
                      </span>
                    </td>
                    <td>{formatDashboardDate(post.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No CMS blog posts match this filter.</p>
        )}
      </section>
    </div>
  );
}
