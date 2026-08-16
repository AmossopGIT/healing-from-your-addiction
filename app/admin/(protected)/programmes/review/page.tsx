import type { Metadata } from "next";
import Link from "next/link";
import { getInteractiveProgramme, interactiveProgrammes } from "@/content/interactiveProgrammes";
import { setProgrammeReviewStatus } from "@/lib/dashboard/interactiveProgrammeActions";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Programme source review | Admin",
  description: "Review queue for interactive programme source content and safety.",
  path: "/admin/programmes/review/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ reviewed?: string; error?: string }>;
};

const PRIORITY_SLUGS = new Set(["alcohol", "opioid", "prescription-drug", "stimulant", "inhalant"]);

export default async function AdminProgrammeReviewPage({ searchParams }: PageProps) {
  const { reviewed, error } = await searchParams;
  const supabase = await createClient();
  const { data: templates } = await supabase.from("programme_templates").select("*").order("addiction_slug");
  const templateBySlug = new Map((templates ?? []).map((template) => [template.addiction_slug, template]));

  const queue = interactiveProgrammes
    .map((programme) => {
      const template = templateBySlug.get(programme.slug);
      return {
        programme,
        template,
        reviewStatus: (template?.review_status as string | undefined) ?? programme.reviewStatus ?? "pending",
        priority: PRIORITY_SLUGS.has(programme.slug) || programme.category === "substance",
      };
    })
    .sort((a, b) => Number(b.priority) - Number(a.priority) || a.programme.slug.localeCompare(b.programme.slug));

  const pending = queue.filter((item) => item.reviewStatus !== "approved");

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Source review</p>
        <h1>Programme content review queue</h1>
        <p>
          <Link href="/admin/programmes/">Back to programmes</Link> · {pending.length} awaiting approval
        </p>
        {reviewed ? <p className="dashboard-inline-note">Review saved.</p> : null}
        {error ? <p className="dashboard-error-note">Review update failed.</p> : null}
      </section>

      <section className="dashboard-panel">
        <h2>Queue</h2>
        <div className="admin-programme-review-grid">
          {queue.map(({ programme, template, reviewStatus, priority }) => {
            const live = getInteractiveProgramme(programme.slug) ?? programme;
            return (
              <article key={programme.slug} className="admin-programme-review-card">
                <div className="admin-programme-card-top">
                  <h3>{live.title}</h3>
                  <div className="admin-programme-card-chips">
                    {priority ? <span className="admin-programme-chip admin-programme-chip-warn">Priority</span> : null}
                    <span className="admin-programme-chip">{live.category}</span>
                    <span
                      className={`admin-programme-chip ${
                        reviewStatus === "approved" ? "admin-programme-chip-ok" : "admin-programme-chip-warn"
                      }`}
                    >
                      {reviewStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>
                <p className="admin-programme-card-meta">
                  Source {live.sourceStatus}
                  {live.sourceChecksum ? ` · ${live.sourceChecksum.slice(0, 12)}…` : ""}
                  {template?.reviewed_at ? ` · reviewed ${template.reviewed_at.slice(0, 10)}` : ""}
                </p>
                <p className="admin-programme-review-excerpt">{live.sourceExcerpt || "No source excerpt stored."}</p>
                {template?.review_notes ? (
                  <p className="dashboard-inline-note">Notes: {template.review_notes}</p>
                ) : null}
                <p className="admin-programme-review-links">
                  <Link href={`/admin/programmes/${programme.slug}/?tab=source`}>Open comparison</Link>
                  {" · "}
                  <Link href={`/admin/programmes/${programme.slug}/preview/${live.activities[0]?.id ?? ""}/`}>
                    Preview first activity
                  </Link>
                </p>
                <form action={setProgrammeReviewStatus} className="dashboard-form admin-programme-review-form">
                  <input type="hidden" name="slug" value={programme.slug} />
                  <input type="hidden" name="redirectTo" value="/admin/programmes/review/" />
                  <label className="form-field">
                    <span>Status</span>
                    <select name="reviewStatus" defaultValue={reviewStatus}>
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="changes_requested">Changes requested</option>
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Notes</span>
                    <textarea name="reviewNotes" rows={2} defaultValue={template?.review_notes ?? ""} />
                  </label>
                  <button type="submit" className="button button-small button-secondary">
                    Save review
                  </button>
                </form>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
