import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInteractiveProgramme } from "@/content/interactiveProgrammes";
import type { InteractiveProgrammeDefinition } from "@/content/interactiveProgrammes/types";
import { validateInteractiveProgramme } from "@/content/interactiveProgrammes/validate";
import {
  publishProgrammeVersion,
  saveProgrammeDraft,
  setProgrammeReviewStatus,
} from "@/lib/dashboard/interactiveProgrammeActions";
import { createClient } from "@/lib/supabase/server";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    draftSaved?: string;
    published?: string;
    reviewed?: string;
    error?: string;
    tab?: string;
  }>;
};

function asDefinition(value: unknown): InteractiveProgrammeDefinition | null {
  if (!value || typeof value !== "object") return null;
  if (!("slug" in value) || !("activities" in value)) return null;
  return value as InteractiveProgrammeDefinition;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return createMetadata({
    title: `Programme ${slug} | Admin`,
    description: "Programme content editor, validation, and version history.",
    path: `/admin/programmes/${slug}/`,
    noIndex: true,
  });
}

export default async function AdminProgrammeDetailPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { draftSaved, published, reviewed, error, tab } = await searchParams;
  const sourceProgramme = getInteractiveProgramme(slug);
  if (!sourceProgramme) notFound();

  const supabase = await createClient();
  const { data: template } = await supabase
    .from("programme_templates")
    .select("*")
    .eq("addiction_slug", slug)
    .maybeSingle();

  const draft = asDefinition(template?.draft_content_json);
  const publishedDefinition = asDefinition(template?.content_json) ?? sourceProgramme;
  const editable = draft ?? publishedDefinition;
  const issues = validateInteractiveProgramme(editable);
  const activeTab = tab ?? "content";

  const { data: versions } = template
    ? await supabase
        .from("programme_versions")
        .select("id, version, status, review_status, published_at, created_at, source_checksum")
        .eq("template_id", template.id)
        .order("version", { ascending: false })
    : { data: [] as Array<{
        id: string;
        version: number;
        status: string;
        review_status: string;
        published_at: string | null;
        created_at: string;
        source_checksum: string | null;
      }> };

  const sourceActivities = editable.activities.filter((activity) => activity.origin === "source").length;
  const platformActivities = editable.activities.filter((activity) => activity.origin === "platform").length;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Programme detail</p>
        <h1>{editable.title}</h1>
        <p>
          <Link href="/admin/programmes/">Back to programmes</Link>
          {" · "}
          <Link href="/admin/programmes/review/">Review queue</Link>
          {" · "}
          source {editable.sourceStatus}
          {editable.needsManualReview ? " · needs manual review" : ""}
          {draft ? " · unpublished draft present" : ""}
        </p>
        {draftSaved ? <p className="dashboard-inline-note">Draft saved.</p> : null}
        {published ? <p className="dashboard-inline-note">New version published. Existing client snapshots were not rewritten.</p> : null}
        {reviewed ? <p className="dashboard-inline-note">Review status updated.</p> : null}
        {error === "review-required" ? (
          <p className="dashboard-error-note">Approve this programme in review before publishing a new version.</p>
        ) : null}
        {error && error !== "review-required" ? <p className="dashboard-error-note">Action failed: {error}</p> : null}
      </section>

      <section className="admin-programme-summary">
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Published version</p>
          <p className="admin-programme-stat-value">{template?.version ?? publishedDefinition.version}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Days</p>
          <p className="admin-programme-stat-value">{editable.dayCount}</p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Source / platform</p>
          <p className="admin-programme-stat-value">
            {sourceActivities}/{platformActivities}
          </p>
        </article>
        <article className="dashboard-stat-card">
          <p className="dashboard-stat-label">Review</p>
          <p className="admin-programme-stat-value">{template?.review_status ?? editable.reviewStatus}</p>
        </article>
      </section>

      <nav className="dashboard-inline-actions" aria-label="Programme editor tabs">
        {[
          ["content", "Content"],
          ["activities", "Activities"],
          ["safety", "Safety"],
          ["source", "Source comparison"],
          ["validation", "Validation"],
          ["history", "Version history"],
        ].map(([id, label]) => (
          <Link
            key={id}
            href={`/admin/programmes/${slug}/?tab=${id}`}
            className={`button button-small ${activeTab === id ? "button-primary" : "button-secondary"}`}
          >
            {label}
          </Link>
        ))}
      </nav>

      {activeTab === "content" ? (
        <section className="dashboard-panel">
          <h2>Editable draft</h2>
          <p className="dashboard-inline-note">
            Saving creates or updates a draft version. Publishing creates a new immutable published version and leaves enrolled client snapshots unchanged.
          </p>
          <form action={saveProgrammeDraft} className="dashboard-form">
            <input type="hidden" name="slug" value={slug} />
            <label className="form-field">
              <span>Title</span>
              <input name="title" required defaultValue={editable.title} />
            </label>
            <label className="form-field">
              <span>Description</span>
              <textarea name="description" rows={4} defaultValue={editable.description} />
            </label>
            <label className="form-field">
              <span>Safety disclaimer</span>
              <textarea name="safetyDisclaimer" rows={3} defaultValue={editable.safety.disclaimer} />
            </label>
            <label className="form-field">
              <span>Safety reminder</span>
              <textarea name="safetyReminder" rows={3} defaultValue={editable.safety.reminder} />
            </label>
            <label className="form-field">
              <span>Safety escalation</span>
              <textarea name="safetyEscalation" rows={3} defaultValue={editable.safety.escalation ?? ""} />
            </label>
            <div className="dashboard-inline-actions">
              <button type="submit" className="button button-secondary">
                Save draft
              </button>
            </div>
          </form>
          <form action={publishProgrammeVersion} className="dashboard-form">
            <input type="hidden" name="slug" value={slug} />
            <button type="submit" className="button button-primary">
              Publish new version
            </button>
          </form>
        </section>
      ) : null}

      {activeTab === "activities" ? (
        <section className="dashboard-panel">
          <h2>Activities</h2>
          <ul className="dashboard-session-list">
            {editable.activities
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((activity) => (
                <li key={activity.id} className="dashboard-session-item">
                  <div>
                    <strong>{activity.title}</strong>
                    <p className="dashboard-inline-note">
                      {activity.origin === "source" ? "Source content" : "Additional interactive exercise"} · {activity.type} ·
                      week {activity.weekNumber}
                      {activity.dayNumber ? ` · day ${activity.dayNumber}` : ""} · {activity.points} pts
                    </p>
                    {activity.affirmation ? <p>{activity.affirmation}</p> : null}
                    <p>
                      <Link href={`/admin/programmes/${slug}/preview/${activity.id}/`}>Preview as client</Link>
                    </p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {activeTab === "safety" ? (
        <section className="dashboard-panel">
          <h2>Safety & review</h2>
          <p>{editable.safety.disclaimer}</p>
          <p className="dashboard-inline-note">{editable.safety.reminder}</p>
          {editable.safety.escalation ? (
            <p className="dashboard-inline-note dashboard-warning-note">{editable.safety.escalation}</p>
          ) : null}
          <form action={setProgrammeReviewStatus} className="dashboard-form">
            <input type="hidden" name="slug" value={slug} />
            <input type="hidden" name="redirectTo" value={`/admin/programmes/${slug}/?tab=safety`} />
            <label className="form-field">
              <span>Review status</span>
              <select name="reviewStatus" defaultValue={template?.review_status ?? "pending"}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="changes_requested">Changes requested</option>
              </select>
            </label>
            <label className="form-field">
              <span>Reviewer notes</span>
              <textarea name="reviewNotes" rows={3} defaultValue={template?.review_notes ?? ""} />
            </label>
            <button type="submit" className="button button-secondary">
              Save review status
            </button>
          </form>
        </section>
      ) : null}

      {activeTab === "source" ? (
        <section className="dashboard-panel">
          <h2>Source comparison</h2>
          <p className="dashboard-inline-note">
            Registry checksum: {sourceProgramme.sourceChecksum || "—"} · Draft/published checksum:{" "}
            {editable.sourceChecksum || "—"}
          </p>
          <p>
            <strong>Source file:</strong> {editable.sourceFile}
          </p>
          <p>
            <strong>Excerpt:</strong> {editable.sourceExcerpt || "No excerpt stored."}
          </p>
          <p className="dashboard-inline-note">
            Source activities stay labelled separately from platform exercises so regenerated content cannot pretend PDF
            material includes interactive add-ons.
          </p>
        </section>
      ) : null}

      {activeTab === "validation" ? (
        <section className="dashboard-panel">
          <h2>Validation</h2>
          {issues.length ? (
            <ul>
              {issues.map((issue) => (
                <li key={`${issue.level}-${issue.message}`} className={issue.level === "error" ? "dashboard-error-note" : ""}>
                  [{issue.level}] {issue.message}
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty">No validation issues.</p>
          )}
        </section>
      ) : null}

      {activeTab === "history" ? (
        <section className="dashboard-panel">
          <h2>Version history</h2>
          {(versions ?? []).length ? (
            <ul className="dashboard-session-list">
              {(versions ?? []).map((version) => (
                <li key={version.id} className="dashboard-session-item">
                  <div>
                    <strong>
                      v{version.version} · {version.status}
                    </strong>
                    <p className="dashboard-inline-note">
                      review {version.review_status}
                      {version.published_at ? ` · published ${version.published_at.slice(0, 10)}` : ""} · created{" "}
                      {version.created_at.slice(0, 10)}
                      {version.source_checksum ? ` · ${version.source_checksum.slice(0, 12)}…` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="dashboard-empty">No version rows yet. Save a draft or publish to create history.</p>
          )}
        </section>
      ) : null}

      {activeTab === "content" || activeTab === "activities" ? null : (
        <section className="dashboard-panel">
          <h2>Modules</h2>
          <div className="programme-module-grid">
            {editable.modules.map((module) => (
              <article key={module.id} className="programme-module-card">
                <p className="eyebrow">Week {module.number}</p>
                <h3>{module.title}</h3>
                <p>{module.theme}</p>
                <ul className="programme-focus-list">
                  {module.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
