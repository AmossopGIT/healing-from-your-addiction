import type { Metadata } from "next";
import Link from "next/link";
import { AdminDocCard } from "@/components/dashboard/adminDocs/AdminDocCard";
import { AdminDocQuickStart } from "@/components/dashboard/adminDocs/AdminDocQuickStart";
import { getAdminDocCatalog, getAdminDocCategories } from "@/lib/adminDocs/catalog";
import { createMetadata } from "@/lib/seo";

const QUICK_START_SLUGS = [
  "how-to-login-as-admin",
  "lead-to-client-onboarding-flow",
  "after-invite-start-the-course",
] as const;

const CATEGORY_INTRO: Partial<Record<string, string>> = {
  Operations:
    "Day-to-day runbooks for leads, invites, and client onboarding. Tap Open guide on any card — PDF download is on each guide page.",
  Content: "Publishing and content workflows for the public site.",
  Marketing: "Launch and marketing checklists.",
  Technical: "Deploy and technical reference for developers.",
};

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
  const quickStartDocs = QUICK_START_SLUGS.map((slug) => docs.find((doc) => doc.slug === slug)).filter(
    (doc): doc is NonNullable<typeof doc> => Boolean(doc),
  );
  const quickStartSlugSet = new Set<string>(QUICK_START_SLUGS);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Internal docs</p>
        <h1>Admin documentation hub</h1>
        <p>Step-by-step guides and runbooks for the admin team. Open a guide below — each page includes a Download PDF button.</p>
      </section>

      <AdminDocQuickStart docs={quickStartDocs} />

      {categories.map((category) => {
        const categoryDocs = docs.filter((doc) => doc.category === category);
        const showQuickStartInGrid = category !== "Operations";
        const gridDocs = showQuickStartInGrid
          ? categoryDocs
          : categoryDocs.filter((doc) => !quickStartSlugSet.has(doc.slug));

        return (
          <section key={category} className="dashboard-panel">
            <h2>{category}</h2>
            {CATEGORY_INTRO[category] ? (
              <p className="dashboard-inline-note admin-doc-category-intro">{CATEGORY_INTRO[category]}</p>
            ) : null}
            <div className="admin-doc-card-grid">
              {gridDocs.map((doc) => (
                <AdminDocCard key={doc.slug} doc={doc} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="dashboard-panel" id="more-links">
        <h2>More admin tools</h2>
        <p className="dashboard-inline-note">Destinations that sit under More on the phone nav.</p>
        <div className="portal-home-action-row">
          <Link href="/admin/analytics/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Analytics</span>
            <span className="portal-home-action-detail">Funnels and activity</span>
          </Link>
          <Link href="/admin/clients/invite/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Invite client</span>
            <span className="portal-home-action-detail">Send a portal invite</span>
          </Link>
          <Link href="/admin/content/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Content</span>
            <span className="portal-home-action-detail">Blog and case studies</span>
          </Link>
          <Link href="/admin/notifications/" className="portal-home-action-chip">
            <span className="portal-home-action-label">Notifications</span>
            <span className="portal-home-action-detail">Push and alerts</span>
          </Link>
        </div>
      </section>

      {!docs.length ? (
        <section className="dashboard-panel">
          <p className="dashboard-empty">No internal docs yet. Start with `content/admin-docs/how-to-add-pages.md`.</p>
        </section>
      ) : null}
    </div>
  );
}
