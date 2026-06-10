import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminIntakeView } from "@/components/dashboard/AdminIntakeView";
import { getAdminClientBundle, getClientIntakeSubmission } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client intake | Admin",
    description: "Client pre-programme intake responses.",
    path: `/admin/clients/${id}/intake/`,
    noIndex: true,
  });
}

export default async function AdminClientIntakePage({ params }: PageProps) {
  const { id } = await params;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const submission = await getClientIntakeSubmission(id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Intake</p>
        <h1>Pre-programme questions</h1>
        <p>{bundle.profile?.full_name ?? "Client"} — review submitted intake responses before the intake conversation.</p>
      </section>

      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/`} className="button button-secondary">
          Client profile
        </Link>
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">
          Programme
        </Link>
        <Link href={`/admin/clients/${id}/messages/`} className="button button-secondary">
          Messages
        </Link>
      </div>

      <section className="dashboard-panel">
        <AdminIntakeView submission={submission} addictionSlug={bundle.clientProfile.addiction_slug} />
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
