import type { Metadata } from "next";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { getClientDocuments } from "@/lib/dashboard/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Resources | Client Portal",
  description: "Assigned programme documents.",
  path: "/portal/resources/",
  noIndex: true,
});

export default async function PortalResourcesPage() {
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const documents = clientProfile ? await getClientDocuments(clientProfile.id) : [];

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Resources</p>
        <h1>Your documents</h1>
        <p>Files shared specifically for your programme.</p>
      </section>
      <section className="dashboard-panel">
        {documents.length ? (
          <ul className="dashboard-doc-list">
            {documents.map((doc) => (
              <li key={doc.id}>
                <strong>{doc.label}</strong>
                <p className="dashboard-note-meta">Shared {formatDashboardDate(doc.created_at)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dashboard-empty">No documents have been shared yet.</p>
        )}
      </section>
    </div>
  );
}
