import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminLoginGuide } from "@/components/dashboard/adminDocs/AdminLoginGuide";
import { LeadOnboardingGuide } from "@/components/dashboard/adminDocs/LeadOnboardingGuide";
import { LeadTriagePlaybookGuide } from "@/components/dashboard/adminDocs/LeadTriagePlaybookGuide";
import { ProgrammeStartGuide } from "@/components/dashboard/adminDocs/ProgrammeStartGuide";
import { AdminDocPageLayout } from "@/components/dashboard/AdminDocPageLayout";
import { getAdminDocBySlug, getAdminDocCatalog } from "@/lib/adminDocs/catalog";
import { loadAdminDocContent } from "@/lib/adminDocs/loadDoc";
import type { AdminDocPdfPayload } from "@/lib/adminDocs/pdf/types";
import { createMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return getAdminDocCatalog().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getAdminDocBySlug(slug);
  if (!doc) {
    return createMetadata({
      title: "Doc not found | Admin",
      description: "Internal admin documentation.",
      path: `/admin/docs/${slug}/`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${doc.title} | Admin docs`,
    description: doc.description || "Internal admin documentation.",
    path: `/admin/docs/${doc.slug}/`,
    noIndex: true,
  });
}

function buildPdfPayload(slug: string, meta: NonNullable<ReturnType<typeof getAdminDocBySlug>>, markdown?: string): AdminDocPdfPayload {
  if (meta.customPage === "admin-login-guide") {
    return { kind: "admin-login-guide", slug };
  }
  if (meta.customPage === "lead-onboarding-guide") {
    return { kind: "lead-onboarding-guide", slug };
  }
  if (meta.customPage === "lead-triage-playbook") {
    return { kind: "lead-triage-playbook", slug };
  }
  if (meta.customPage === "programme-start-guide") {
    return { kind: "programme-start-guide", slug };
  }

  return {
    kind: "markdown",
    slug,
    title: meta.title,
    description: meta.description,
    category: meta.category,
    markdown: markdown ?? "",
  };
}

export default async function AdminDocPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getAdminDocBySlug(slug);
  if (!meta) notFound();

  if (meta.customPage === "admin-login-guide") {
    return (
      <AdminDocPageLayout
        title={meta.title}
        description={meta.description}
        category={meta.category}
        pdfPayload={buildPdfPayload(slug, meta)}
      >
        <AdminLoginGuide />
      </AdminDocPageLayout>
    );
  }

  if (meta.customPage === "lead-onboarding-guide") {
    return (
      <AdminDocPageLayout
        title={meta.title}
        description={meta.description}
        category={meta.category}
        pdfPayload={buildPdfPayload(slug, meta)}
      >
        <LeadOnboardingGuide />
      </AdminDocPageLayout>
    );
  }

  if (meta.customPage === "lead-triage-playbook") {
    return (
      <AdminDocPageLayout
        title={meta.title}
        description={meta.description}
        category={meta.category}
        pdfPayload={buildPdfPayload(slug, meta)}
      >
        <LeadTriagePlaybookGuide />
      </AdminDocPageLayout>
    );
  }

  if (meta.customPage === "programme-start-guide") {
    return (
      <AdminDocPageLayout
        title={meta.title}
        description={meta.description}
        category={meta.category}
        pdfPayload={buildPdfPayload(slug, meta)}
      >
        <ProgrammeStartGuide />
      </AdminDocPageLayout>
    );
  }

  const doc = loadAdminDocContent(slug);
  if (!doc) notFound();

  return (
    <AdminDocPageLayout
      title={doc.title}
      description={doc.description}
      category={doc.category}
      pdfPayload={buildPdfPayload(slug, meta, doc.body)}
      markdown={doc.body}
    />
  );
}
