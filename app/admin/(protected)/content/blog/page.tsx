import type { Metadata } from "next";
import Link from "next/link";
import { fetchAllCmsBlogPosts } from "@/lib/cms/queries";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { createMetadata } from "@/lib/seo";
import { cmsWorkflowStatusLabels } from "@/types/cms";

export const metadata: Metadata = createMetadata({
  title: "Blog CMS | Admin",
  description: "Manage blog posts.",
  path: "/admin/content/blog/",
  noIndex: true,
});

export default async function AdminBlogListPage() {
  const posts = await fetchAllCmsBlogPosts(true);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Content</p>
        <h1>Blog posts</h1>
        <Link className="button button-primary" href="/admin/content/blog/new/">
          New blog post
        </Link>
      </section>
      <section className="dashboard-panel">
        {posts.length ? (
          <div className="dashboard-table-wrap">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link href={`/admin/content/blog/${post.id}/`}>{post.title}</Link>
                    </td>
                    <td>{post.slug}</td>
                    <td>
                      <span className={`cms-status-badge cms-status-${post.workflow_status}`}>
                        {cmsWorkflowStatusLabels[post.workflow_status]}
                      </span>
                    </td>
                    <td>{formatDashboardDate(post.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="dashboard-empty">No CMS blog posts yet.</p>
        )}
      </section>
    </div>
  );
}
