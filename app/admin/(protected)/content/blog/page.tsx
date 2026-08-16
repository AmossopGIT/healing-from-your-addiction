import type { Metadata } from "next";
import Link from "next/link";
import { AdminTablePagination } from "@/components/dashboard/AdminTablePagination";
import { blogPostBySlug } from "@/content/blog";
import { openBlogForImprovement } from "@/lib/cms/actions";
import { cmsWorkflowFilterStatuses, fetchCmsBlogList } from "@/lib/cms/listQueries";
import { countInternalLinks } from "@/lib/cms/internalLinks";
import { buildPageHref, paginateItems, parsePageParam } from "@/lib/cms/pagination";
import { fetchAllCmsBlogPosts } from "@/lib/cms/queries";
import { buildStaticInventory } from "@/lib/cms/staticInventory";
import { safeDecodeURIComponent } from "@/lib/cms/safeQueryParam";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Blog CMS | Admin",
  description: "Manage blog posts.",
  path: "/admin/content/blog/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ status?: string; q?: string; links?: string; page?: string; error?: string }>;
};

function buildBlogHref(params: { status?: string; q?: string; links?: string; page?: number }) {
  return buildPageHref(
    "/admin/content/blog/",
    { status: params.status, q: params.q, links: params.links },
    params.page ?? 1,
  );
}

export default async function AdminBlogListPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const [{ posts: rawPosts, totalCount }, allCmsPosts] = await Promise.all([
    fetchCmsBlogList(filters),
    fetchAllCmsBlogPosts(true),
  ]);
  const inventory = buildStaticInventory(allCmsPosts, []);
  const staticOnlyPosts = inventory.missingBlogSlugs
    .map((slug) => blogPostBySlug.get(slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));
  const filteredPosts =
    filters.links === "missing" ? rawPosts.filter((post) => countInternalLinks(post.sections) < 2) : rawPosts;
  const paged = paginateItems(filteredPosts, parsePageParam(filters.page));
  const hasFilters = Boolean(filters.status || filters.q || filters.links);
  const displayCount = filters.links === "missing" ? filteredPosts.length : totalCount;
  const listError = filters.error ? safeDecodeURIComponent(filters.error) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog posts</h1>
        <p>
          <Link href="/admin/content/">← Content hub</Link>
          {hasFilters ? ` · Showing ${displayCount} result${displayCount === 1 ? "" : "s"}` : null}
        </p>
        <Link className="button button-primary" href="/admin/content/blog/new/">
          New blog post
        </Link>
      </section>

      {listError ? <p className="form-error">{listError}</p> : null}

      <form className="dashboard-search-form" action="/admin/content/blog/" method="get">
        {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
        {filters.links ? <input type="hidden" name="links" value={filters.links} /> : null}
        <label className="form-field dashboard-search-field">
          <span className="visually-hidden">Search blog posts</span>
          <input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Search by title" maxLength={80} />
        </label>
        <button type="submit" className="button button-secondary">
          Search
        </button>
        {filters.q ? (
          <Link href={buildBlogHref({ status: filters.status, links: filters.links })} className="button button-secondary">
            Clear search
          </Link>
        ) : null}
      </form>

      <section className="dashboard-filter-row">
        <Link href={buildBlogHref({ q: filters.q, status: filters.status })} className={!filters.links ? "dashboard-filter-active" : "dashboard-filter-link"}>
          All links
        </Link>
        <Link
          href={buildBlogHref({ q: filters.q, status: filters.status, links: "missing" })}
          className={filters.links === "missing" ? "dashboard-filter-active" : "dashboard-filter-link"}
        >
          Missing internal links
        </Link>
      </section>

      <section className="dashboard-filter-row">
        <Link href={buildBlogHref({ q: filters.q, links: filters.links })} className={!filters.status ? "dashboard-filter-active" : "dashboard-filter-link"}>
          All
        </Link>
        {cmsWorkflowFilterStatuses.map((status) => (
          <Link
            key={status}
            href={buildBlogHref({ status, q: filters.q, links: filters.links })}
            className={filters.status === status ? "dashboard-filter-active" : "dashboard-filter-link"}
          >
            {cmsWorkflowStatusLabels[status]}
          </Link>
        ))}
      </section>

      {staticOnlyPosts.length ? (
        <section className="dashboard-panel">
          <h2>Live on site, not in CMS yet</h2>
          <p className="cms-field-help">
            These articles are live from content files. Use <strong>Improve this article</strong> to open a CMS draft
            without changing the public page until you publish.
          </p>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staticOnlyPosts.map((post) => (
                  <tr key={post.slug}>
                    <td>{post.title}</td>
                    <td>
                      <code>{post.slug}</code>
                    </td>
                    <td>{post.categorySlug}</td>
                    <td>
                      <form action={openBlogForImprovement}>
                        <input type="hidden" name="slug" value={post.slug} />
                        <button type="submit" className="button button-secondary">
                          Improve this article
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section className="dashboard-panel">
        {paged.items.length ? (
          <>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Primary keyword</th>
                    <th>Links</th>
                    <th>Status</th>
                    <th>Published</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((post) => {
                    const linkCount = countInternalLinks(post.sections);
                    return (
                      <tr key={post.id}>
                        <td>
                          <Link href={`/admin/content/blog/${post.id}/`}>{post.title}</Link>
                        </td>
                        <td>{post.category_slug}</td>
                        <td>{post.primary_keyword || "—"}</td>
                        <td className={linkCount < 2 ? "dashboard-cell-warn" : undefined}>{linkCount}</td>
                        <td>
                          <span className={`cms-status-badge cms-status-${post.workflow_status}`}>
                            {cmsWorkflowStatusLabels[post.workflow_status]}
                          </span>
                        </td>
                        <td>{post.published_at ? formatDashboardDate(post.published_at) : "—"}</td>
                        <td>{formatDashboardDate(post.updated_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AdminTablePagination
              page={paged.page}
              totalPages={paged.totalPages}
              totalCount={paged.totalCount}
              prevHref={
                paged.page > 1
                  ? buildBlogHref({
                      status: filters.status,
                      q: filters.q,
                      links: filters.links,
                      page: paged.page - 1,
                    })
                  : null
              }
              nextHref={
                paged.page < paged.totalPages
                  ? buildBlogHref({
                      status: filters.status,
                      q: filters.q,
                      links: filters.links,
                      page: paged.page + 1,
                    })
                  : null
              }
            />
          </>
        ) : (
          <p className="dashboard-empty">No CMS blog posts match this filter.</p>
        )}
      </section>
    </div>
  );
}
