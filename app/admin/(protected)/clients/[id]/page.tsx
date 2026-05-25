import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdminClientBundle } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({ title: "Client | Admin", description: "Client profile.", path: `/admin/clients/${id}/`, noIndex: true });
}

export default async function AdminClientDetailPage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const { clientProfile, profile, enrollment, template } = bundle;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Client profile</p>
        <h1>{profile?.full_name ?? "Client"}</h1>
        <p>{clientProfile.addiction_slug ? `Focus: ${clientProfile.addiction_slug}` : "Addiction focus not set"}</p>
      </section>
      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">Programme</Link>
        <Link href={`/admin/clients/${id}/messages/`} className="button button-secondary">Messages</Link>
        <Link href={`/admin/clients/${id}/documents/`} className="button button-secondary">Documents</Link>
      </div>
      <section className="dashboard-panel">
        <h2>Details</h2>
        <dl className="dashboard-dl">
          <div><dt>Phone</dt><dd>{profile?.phone ?? "—"}</dd></div>
          <div><dt>Preferred contact</dt><dd>{clientProfile.preferred_contact_method ?? "—"}</dd></div>
          <div><dt>Emergency contact</dt><dd>{clientProfile.emergency_contact ?? "—"}</dd></div>
          <div><dt>Programme</dt><dd>{enrollment ? template?.title ?? "Assigned" : "Not enrolled"}</dd></div>
        </dl>
        {clientProfile.lead_id ? <p className="dashboard-inline-note"><Link href={`/admin/leads/${clientProfile.lead_id}/`}>View originating lead</Link></p> : null}
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}

