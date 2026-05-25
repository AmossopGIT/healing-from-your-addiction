import type { Metadata } from "next";
import Link from "next/link";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { getClientDocumentsWithReceipts } from "@/lib/dashboard/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Resources | Client Portal",
  description: "Assigned programme documents.",
  path: "/portal/resources/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function PortalResourcesPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const documents = clientProfile ? await getClientDocumentsWithReceipts(clientProfile.id) : [];

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Resources</p>
        <h1>Your documents</h1>
        <p>Files shared specifically for your programme.</p>
      </section>
      {error ? <p className="form-error">The selected document could not be opened right now.</p> : null}
      <section className="dashboard-panel">
        {documents.length ? (
          <ul className="dashboard-doc-list">
            {documents.map((doc) => (
              <li key={doc.id} className="dashboard-doc-item">
                <div>
                  <strong>{doc.label}</strong>
                  <p className="dashboard-note-meta">Shared {formatDashboardDate(doc.created_at)}</p>
                  {doc.receipt?.read_at ? (
                    <p className="dashboard-inline-note">Opened {formatDashboardDate(doc.receipt.read_at)}</p>
                  ) : doc.receipt ? (
                    <p className="dashboard-inline-note">New this month · unread</p>
                  ) : null}
                </div>
                <Link href={`/portal/resources/${doc.id}/`} className="button button-small button-secondary">
                  Open resource
                </Link>
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
