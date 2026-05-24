import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Overview | Healing From Your Addiction",
  description: "Admin overview for leads and clients.",
  path: "/admin/",
  noIndex: true,
});

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ count: newLeadsCount }, { data: recentLeads }, { count: clientsCount }] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("client_profiles").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Overview</p>
        <h1>Welcome back</h1>
        <p>Review new enquiries, follow up with leads, and manage enrolled clients.</p>
      </section>

      <section className="dashboard-stat-grid">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">New leads</p>
          <p className="dashboard-stat-value">{newLeadsCount ?? 0}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Enrolled clients</p>
          <p className="dashboard-stat-value">{clientsCount ?? 0}</p>
        </article>
      </section>

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Recent enquiries</h2>
        </div>
        {recentLeads?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Concern</th>
                  <th>Status</th>
                  <th>Received</th>
                </tr>
              </thead>
              <tbody>
                {recentLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <a href={`/admin/leads/${lead.id}/`}>{lead.full_name}</a>
                    </td>
                    <td>{lead.addiction_concern}</td>
                    <td>
                      <span className={`status-badge status-badge-${lead.status}`}>{lead.status}</span>
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
    </div>
  );
}
