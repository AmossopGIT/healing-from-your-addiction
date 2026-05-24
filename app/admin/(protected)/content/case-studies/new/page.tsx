import type { Metadata } from "next";
import Link from "next/link";
import { CmsCaseStudyForm } from "@/components/dashboard/CmsCaseStudyForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "New Case Study | Admin",
  description: "Create a case study.",
  path: "/admin/content/case-studies/new/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewCaseStudyPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>New case study</h1>
        <Link className="card-link" href="/admin/content/case-studies/">
          Back to case study list
        </Link>
      </section>
      {error ? <p className="form-error">{decodeURIComponent(error)}</p> : null}
      <section className="dashboard-panel">
        <CmsCaseStudyForm />
      </section>
    </div>
  );
}
