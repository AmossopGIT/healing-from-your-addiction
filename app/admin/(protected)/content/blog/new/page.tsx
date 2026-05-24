import type { Metadata } from "next";
import Link from "next/link";
import { CmsBlogForm } from "@/components/dashboard/CmsBlogForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "New Blog Post | Admin",
  description: "Create a blog post.",
  path: "/admin/content/blog/new/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ error?: string }> };

export default async function NewBlogPostPage({ searchParams }: PageProps) {
  const { error } = await searchParams;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>New blog post</h1>
        <Link className="card-link" href="/admin/content/blog/">
          Back to blog list
        </Link>
      </section>
      {error ? <p className="form-error">{decodeURIComponent(error)}</p> : null}
      <section className="dashboard-panel">
        <CmsBlogForm />
      </section>
    </div>
  );
}
