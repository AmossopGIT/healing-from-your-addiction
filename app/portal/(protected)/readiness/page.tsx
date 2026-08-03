import type { Metadata } from "next";
import { ReadinessAssessmentWizard } from "@/components/assessment/ReadinessAssessmentWizard";
import type { ReadinessResponses } from "@/content/readinessAssessment";
import { getClientReadinessAssessment, getClientReadinessAssessmentHistory } from "@/lib/dashboard/queries";
import { ensureMinimalClientProfileAction } from "@/lib/dashboard/readinessAssessmentActions";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createMetadata({
  title: "Readiness Assessment | Client Portal",
  description: "Your Addiction Healing Readiness Assessment.",
  path: "/portal/readiness/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{
    resume?: string;
    completed?: string;
    saved?: string;
    error?: string;
    onboarded?: string;
    draft?: string;
  }>;
};

const readinessErrorMessages: Record<string, string> = {
  incomplete: "Please complete every question before submitting.",
  "invalid-responses": "Your assessment answers could not be read. Please try again.",
  "response-too-long": "One or more answers were too long. Please shorten them and try again.",
  "save-failed": "Unable to save your assessment right now. Please try again.",
  "draft-expired": "Your recoverable draft has expired. Please complete the assessment again.",
};

export default async function PortalReadinessPage({ searchParams }: PageProps) {
  const { resume, completed, saved, error, onboarded, draft } = await searchParams;
  const profile = await getAuthProfile();
  if (profile?.role === "client") {
    await ensureMinimalClientProfileAction();
  }
  const clientProfile = profile?.role === "client" ? await getClientProfileForUser(profile.id) : null;
  const assessment = clientProfile ? await getClientReadinessAssessment(clientProfile.id) : null;
  const history = clientProfile ? await getClientReadinessAssessmentHistory(clientProfile.id) : [];
  const initialResponses = (assessment?.responses ?? {}) as ReadinessResponses;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Readiness</p>
        <h1>Addiction Healing Readiness Assessment</h1>
        <p>
          Take this here in your portal or on the public readiness page. Reflect on commitment, self-awareness, and
          emotional capacity — your saved assessment becomes part of your private profile for Gerald to review with you.
        </p>
      </section>

      {onboarded ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Your profile basics are ready. We can now save your readiness assessment.
        </p>
      ) : null}
      {completed ? (
        <p className="dashboard-inline-note dashboard-success-note">Your readiness assessment has been saved.</p>
      ) : null}
      {saved ? <p className="dashboard-inline-note dashboard-success-note">Progress saved.</p> : null}
      {error ? <p className="form-error">{readinessErrorMessages[error] ?? "Unable to save your assessment."}</p> : null}
      {draft ? <p className="dashboard-inline-note">Resuming your recoverable draft…</p> : null}

      <ReadinessAssessmentWizard
        isAuthenticatedClient={profile?.role === "client"}
        mode="portal"
        resumeDraft={resume === "1" || Boolean(onboarded) || Boolean(draft)}
        draftTokenFromUrl={draft ?? ""}
        initialResponses={initialResponses}
        initialCompleted={Boolean(assessment?.completed_at)}
        history={history.map((item) => ({
          id: item.id,
          completed_at: item.completed_at,
          readiness_index: item.readiness_index,
          readiness_band: item.readiness_band,
          attempt_number: item.attempt_number,
        }))}
      />
    </div>
  );
}
