import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsCaseStudyForm } from "@/components/dashboard/CmsCaseStudyForm";
import { CmsWorkflowPanel } from "@/components/dashboard/CmsWorkflowPanel";
import { fetchCmsCaseStudyById, fetchWorkflowEvents } from "@/lib/cms/queries";
import { createMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: `Edit Case Study ${id} | Admin`,
    description: "Edit case study.",
    path: `/admin/content/case-studies/${id}/`,
    noIndex: true,
  });
}

export default async function EditCaseStudyPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const study = await fetchCmsCaseStudyById(id);
  if (!study) notFound();

  const events = await fetchWorkflowEvents("case_study", id);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Edit case study</h1>
        <Link className="card-link" href="/admin/content/case-studies/">
          Back to case study list
        </Link>
      </section>
      {error ? <p className="form-error">{decodeURIComponent(error)}</p> : null}
      {saved ? <p className="cms-inline-status">Saved successfully.</p> : null}
      <CmsWorkflowPanel
        contentType="case-study"
        contentId={study.id}
        status={study.workflow_status}
        scheduledFor={study.scheduled_for}
        events={events}
      />
      <section className="dashboard-panel">
        <CmsCaseStudyForm study={study} />
      </section>
    </div>
  );
}
