import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminConsultationView } from "@/components/dashboard/AdminConsultationView";
import { getAdminClientBundle, getClientConsultation } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ sent?: string; notesSaved?: string; error?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client consultation | Admin",
    description: "Hypnotherapy consultation form review.",
    path: `/admin/clients/${id}/consultation/`,
    noIndex: true,
  });
}

const errorMessages: Record<string, string> = {
  "email-not-configured": "Email is not configured. Check Resend environment variables.",
  "missing-email": "This client does not have an email address on their account.",
  "save-failed": "Unable to save consultation changes.",
  "client-not-found": "Client not found.",
};

export default async function AdminClientConsultationPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { sent, notesSaved, error } = await searchParams;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const consultation = await getClientConsultation(id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Consultation</p>
        <h1>Hypnotherapy consultation</h1>
        <p>
          {bundle.profile?.full_name ?? "Client"} — review the pre-therapy consultation form, delivery status, and practitioner
          notes.
        </p>
      </section>

      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/`} className="button button-secondary">
          Client profile
        </Link>
        <Link href={`/admin/clients/${id}/intake/`} className="button button-secondary">
          Intake
        </Link>
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">
          Programme
        </Link>
        <Link href={`/admin/clients/${id}/messages/`} className="button button-secondary">
          Messages
        </Link>
      </div>

      <AdminConsultationView
        consultation={consultation}
        clientProfileId={id}
        clientName={bundle.profile?.full_name ?? "Client"}
        sent={Boolean(sent)}
        notesSaved={Boolean(notesSaved)}
        error={error ? errorMessages[error] ?? decodeURIComponent(error) : undefined}
      />
    </div>
  );
}

