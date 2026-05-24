import type { Metadata } from "next";
import Link from "next/link";
import { BackfillCmsButton } from "@/components/dashboard/BackfillCmsButton";
import { isCmsContentEnabled } from "@/lib/cms/featureFlag";
import { fetchAllCmsBlogPosts, fetchAllCmsCaseStudies } from "@/lib/cms/queries";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Content CMS | Admin",
  description: "Manage blog posts and case studies.",
  path: "/admin/content/",
  noIndex: true,
});

export default async function AdminContentPage() {
  const [blogPosts, caseStudies] = await Promise.all([fetchAllCmsBlogPosts(true), fetchAllCmsCaseStudies(true)]);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog and case study publishing</h1>
        <p>Create structured content with SEO metadata, watercolor hero art, and editorial workflow.</p>
        <p className="cms-feature-flag">
          CMS public rendering: <strong>{isCmsContentEnabled() ? "enabled" : "disabled"}</strong> (set{" "}
          <code>NEXT_PUBLIC_CMS_CONTENT_ENABLED=true</code> after backfill)
        </p>
      </section>

      <section className="dashboard-stat-grid">
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Blog posts</p>
          <p className="dashboard-stat-value">{blogPosts.length}</p>
        </div>
        <div className="dashboard-stat-card">
          <p className="dashboard-stat-label">Case studies</p>
          <p className="dashboard-stat-value">{caseStudies.length}</p>
        </div>
      </section>

      <section className="dashboard-panel">
        <div className="cms-list-actions">
          <Link className="button button-primary" href="/admin/content/blog/new/">
            New blog post
          </Link>
          <Link className="button button-secondary" href="/admin/content/case-studies/new/">
            New case study
          </Link>
          <Link className="button button-secondary" href="/admin/content/blog/">
            All blog posts
          </Link>
          <Link className="button button-secondary" href="/admin/content/case-studies/">
            All case studies
          </Link>
        </div>
      </section>

      <section className="dashboard-two-col">
        <div className="dashboard-panel">
          <h2>Recent blog drafts</h2>
          {blogPosts.slice(0, 5).map((post) => (
            <p key={post.id}>
              <Link href={`/admin/content/blog/${post.id}/`}>{post.title}</Link> — {cmsWorkflowStatusLabels[post.workflow_status]}
            </p>
          ))}
        </div>
        <div className="dashboard-panel">
          <h2>Recent case studies</h2>
          {caseStudies.slice(0, 5).map((study) => (
            <p key={study.id}>
              <Link href={`/admin/content/case-studies/${study.id}/`}>{study.title}</Link> — {cmsWorkflowStatusLabels[study.workflow_status]}
            </p>
          ))}
        </div>
      </section>

      <BackfillCmsButton />
    </div>
  );
}
