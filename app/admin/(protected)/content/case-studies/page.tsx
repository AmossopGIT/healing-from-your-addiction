import type { Metadata } from "next";
import Link from "next/link";
import { AdminTablePagination } from "@/components/dashboard/AdminTablePagination";
import { caseStudyBySlug } from "@/content/caseStudies";
import { openCaseStudyForImprovement } from "@/lib/cms/actions";
import { cmsWorkflowFilterStatuses, fetchCmsCaseStudyList } from "@/lib/cms/listQueries";
import { buildPageHref, paginateItems, parsePageParam } from "@/lib/cms/pagination";
import { fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { safeDecodeURIComponent } from "@/lib/cms/safeQueryParam";
import { buildStaticInventory } from "@/lib/cms/staticInventory";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Case Studies CMS | Admin",
  description: "Manage case studies.",
  path: "/admin/content/case-studies/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ status?: string; q?: string; page?: string; error?: string }> };

function buildCaseStudyHref(params: { status?: string; q?: string; page?: number }) {
  return buildPageHref("/admin/content/case-studies/", { status: params.status, q: params.q }, params.page ?? 1);
}

export default async function AdminCaseStudyListPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const [{ studies, totalCount }, allCmsStudies] = await Promise.all([
    fetchCmsCaseStudyList(filters),
    fetchAllCmsCaseStudies(true),
  ]);
  const inventory = buildStaticInventory([], allCmsStudies);
  const staticOnlyStudies = inventory.missingCaseStudySlugs
    .map((slug) => caseStudyBySlug.get(slug))
    .filter((study): study is NonNullable<typeof study> => Boolean(study));
  const paged = paginateItems(studies, parsePageParam(filters.page));
  const hasFilters = Boolean(filters.status || filters.q);
  const listError = filters.error ? safeDecodeURIComponent(filters.error) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Case studies</h1>
        <p>
          <Link href="/admin/content/">← Content hub</Link>
          {hasFilters ? ` · Showing ${totalCount} result${totalCount === 1 ? "" : "s"}` : null}
        </p>
        <Link className="button button-primary" href="/admin/content/case-studies/new/">
          New case study
        </Link>
      </section>

      {listError ? <p className="form-error">{listError}</p> : null}

      <form className="dashboard-search-form" action="/admin/content/case-studies/" method="get">
        {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
        <label className="form-field dashboard-search-field">
          <span className="visually-hidden">Search case studies</span>
          <input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Search by title" maxLength={80} />
        </label>
        <button type="submit" className="button button-secondary">
          Search
        </button>
        {filters.q ? (
          <Link href={buildCaseStudyHref({ status: filters.status })} className="button button-secondary">
            Clear search
          </Link>
        ) : null}
      </form>

      <section className="dashboard-filter-row">
        <Link
          href={buildCaseStudyHref({ q: filters.q })}
          className={!filters.status ? "dashboard-filter-active" : "dashboard-filter-link"}
        >
          All
        </Link>
        {cmsWorkflowFilterStatuses.map((status) => (
          <Link
            key={status}
            href={buildCaseStudyHref({ status, q: filters.q })}
            className={filters.status === status ? "dashboard-filter-active" : "dashboard-filter-link"}
          >
            {cmsWorkflowStatusLabels[status]}
          </Link>
        ))}
      </section>

      {staticOnlyStudies.length ? (
        <section className="dashboard-panel">
          <h2>Live on site, not in CMS yet</h2>
          <p className="cms-field-help">
            These case studies are live from content files. Use <strong>Improve this case study</strong> to open a CMS
            draft without changing the public page until you publish.
          </p>
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Type</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {staticOnlyStudies.map((study) => (
                  <tr key={study.slug}>
                    <td>{study.title}</td>
                    <td>
                      <code>{study.slug}</code>
                    </td>
                    <td>{study.caseStudyType}</td>
                    <td>
                      <form action={openCaseStudyForImprovement}>
                        <input type="hidden" name="slug" value={study.slug} />
                        <button type="submit" className="button button-secondary">
                          Improve this case study
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
                    <th>Slug</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((study) => (
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
            <AdminTablePagination
              page={paged.page}
              totalPages={paged.totalPages}
              totalCount={paged.totalCount}
              prevHref={
                paged.page > 1
                  ? buildCaseStudyHref({ status: filters.status, q: filters.q, page: paged.page - 1 })
                  : null
              }
              nextHref={
                paged.page < paged.totalPages
                  ? buildCaseStudyHref({ status: filters.status, q: filters.q, page: paged.page + 1 })
                  : null
              }
            />
          </>
        ) : (
          <p className="dashboard-empty">No case studies match this filter.</p>
        )}
      </section>
    </div>
  );
}
