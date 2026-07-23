import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { consultationStatusLabels, isConsultationCompleteStatus } from "@/lib/consultation/schema";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { getClientConsultations, getClientIntakeSubmissions } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Clients | Admin",
  description: "Enrolled clients.",
  path: "/admin/clients/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default async function AdminClientsPage() {
  const supabase = await createClient();
  const [{ data: clients }, intakeSubmissions, consultations] = await Promise.all([
    supabase.from("client_profiles").select("*").order("created_at", { ascending: false }),
    getClientIntakeSubmissions(),
    getClientConsultations(),
  ]);

  const intakeByClientId = new Map(intakeSubmissions.map((submission) => [submission.client_profile_id, submission]));
  const consultationByClientId = new Map(consultations.map((item) => [item.client_profile_id, item]));

  const userIds = [...new Set((clients ?? []).map((client) => client.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, full_name, phone").in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Clients</p>
        <h1>Enrolled clients</h1>
        <p>
          <Link href="/admin/clients/invite/" className="button button-primary button-small">
            Invite client
          </Link>
        </p>
      </section>
      <section className="dashboard-panel">
        {clients?.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Addiction</th>
                  <th>Intake</th>
                  <th>Consultation</th>
                  <th>Contact</th>
                  <th>Enrolled</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const profile = profileMap.get(client.user_id);
                  const intake = intakeByClientId.get(client.id);
                  const consultation = consultationByClientId.get(client.id);
                  return (
                    <tr key={client.id}>
                      <td>
                        <Link href={`/admin/clients/${client.id}/`}>{profile?.full_name ?? "Client"}</Link>
                      </td>
                      <td>{client.addiction_slug ?? "—"}</td>
                      <td>
                        {intake?.completed_at ? (
                          <span className="status-badge status-badge-intake-complete">Completed</span>
                        ) : intake ? (
                          <Link href={`/admin/clients/${client.id}/intake/`} className="status-badge status-badge-intake-in-progress">
                            In progress
                          </Link>
                        ) : (
                          <span className="status-badge status-badge-intake-not-started">Not started</span>
                        )}
                      </td>
                      <td>
                        {consultation ? (
                          <Link
                            href={`/admin/clients/${client.id}/consultation/`}
                            className={`status-badge status-badge-consultation-${consultation.status}`}
                          >
                            {consultationStatusLabels[consultation.status]}
                            {!isConsultationCompleteStatus(consultation.status) && consultation.percent_complete > 0
                              ? ` ${consultation.percent_complete}%`
                              : ""}
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/clients/${client.id}/consultation/`}
                            className="status-badge status-badge-consultation-not_sent"
                          >
                            Not sent
                          </Link>
                        )}
                      </td>
                      <td>{profile?.phone ?? client.preferred_contact_method ?? "—"}</td>
                      <td>{formatDashboardDate(client.created_at)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No clients yet. Invite a client from a qualified lead.</p>
        )}
      </section>
    </div>
  );
}
