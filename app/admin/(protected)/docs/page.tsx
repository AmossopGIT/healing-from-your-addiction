import type { Metadata } from "next";
import Link from "next/link";
import { getAdminDocCatalog, getAdminDocCategories } from "@/lib/adminDocs/catalog";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Internal docs | Admin",
  description: "Team runbooks, checklists, and operational guides.",
  path: "/admin/docs/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

export default function AdminDocsHubPage() {
  const docs = getAdminDocCatalog();
  const categories = getAdminDocCategories(docs);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Internal docs</p>
        <h1>Admin documentation hub</h1>
        <p>Runbooks and reference pages for the admin team. Add new pages in `content/admin-docs/` or register repo docs in `content/adminDocs.ts`.</p>
      </section>

      <section className="dashboard-panel admin-doc-hub-highlight">
        <div className="admin-doc-hub-highlight-copy">
          <p className="eyebrow">Start here</p>
          <h2>How to log in as admin</h2>
          <p>Step-by-step screens for the direct admin URL or the public header route via Staff admin sign in.</p>
        </div>
        <div className="cms-list-actions">
          <Link className="button button-primary" href="/admin/docs/how-to-login-as-admin/">
            Open guide
          </Link>
        </div>
      </section>

      {categories.map((category) => {
        const categoryDocs = docs.filter((doc) => doc.category === category);
        return (
          <section key={category} className="dashboard-panel">
            <h2>{category}</h2>
            <div className="admin-doc-card-grid">
              {categoryDocs.map((doc) => (
                <article key={doc.slug} className="admin-doc-card">
                  <h3>
                    <Link href={`/admin/docs/${doc.slug}/`}>{doc.title}</Link>
                  </h3>
                  {doc.description ? <p>{doc.description}</p> : null}
                  {doc.sourcePath ? (
                    <p className="admin-doc-card-meta">
                      <code>{doc.sourcePath}</code>
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        );
      })}

      {!docs.length ? (
        <section className="dashboard-panel">
          <p className="dashboard-empty">No internal docs yet. Start with `content/admin-docs/how-to-add-pages.md`.</p>
        </section>
      ) : null}
    </div>
  );
}
