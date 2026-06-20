import type { Metadata } from "next";
import Link from "next/link";
import { AnalyticsOverviewStrip } from "@/components/dashboard/AnalyticsOverviewStrip";
import { LeadSlaBadge } from "@/components/dashboard/LeadSlaBadge";
import { getAdminOverviewBundle } from "@/lib/dashboard/adminOverview";
import { formatDashboardDate, leadStatusLabels, leadStatusOptions } from "@/lib/dashboard/constants";
import { isLeadOverdue } from "@/lib/dashboard/leadSla";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Admin Overview | Healing From Your Addiction",
  description: "Admin overview for leads and clients.",
  path: "/admin/",
  noIndex: true,
});

export default async function AdminOverviewPage() {
  const bundle = await getAdminOverviewBundle();

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Overview</p>
        <h1>Welcome back</h1>
        <p>Review new enquiries, follow up with leads, and manage enrolled clients.</p>
      </section>

      <section className="dashboard-quick-actions">
        <Link className="button button-secondary" href="/admin/leads/">
          All leads
        </Link>
        <Link className="button button-secondary" href="/admin/leads/?overdue=1">
          Overdue leads
        </Link>
        <Link className="button button-secondary" href="/admin/clients/invite/">
          Invite client
        </Link>
        <Link className="button button-secondary" href="/admin/content/">
          Content hub
        </Link>
        <Link className="button button-secondary" href="/admin/docs/">
          Internal docs
        </Link>
      </section>

      <AnalyticsOverviewStrip />

      <section className="dashboard-stat-grid dashboard-stat-grid-4">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">New leads</p>
          <p className="dashboard-stat-value">{bundle.counts.newLeads}</p>
        </article>
        <article className="dashboard-stat-card dashboard-stat-card-alert">
          <p className="dashboard-stat-label">Overdue / action required</p>
          <p className="dashboard-stat-value">{bundle.counts.overdueLeads}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Awaiting first response</p>
          <p className="dashboard-stat-value">{bundle.counts.awaitingFirstResponse}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Enrolled clients</p>
          <p className="dashboard-stat-value">{bundle.counts.enrolledClients}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Pending intakes</p>
          <p className="dashboard-stat-value">{bundle.counts.pendingIntakes}</p>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Action queue</h2>
          <Link href="/admin/leads/?overdue=1" className="dashboard-panel-link">
            View all overdue
          </Link>
        </div>
        {bundle.overdueLeads.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Triage</th>
                  <th>SLA</th>
                  <th>Follow-up due</th>
                </tr>
              </thead>
              <tbody>
                {bundle.overdueLeads.map((lead) => (
                  <tr key={lead.id} className="dashboard-table-row-overdue">
                    <td>
                      <Link href={`/admin/leads/${lead.id}/`}>{lead.full_name}</Link>
                    </td>
                    <td>
                      {lead.triage_priority ?? "routine"} / {lead.risk_flag ?? "standard"}
                    </td>
                    <td>
                      <LeadSlaBadge lead={lead} />
                    </td>
                    <td>{lead.follow_up_due_at ? formatDashboardDate(lead.follow_up_due_at) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">
            No overdue leads right now.{" "}
            <Link href="/admin/leads/">Browse all enquiries</Link>.
          </p>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Pending intakes</h2>
          <Link href="/admin/clients/" className="dashboard-panel-link">
            All clients
          </Link>
        </div>
        {bundle.pendingIntakes.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Focus</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bundle.pendingIntakes.slice(0, 8).map((client) => (
                  <tr key={client.clientProfileId}>
                    <td>
                      <Link href={`/admin/clients/${client.clientProfileId}/intake/`}>{client.fullName}</Link>
                    </td>
                    <td>{client.addictionSlug ?? "—"}</td>
                    <td>
                      {client.startedAt ? (
                        <span className="status-badge status-badge-intake-in-progress">In progress</span>
                      ) : (
                        <span className="status-badge status-badge-intake-not-started">Not started</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">
            All onboarded clients have completed their intake questions.{" "}
            <Link href="/admin/clients/">Browse clients</Link>.
          </p>
        )}
      </section>

      <section className="dashboard-panel">
        <h2>Pipeline snapshot</h2>
        <p className="dashboard-inline-note">{bundle.counts.openPipeline} open leads (excluding closed)</p>
        <div className="dashboard-pipeline-row">
          {leadStatusOptions.map((status) => (
            <Link key={status} href={`/admin/leads/?status=${status}`} className="dashboard-pipeline-chip">
              <span className="dashboard-pipeline-count">{bundle.pipelineByStatus[status]}</span>
              <span className="dashboard-pipeline-label">{leadStatusLabels[status]}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Recent enquiries</h2>
        </div>
        {bundle.recentLeads.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>SLA</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {bundle.recentLeads.map((lead) => (
                  <tr key={lead.id} className={isLeadOverdue(lead) ? "dashboard-table-row-overdue" : undefined}>
                    <td>
                      <Link href={`/admin/leads/${lead.id}/`}>{lead.full_name}</Link>
                    </td>
                    <td>{lead.addiction_concern}</td>
                    <td>
                      <span className={`status-badge status-badge-${lead.status}`}>{leadStatusLabels[lead.status]}</span>
                    </td>
                    <td>
                      <LeadSlaBadge lead={lead} />
                    </td>
                    <td>{formatDashboardDate(lead.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No leads yet. Enquiries from the public site will appear here.</p>
        )}
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Content needing attention</h2>
          <Link href="/admin/content/" className="dashboard-panel-link">
            Content hub
          </Link>
        </div>
        {bundle.cmsAttention.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>When</th>
                </tr>
              </thead>
              <tbody>
                {bundle.cmsAttention.slice(0, 5).map((item) => (
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
        ) : (
          <p className="dashboard-empty">
            No content in review or scheduled soon.{" "}
            <Link href="/admin/content/">Open content hub</Link>.
          </p>
        )}
      </section>
    </div>
  );
}
