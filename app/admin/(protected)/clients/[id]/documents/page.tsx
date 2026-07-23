import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { uploadClientDocument } from "@/lib/dashboard/programmeActions";
import { getAdminClientBundle, getClientDocuments } from "@/lib/dashboard/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> };

const documentErrorMessages: Record<string, string> = {
  "missing-file": "Please choose a file before uploading.",
  "invalid-label": "Please add a shorter document label.",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client documents | Admin",
    description: "Client documents.",
    path: `/admin/clients/${id}/documents/`,
    noIndex: true,
  });
}

export default async function AdminClientDocumentsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error } = await searchParams;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();
  const documents = await getClientDocuments(id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Documents</p>
        <h1>Client documents</h1>
        <p>
          <Link href={`/admin/clients/${id}/`}>Back to client</Link>
        </p>
      </section>
      {error ? <p className="form-error">{documentErrorMessages[error] ?? decodeURIComponent(error)}</p> : null}
      <section className="dashboard-panel">
        <form action={uploadClientDocument} className="dashboard-form" encType="multipart/form-data">
          <input type="hidden" name="clientProfileId" value={id} />
          <label className="form-field">
            <span>Label</span>
            <input
              name="label"
              required
              maxLength={dashboardFieldMaxLengths.documentLabel}
              placeholder="Week 2 hypnotherapy audio"
            />
          </label>
          <label className="form-field">
            <span>File</span>
            <input name="file" type="file" required />
          </label>
          <button type="submit" className="button button-primary">
            Upload document
          </button>
        </form>
        <ul className="dashboard-doc-list">
          {documents.map((doc) => (
            <li key={doc.id}>
              <strong>{doc.label}</strong>
              <p className="dashboard-note-meta">
                {doc.storage_path} · {formatDashboardDate(doc.created_at)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
