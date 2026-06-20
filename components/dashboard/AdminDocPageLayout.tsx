import Link from "next/link";
import type { ReactNode } from "react";
import { AdminDocPdfExport } from "@/components/dashboard/AdminDocPdfExport";
import { AdminDocBody } from "@/lib/adminDocs/renderMarkdown";
import type { AdminDocPdfPayload } from "@/lib/adminDocs/pdf/types";

type AdminDocPageLayoutProps = {
  title: string;
  description?: string;
  category?: string;
  pdfPayload: AdminDocPdfPayload;
  markdown?: string;
  children?: ReactNode;
};

export function AdminDocPageLayout({
  title,
  description,
  category,
  pdfPayload,
  markdown,
  children,
}: AdminDocPageLayoutProps) {
  return (
    <div className="dashboard-stack admin-doc-page">
      <section className="dashboard-page-header admin-doc-page-header">
        <p className="eyebrow">Internal docs</p>
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {category ? (
          <p className="admin-doc-meta">
            <span className="admin-doc-category-badge">{category}</span>
          </p>
        ) : null}
        <div className="admin-doc-toolbar">
          <Link className="button button-secondary" href="/admin/docs/">
            Back to docs hub
          </Link>
          <AdminDocPdfExport payload={pdfPayload} />
        </div>
      </section>

      {children ? (
        children
      ) : markdown ? (
        <section className="dashboard-panel admin-doc-panel">
          <AdminDocBody markdown={markdown} />
        </section>
      ) : null}
    </div>
  );
}
