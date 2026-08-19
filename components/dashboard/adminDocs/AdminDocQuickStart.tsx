import Link from "next/link";
import type { AdminDocMeta } from "@/lib/adminDocs/catalog";

type AdminDocQuickStartProps = {
  docs: AdminDocMeta[];
};

export function AdminDocQuickStart({ docs }: AdminDocQuickStartProps) {
  if (!docs.length) return null;

  return (
    <section className="dashboard-panel admin-doc-hub-quickstart">
      <p className="eyebrow">Quick start</p>
      <h2>Most used guides</h2>
      <p className="dashboard-inline-note admin-doc-category-intro">
        The day-to-day path: log in, move a lead to client, then start the course after invite. Tap a card to open the full
        guide.
      </p>
      <div className="portal-home-action-row admin-doc-quickstart-row">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/admin/docs/${doc.slug}/`}
            className="portal-home-action-chip admin-doc-quickstart-chip"
          >
            <span className="portal-home-action-label">{doc.title}</span>
            <span className="portal-home-action-detail">{doc.description}</span>
            <span className="admin-doc-quickstart-cta">Open guide →</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
