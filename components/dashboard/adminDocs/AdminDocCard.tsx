import Link from "next/link";
import type { AdminDocMeta } from "@/lib/adminDocs/catalog";

type AdminDocCardProps = {
  doc: AdminDocMeta;
  featured?: boolean;
};

function docFormat(doc: AdminDocMeta) {
  if (doc.customPage) {
    return { badge: "Step-by-step guide", detail: "Screen walkthrough + PDF download" };
  }

  if (doc.category === "Planning records") {
    return { badge: "Planning record", detail: "Full notes — daily actions are in Admin → Team planning" };
  }

  return { badge: "Runbook", detail: "Reference page + PDF download" };
}

export function AdminDocCard({ doc, featured }: AdminDocCardProps) {
  const href = `/admin/docs/${doc.slug}/`;
  const format = docFormat(doc);

  return (
    <article className={`admin-doc-card${featured ? " admin-doc-card-featured" : ""}`}>
      <div className="admin-doc-card-top">
        <span className="admin-doc-card-badge">{format.badge}</span>
        {featured ? <span className="admin-doc-card-badge admin-doc-card-badge-accent">Start here</span> : null}
      </div>
      <h3 className="admin-doc-card-title">{doc.title}</h3>
      {doc.description ? <p className="admin-doc-card-description">{doc.description}</p> : null}
      <p className="admin-doc-card-format-note">{format.detail}</p>
      <div className="admin-doc-card-actions">
        <Link className="button button-primary admin-doc-card-cta" href={href}>
          Open guide
        </Link>
      </div>
    </article>
  );
}
