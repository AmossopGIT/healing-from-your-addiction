import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CmsBlogForm } from "@/components/dashboard/CmsBlogForm";
import { CmsWorkflowPanel } from "@/components/dashboard/CmsWorkflowPanel";
import { cmsBlogPostToPublishableInput } from "@/lib/cms/mappers";
import { fetchCmsBlogPostById, fetchWorkflowEvents } from "@/lib/cms/queries";
import { safeDecodeURIComponent } from "@/lib/cms/safeQueryParam";
import { validateBlogPublish } from "@/lib/cms/validation";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: `Edit Blog Post ${id} | Admin`,
    description: "Edit blog post.",
    path: `/admin/content/blog/${id}/`,
    noIndex: true,
  });
}

export default async function EditBlogPostPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const post = await fetchCmsBlogPostById(id);
  if (!post) notFound();

  const events = await fetchWorkflowEvents("blog_post", id);
  const publishValidation = validateBlogPublish(cmsBlogPostToPublishableInput(post));
  const publishBlockers = publishValidation.ok ? [] : publishValidation.errors;
  const legacyError = error ? safeDecodeURIComponent(error) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Edit blog post</h1>
        <Link className="card-link" href="/admin/content/blog/">
          Back to blog list
        </Link>
      </section>
      {legacyError ? <p className="form-error">{legacyError}</p> : null}
      {saved ? <p className="cms-inline-status">Saved successfully.</p> : null}
      <CmsWorkflowPanel
        contentType="blog"
        contentId={post.id}
        status={post.workflow_status}
        scheduledFor={post.scheduled_for}
        events={events}
        publishBlockers={publishBlockers}
      />
      <section className="dashboard-panel">
        <CmsBlogForm post={post} initialError={legacyError} />
      </section>
    </div>
  );
}

export async function generateStaticParams() {
  return [];
}
