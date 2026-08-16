import type { Metadata } from "next";
import Link from "next/link";
import { SeedProgrammesButton } from "@/components/dashboard/SeedProgrammesButton";
import { AdminProgrammeCatalogGraphLazy } from "@/components/dashboard/AdminProgrammeCatalogGraphLazy";
import type { CatalogueGraphEdge, CatalogueGraphNode } from "@/components/dashboard/AdminProgrammeCatalogGraph";
import {
  AdminProgrammeLibraryGrid,
  type ProgrammeLibraryCard,
} from "@/components/dashboard/AdminProgrammeLibraryGrid";
import { expectedProgrammeDocCount } from "@/content/programmeDocs";
import { catalogueSummary } from "@/lib/programme/interactive/content";
import { getProgrammeReportingSummary } from "@/lib/programme/interactive/reporting";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programmes | Admin",
  description: "Interactive programme templates and publishing status.",
  path: "/admin/programmes/",
  noIndex: true,
});

export default async function AdminProgrammesPage() {
  const supabase = await createClient();
  const [{ data: templates }, reporting, { data: docs }] = await Promise.all([
    supabase.from("programme_templates").select("*").order("addiction_slug"),
    getProgrammeReportingSummary(),
    supabase.from("programme_docs").select("id, addiction_slug, title, slug").order("sort_order"),
  ]);
  const templateBySlug = new Map((templates ?? []).map((template) => [template.addiction_slug, template]));
  const catalogue = catalogueSummary();
  const enrollmentsBySlug = new Map(reporting.map((row) => [row.addictionSlug, row.enrollments]));
  const docsBySlug = new Map<string, number>();
  for (const doc of docs ?? []) {
    docsBySlug.set(doc.addiction_slug, (docsBySlug.get(doc.addiction_slug) ?? 0) + 1);
  }
  const expectedGuides = expectedProgrammeDocCount();

  const readyCount = catalogue.filter((item) => !item.issues.some((issue) => issue.level === "error")).length;
  const reviewCount = catalogue.filter((item) => item.needsManualReview).length;
  const publishedCount = (templates ?? []).filter((template) => template.status === "published").length;
  const guidesReadyCount = catalogue.filter((item) => (docsBySlug.get(item.slug) ?? 0) >= expectedGuides).length;

  const totalEnrolled = reporting.reduce((sum, row) => sum + row.enrollments, 0);
  const totalStarted = reporting.reduce((sum, row) => sum + row.started, 0);
  const totalInactive = reporting.reduce((sum, row) => sum + row.inactiveActiveClients, 0);
  const totalSafety = reporting.reduce((sum, row) => sum + row.safetyFlags, 0);

  const cards: ProgrammeLibraryCard[] = catalogue.map((item) => {
    const template = templateBySlug.get(item.slug);
    const errors = item.issues.filter((issue) => issue.level === "error").length;
    const warnings = item.issues.filter((issue) => issue.level === "warning").length;
    const validationTone = errors > 0 ? "error" : warnings > 0 ? "warn" : "ok";
    const validationLabel =
      errors > 0 ? `${errors} error${errors === 1 ? "" : "s"}` : warnings > 0 ? `${warnings} warn` : "OK";
    return {
      slug: item.slug,
      title: item.title,
      category: item.category,
      activityCount: item.activityCount,
      enrolled: enrollmentsBySlug.get(item.slug) ?? 0,
      guideCount: docsBySlug.get(item.slug) ?? 0,
      expectedGuides,
      dbStatus: template?.status ?? "not seeded",
      needsReview: item.needsManualReview,
      validationLabel,
      validationTone,
    };
  });

  const shortProgrammeLabel = (title: string) => {
    const cleaned = title
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .replace(/\s*Addiction.*$/i, "")
      .replace(/\s*Abuse.*$/i, "")
      .replace(/\s*Dependence.*$/i, "")
      .trim();
    return cleaned.length > 22 ? `${cleaned.slice(0, 20)}…` : cleaned || title;
  };

  const graphNodes: CatalogueGraphNode[] = [
    { id: "hub", label: `${catalogue.length} programmes`, kind: "hub" },
    ...catalogue.map((item) => ({
      id: `prog-${item.slug}`,
      label: shortProgrammeLabel(item.title),
      kind: "programme" as const,
      href: `/admin/programmes/${item.slug}/`,
      meta: `${enrollmentsBySlug.get(item.slug) ?? 0} enrolled · guides ${docsBySlug.get(item.slug) ?? 0}/${expectedGuides}`,
    })),
    ...catalogue.map((item) => ({
      id: `json-${item.slug}`,
      label: "Journey",
      kind: "interactive" as const,
      href: `/admin/programmes/${item.slug}/`,
      meta: `${item.activityCount} activities`,
    })),
    // One guides node per programme (not 3 separate docs) — keeps the map readable.
    ...catalogue.map((item) => {
      const count = docsBySlug.get(item.slug) ?? 0;
      return {
        id: `guides-${item.slug}`,
        label: count ? `Guides ${count}` : "No guides",
        kind: "doc" as const,
        href: `/admin/programmes/${item.slug}/`,
        meta: `${count}/${expectedGuides} guides`,
      };
    }),
  ];

  const graphEdges: CatalogueGraphEdge[] = [
    ...catalogue.map((item) => ({
      id: `hub-${item.slug}`,
      source: "hub",
      target: `prog-${item.slug}`,
      label: "",
    })),
    ...catalogue.map((item) => ({
      id: `json-edge-${item.slug}`,
      source: `prog-${item.slug}`,
      target: `json-${item.slug}`,
      label: "",
    })),
    ...catalogue.map((item) => ({
      id: `guides-edge-${item.slug}`,
      source: `prog-${item.slug}`,
      target: `guides-${item.slug}`,
      label: "",
    })),
  ].filter((edge) => graphNodes.some((node) => node.id === edge.source) && graphNodes.some((node) => node.id === edge.target));

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programmes</p>
        <h1>Interactive programme library</h1>
        <p>
          {catalogue.length} journeys · one assigned per client · {guidesReadyCount} with full guide packs
        </p>
        <div className="admin-programme-actions">
          <Link className="button button-secondary" href="/admin/programmes/operations/">
            Operations
          </Link>
          <Link className="button button-secondary" href="/admin/programmes/review/">
            Review queue
          </Link>
        </div>
      </section>

      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Definitions</p>
          <p className="admin-programme-stat-value">{catalogue.length}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Ready</p>
          <p className="admin-programme-stat-value">{readyCount}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Manual review</p>
          <p className="admin-programme-stat-value">{reviewCount}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Published</p>
          <p className="admin-programme-stat-value">{publishedCount}</p>
        </article>
      </section>

      <section className="dashboard-panel admin-programme-seed-panel">
        <SeedProgrammesButton />
      </section>

      <AdminProgrammeLibraryGrid cards={cards} />

      <section className="dashboard-panel">
        <div className="dashboard-panel-header">
          <h2>Engagement snapshot</h2>
          <Link href="/admin/programmes/operations/" className="dashboard-panel-link">
            See operations
          </Link>
        </div>
        <div className="admin-programme-summary">
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Enrolled</p>
            <p className="admin-programme-stat-value">{totalEnrolled}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Started</p>
            <p className="admin-programme-stat-value">{totalStarted}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Inactive 5+ days</p>
            <p className="admin-programme-stat-value">{totalInactive}</p>
          </article>
          <article className="dashboard-stat-card">
            <p className="dashboard-stat-label">Safety flags</p>
            <p className="admin-programme-stat-value">{totalSafety}</p>
          </article>
        </div>
      </section>

      <details className="dashboard-panel admin-programme-map-details">
        <summary>Connection map (optional)</summary>
        <p className="dashboard-inline-note">
          Programme · journey · guides (one node per programme). Use the catalogue cards above for day-to-day browsing.
        </p>
        <ul className="admin-programme-map-legend">
          <li>
            <span className="admin-programme-legend-swatch is-programme" /> Programme
          </li>
          <li>
            <span className="admin-programme-legend-swatch is-journey" /> Journey
          </li>
          <li>
            <span className="admin-programme-legend-swatch is-guide" /> Guides pack
          </li>
        </ul>
        <AdminProgrammeCatalogGraphLazy nodes={graphNodes} edges={graphEdges} />
      </details>
    </div>
  );
}
