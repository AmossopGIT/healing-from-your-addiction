import type { Metadata } from "next";
import Link from "next/link";
import { LeadSlaBadge } from "@/components/dashboard/LeadSlaBadge";
import { formatDashboardDate, leadStatusLabels } from "@/lib/dashboard/constants";
import { fetchLeadsList } from "@/lib/dashboard/leadsQueries";
import { isLeadOverdue } from "@/lib/dashboard/leadSla";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Leads | Admin | Healing From Your Addiction",
  description: "View and manage confidential enquiries.",
  path: "/admin/leads/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ status?: string; q?: string; overdue?: string }> };

function buildLeadsHref(params: { status?: string; q?: string; overdue?: string }) {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.overdue) search.set("overdue", params.overdue);
  const query = search.toString();
  return query ? `/admin/leads/?${query}` : "/admin/leads/";
}

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const filters = await searchParams;
  const { leads, adminNameById, totalCount } = await fetchLeadsList(filters);
  const hasFilters = Boolean(filters.status || filters.q || filters.overdue === "1");

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Leads</p>
        <h1>Enquiries</h1>
        <p>
          All confidential enquiries submitted from the public site.
          {hasFilters ? ` Showing ${totalCount} result${totalCount === 1 ? "" : "s"}.` : null}
        </p>
      </section>

      <form className="dashboard-search-form" action="/admin/leads/" method="get">
        {filters.status ? <input type="hidden" name="status" value={filters.status} /> : null}
        {filters.overdue === "1" ? <input type="hidden" name="overdue" value="1" /> : null}
        <label className="form-field dashboard-search-field">
          <span className="visually-hidden">Search leads</span>
          <input type="search" name="q" defaultValue={filters.q ?? ""} placeholder="Search by name or email" maxLength={80} />
        </label>
        <button type="submit" className="button button-secondary">
          Search
        </button>
        {filters.q ? (
          <Link href={buildLeadsHref({ status: filters.status, overdue: filters.overdue })} className="button button-secondary">
            Clear search
          </Link>
        ) : null}
      </form>

      <section className="dashboard-filter-row">
        <Link href={buildLeadsHref({ q: filters.q })} className={!filters.status && filters.overdue !== "1" ? "dashboard-filter-active" : "dashboard-filter-link"}>
          All
        </Link>
        <Link
          href={buildLeadsHref({ overdue: "1", q: filters.q })}
          className={filters.overdue === "1" ? "dashboard-filter-active" : "dashboard-filter-link"}
        >
          Overdue
        </Link>
        {Object.entries(leadStatusLabels).map(([status, label]) => (
          <Link
            key={status}
            href={buildLeadsHref({ status, q: filters.q })}
            className={filters.status === status ? "dashboard-filter-active" : "dashboard-filter-link"}
          >
            {label}
          </Link>
        ))}
      </section>

      <section className="dashboard-panel">
        {leads.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Concern</th>
                  <th>Triage</th>
                  <th>Assigned</th>
                  <th>SLA</th>
                  <th>Status</th>
                  <th>Follow-up due</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className={isLeadOverdue(lead) ? "dashboard-table-row-overdue" : undefined}>
                    <td>
                      <Link href={`/admin/leads/${lead.id}/`}>{lead.full_name}</Link>
                    </td>
                    <td>{lead.addiction_concern}</td>
                    <td>
                      {lead.triage_priority ?? "routine"} / {lead.risk_flag ?? "standard"}
                    </td>
                    <td>
                      {lead.assigned_admin_id ? (adminNameById.get(lead.assigned_admin_id) ?? "Admin") : "—"}
                    </td>
                    <td>
                      <LeadSlaBadge lead={lead} />
                    </td>
                    <td>
                      <span className={`status-badge status-badge-${lead.status}`}>{leadStatusLabels[lead.status]}</span>
                    </td>
                    <td>{lead.follow_up_due_at ? formatDashboardDate(lead.follow_up_due_at) : "—"}</td>
                    <td>{formatDashboardDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No leads match this filter.</p>
        )}
      </section>
    </div>
  );
}
