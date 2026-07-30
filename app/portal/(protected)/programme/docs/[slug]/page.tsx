import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReadOnView } from "@/components/dashboard/ReadOnView";
import { ProgrammeDocPdfDownload } from "@/components/portal/ProgrammeDocPdfDownload";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientContentReceipts, getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return createMetadata({
    title: `Programme guide | Client Portal`,
    description: "Programme document.",
    path: `/portal/programme/docs/${slug}/`,
    noIndex: true,
  });
}

function renderMarkdownSimple(markdown: string) {
  return markdown.split("\n").map((line, index) => {
    const trimmed = line.trim();
    if (!trimmed) return <br key={index} />;
    if (trimmed.startsWith("# ")) return <h1 key={index}>{trimmed.slice(2)}</h1>;
    if (trimmed.startsWith("## ")) return <h2 key={index}>{trimmed.slice(3)}</h2>;
    if (trimmed.startsWith("- ")) return <p key={index}>• {trimmed.slice(2)}</p>;
    if (/^\d+\.\s/.test(trimmed)) return <p key={index}>{trimmed}</p>;
    return <p key={index}>{trimmed}</p>;
  });
}

export default async function PortalProgrammeDocPage({ params }: PageProps) {
  const { slug } = await params;
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;

  if (!bundle?.enrollment) notFound();
  if (!bundle.schedule) redirect("/portal/programme/schedule/");

  const doc = bundle.programmeDocs.find((item) => item.slug === slug);
  if (!doc) notFound();

  const receipts = await getClientContentReceipts(bundle.clientProfile.id, {
    contentKind: "programme_doc",
    contentIds: [doc.id],
  });
  if (!receipts.length) {
    return (
      <div className="dashboard-stack">
        <p className="dashboard-empty">This guide has not been released to you yet.</p>
        <Link href="/portal/programme/" className="button button-secondary">
          Back to programme
        </Link>
      </div>
    );
  }

  return (
    <div className="dashboard-stack">
      <ReadOnView
        endpoint="/api/portal/content/read/"
        payload={{ contentId: doc.id, contentKind: "programme_doc" }}
      />
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme guide</p>
        <h1>{doc.title}</h1>
        {doc.summary ? <p>{doc.summary}</p> : null}
        <ProgrammeDocPdfDownload
          title={doc.title}
          summary={doc.summary}
          bodyMarkdown={doc.body_markdown}
          addictionLabel={bundle.template?.title ?? "Programme"}
        />
      </section>
      <section className="dashboard-panel programme-doc-body">{renderMarkdownSimple(doc.body_markdown)}</section>
      <p>
        <Link href="/portal/programme/" className="button button-secondary">
          Back to programme
        </Link>
      </p>
    </div>
  );
}
