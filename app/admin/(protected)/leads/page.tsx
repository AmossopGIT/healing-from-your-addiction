import type { Metadata } from "next";
import Link from "next/link";
import { AdminTableHeader } from "@/components/dashboard/AdminTableHeader";
import { LeadSlaBadge } from "@/components/dashboard/LeadSlaBadge";
import { updateLeadQuickActionForm } from "@/lib/dashboard/adminActions";
import { adminTooltips } from "@/lib/dashboard/adminTooltips";
import { formatDashboardDate, leadStatusLabels } from "@/lib/dashboard/constants";
import { fetchLeadsList } from "@/lib/dashboard/leadsQueries";
import { canInviteLead, formatLeadTriageLabel, getLeadNextStepCopy } from "@/lib/dashboard/leadNextStep";
import { formatDatetimeLocalValue, isLeadOverdue } from "@/lib/dashboard/leadSla";
import { createMetadata } from "@/lib/seo";
import { getAuthProfile } from "@/lib/supabase/auth";

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
  const [{ leads, adminNameById, totalCount }, profile] = await Promise.all([
    fetchLeadsList(filters),
    getAuthProfile(),
  ]);
  const hasFilters = Boolean(filters.status || filters.q || filters.overdue === "1");
  const listRedirect = buildLeadsHref(filters);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Leads</p>
        <h1>Enquiries</h1>
        <p>
          All confidential enquiries submitted from the public site.
          {hasFilters ? ` Showing ${totalCount} result${totalCount === 1 ? "" : "s"}.` : null}
        </p>
        <p className="dashboard-inline-note">
          Start with <strong>Overdue</strong>. Assign yourself, set a follow-up due date, send a first response, then invite
          from the lead — not from a blank Invite form.{" "}
          <Link href="/admin/docs/lead-to-client-onboarding-flow/">Onboarding guide</Link>
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
          title={adminTooltips.leads.overdueFilter}
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
                  <AdminTableHeader label="Name" tooltip={adminTooltips.leads.nameHint} />
                  <AdminTableHeader label="Concern" />
                  <AdminTableHeader label="Triage" tooltip={adminTooltips.leads.triage} />
                  <AdminTableHeader label="Assigned" tooltip={adminTooltips.leads.assigned} />
                  <AdminTableHeader label="SLA" tooltip={adminTooltips.leads.sla} />
                  <AdminTableHeader label="Status" tooltip={adminTooltips.leads.status} />
                  <AdminTableHeader label="Follow-up due" tooltip={adminTooltips.leads.followUpDue} />
                  <AdminTableHeader label="Received" tooltip={adminTooltips.leads.received} />
                  <AdminTableHeader label="Actions" tooltip={adminTooltips.leads.actions} />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className={isLeadOverdue(lead) ? "dashboard-table-row-overdue" : undefined}>
                    <td>
                      <Link href={`/admin/leads/${lead.id}/`}>{lead.full_name}</Link>
                      <p className="dashboard-table-hint">{getLeadNextStepCopy(lead.status)}</p>
                    </td>
                    <td>{lead.addiction_concern}</td>
                    <td>{formatLeadTriageLabel(lead)}</td>
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
                    <td>
                      <div className="dashboard-lead-actions">
                        <Link
                          href={`/admin/leads/${lead.id}/`}
                          className="button button-small button-secondary"
                          title={adminTooltips.leads.open}
                        >
                          Open
                        </Link>
                        {canInviteLead(lead) ? (
                          <Link
                            href={`/admin/clients/invite/?leadId=${lead.id}`}
                            className="button button-small button-primary"
                            title={adminTooltips.leads.invite}
                          >
                            Invite
                          </Link>
                        ) : null}
                        {!lead.assigned_admin_id && profile?.id ? (
                          <form action={updateLeadQuickActionForm}>
                            <input type="hidden" name="leadId" value={lead.id} />
                            <input type="hidden" name="redirectTo" value={listRedirect} />
                            <input type="hidden" name="assignToMe" value="1" />
                            <button
                              type="submit"
                              className="button button-small button-secondary"
                              title={adminTooltips.leads.assignToMe}
                            >
                              Assign to me
                            </button>
                          </form>
                        ) : null}
                        <form action={updateLeadQuickActionForm} className="dashboard-lead-follow-up-form">
                          <input type="hidden" name="leadId" value={lead.id} />
                          <input type="hidden" name="redirectTo" value={listRedirect} />
                          <label className="visually-hidden" htmlFor={`follow-up-${lead.id}`}>
                            Follow-up due
                          </label>
                          <input
                            id={`follow-up-${lead.id}`}
                            type="datetime-local"
                            name="followUpDueAt"
                            defaultValue={formatDatetimeLocalValue(lead.follow_up_due_at)}
                            title={adminTooltips.leads.followUpDue}
                          />
                          <button
                            type="submit"
                            className="button button-small button-secondary"
                            title={adminTooltips.leads.followUpSave}
                          >
                            Save
                          </button>
                        </form>
                      </div>
                    </td>
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
