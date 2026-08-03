import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadinessAssessmentResults } from "@/components/assessment/ReadinessAssessmentResults";
import {
  computeReadinessScores,
  readinessBandLabels,
  readinessFoundationLabels,
  readinessReviewStatusLabels,
  type ReadinessFoundationId,
  type ReadinessResponses,
  type ReadinessReviewStatus,
} from "@/content/readinessAssessment";
import { siteConfig } from "@/lib/constants";
import { formatDashboardDate } from "@/lib/dashboard/constants";
import { saveAdminReadinessReview } from "@/lib/dashboard/readinessAssessmentActions";
import {
  getAdminClientBundle,
  getClientReadinessAssessment,
  getClientReadinessAssessmentHistory,
} from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

const publicReadinessPath = "/addiction-healing-readiness-assessment/";
const publicReadinessUrl = `${siteConfig.siteUrl.replace(/\/$/, "")}${publicReadinessPath}`;

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notesSaved?: string; error?: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return createMetadata({
    title: "Client readiness | Admin",
    description: "Client Addiction Healing Readiness Assessment responses.",
    path: `/admin/clients/${id}/readiness/`,
    noIndex: true,
  });
}

export default async function AdminClientReadinessPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { notesSaved, error } = await searchParams;
  const bundle = await getAdminClientBundle(id);
  if (!bundle) notFound();

  const assessment = await getClientReadinessAssessment(id);
  const history = await getClientReadinessAssessmentHistory(id);
  const responses = (assessment?.responses ?? {}) as ReadinessResponses;
  const scores = assessment
    ? {
        ...computeReadinessScores(responses),
        commitment: Number(assessment.commitment_score),
        self_awareness: Number(assessment.self_awareness_score),
        emotional_capacity: Number(assessment.emotional_capacity_score),
        readinessProduct: Number(assessment.readiness_product),
        readinessIndex: Number(assessment.readiness_index ?? computeReadinessScores(responses).readinessIndex),
        readinessBand: assessment.readiness_band,
        focusAreas: assessment.focus_areas as ReadinessFoundationId[],
      }
    : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Readiness assessment</p>
        <h1>Addiction Healing Readiness Assessment</h1>
        <p>
          {bundle.profile?.full_name ?? "Client"} — review commitment, self-awareness, and emotional capacity scores
          before intensive programme work.
        </p>
      </section>

      <div className="dashboard-quick-links">
        <Link href={`/admin/clients/${id}/`} className="button button-secondary">
          Client profile
        </Link>
        <Link href={`/admin/clients/${id}/intake/`} className="button button-secondary">
          Intake
        </Link>
        <Link href={`/admin/clients/${id}/consultation/`} className="button button-secondary">
          Consultation
        </Link>
        <Link href={`/admin/clients/${id}/programme/`} className="button button-secondary">
          Programme
        </Link>
      </div>

      {notesSaved ? <p className="dashboard-inline-note dashboard-success-note">Review notes saved.</p> : null}
      {error ? <p className="dashboard-inline-note dashboard-error-note">Unable to save review notes.</p> : null}

      <section className="dashboard-panel">
        {!assessment || !scores ? (
          <div className="dashboard-stack">
            <p className="dashboard-empty">
              This client has not completed the Addiction Healing Readiness Assessment yet.
            </p>
            <p>
              Send them this public page (wizard + sign-up before results):
            </p>
            <p>
              <a href={publicReadinessUrl} target="_blank" rel="noreferrer">
                {publicReadinessUrl}
              </a>
            </p>
            <div className="dashboard-quick-links">
              <Link href={publicReadinessPath} className="button button-primary" target="_blank">
                Open public assessment
              </Link>
            </div>
          </div>
        ) : (
          <>
            <p className="dashboard-inline-note">
              {assessment.completed_at ? (
                <>
                  <span className="status-badge status-badge-intake-complete">Completed</span>{" "}
                  {formatDashboardDate(assessment.completed_at)} · Band:{" "}
                  <strong>{readinessBandLabels[assessment.readiness_band]}</strong> · Review:{" "}
                  <strong>{readinessReviewStatusLabels[assessment.review_status]}</strong>
                  {assessment.privacy_consent_at ? " · Client consented to review/storage" : null}
                </>
              ) : (
                <>
                  <span className="status-badge status-badge-intake-in-progress">In progress</span> Last updated{" "}
                  {formatDashboardDate(assessment.updated_at)}
                </>
              )}
            </p>
            <ReadinessAssessmentResults
              responses={responses}
              scores={scores}
              history={history.map((item) => ({
                id: item.id,
                completed_at: item.completed_at,
                readiness_index: item.readiness_index,
                readiness_band: item.readiness_band,
                attempt_number: item.attempt_number,
              }))}
            />
          </>
        )}
      </section>

      {assessment?.completed_at ? (
        <section className="dashboard-panel">
          <h2>Practitioner review</h2>
          <p className="dashboard-inline-note">
            Client answers are read-only. Use this section for private clinical notes and follow-up planning.
          </p>
          <form action={saveAdminReadinessReview} className="dashboard-form">
            <input type="hidden" name="clientProfileId" value={id} />
            <input type="hidden" name="assessmentId" value={assessment.id} />
            <label className="form-field">
              <span>Review status</span>
              <select name="reviewStatus" defaultValue={assessment.review_status}>
                {(Object.keys(readinessReviewStatusLabels) as ReadinessReviewStatus[]).map((status) => (
                  <option key={status} value={status}>
                    {readinessReviewStatusLabels[status]}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>Recommended first focus</span>
              <select name="recommendedFocus" defaultValue={assessment.recommended_focus ?? ""}>
                <option value="">Select focus</option>
                {(Object.keys(readinessFoundationLabels) as ReadinessFoundationId[]).map((focus) => (
                  <option key={focus} value={focus}>
                    {readinessFoundationLabels[focus]}
                  </option>
                ))}
                <option value="programme_enquiry">Programme enquiry</option>
                <option value="urgent_safety">Urgent safety first</option>
              </select>
            </label>
            <label className="form-field">
              <span>Follow-up date</span>
              <input type="date" name="followUpOn" defaultValue={assessment.follow_up_on ?? ""} />
            </label>
            <label className="form-field">
              <span>Private practitioner notes</span>
              <textarea name="practitionerNotes" rows={6} defaultValue={assessment.practitioner_notes ?? ""} />
            </label>
            <button type="submit" className="button button-primary">
              Save review
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
