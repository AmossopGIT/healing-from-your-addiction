import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDashboardDate, leadStatusLabels } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import type { LeadStatus } from "@/types/database";

export const metadata: Metadata = createMetadata({
  title: "Leads | Admin | Healing From Your Addiction",
  description: "View and manage confidential enquiries.",
  path: "/admin/leads/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ status?: string }> };

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const { status: statusFilter } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("leads").select("*").order("created_at", { ascending: false });
  if (statusFilter && statusFilter in leadStatusLabels) query = query.eq("status", statusFilter as LeadStatus);
  const { data: leads } = await query;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Leads</p>
        <h1>Enquiries</h1>
        <p>All confidential enquiries submitted from the public site.</p>
      </section>
      <section className="dashboard-filter-row">
        <Link href="/admin/leads/" className={!statusFilter ? "dashboard-filter-active" : "dashboard-filter-link"}>All</Link>
        {Object.entries(leadStatusLabels).map(([status, label]) => (
          <Link key={status} href={`/admin/leads/?status=${status}`} className={statusFilter === status ? "dashboard-filter-active" : "dashboard-filter-link"}>{label}</Link>
        ))}
      </section>
      <section className="dashboard-panel">
        {leads?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead><tr><th>Name</th><th>Concern</th><th>Triage</th><th>Status</th><th>Follow-up due</th><th>Received</th></tr></thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id}>
                    <td><Link href={`/admin/leads/${lead.id}/`}>{lead.full_name}</Link></td>
                    <td>{lead.addiction_concern}</td>
                    <td>{lead.triage_priority ?? "routine"} / {lead.risk_flag ?? "standard"}</td>
                    <td><span className={`status-badge status-badge-${lead.status}`}>{leadStatusLabels[lead.status]}</span></td>
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
