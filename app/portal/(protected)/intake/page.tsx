import type { Metadata } from "next";
import { IntakeForm } from "@/components/dashboard/IntakeForm";
import { getIntakeQuestionSetForAddiction } from "@/lib/intake/questions";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { getClientIntakeSubmission } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Intake | Client Portal",
  description: "Pre-programme intake questions.",
  path: "/portal/intake/",
  noIndex: true,
});

const intakeErrorMessages: Record<string, string> = {
  "missing-focus": "Intake questions will appear once your programme focus is assigned.",
  "invalid-questions": "Your intake questions could not be loaded. Please contact Gerald.",
  "response-too-long": "One or more answers were too long. Please shorten them and try again.",
  "already-completed": "Your intake has already been submitted.",
  incomplete: "Please answer every question before submitting.",
  "save-failed": "Unable to save your intake right now. Please try again.",
};

type PageProps = {
  searchParams: Promise<{ saved?: string; completed?: string; error?: string }>;
};

export default async function PortalIntakePage({ searchParams }: PageProps) {
  const { saved, completed, error } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const addictionSlug = clientProfile?.addiction_slug;
  const questionSet = addictionSlug ? getIntakeQuestionSetForAddiction(addictionSlug) : null;
  const submission = clientProfile ? await getClientIntakeSubmission(clientProfile.id) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Intake</p>
        <h1>Pre-programme questions</h1>
        <p>
          {submission?.completed_at
            ? "Thank you — your intake responses have been submitted. Gerald will review them before your intake conversation."
            : "Answer these questions before your intake conversation. You can save your progress and return anytime."}
        </p>
      </section>

      {saved ? (
        <p className="dashboard-inline-note dashboard-success-note">
          Progress saved — you can leave and continue later.
        </p>
      ) : null}
      {completed ? <p className="dashboard-inline-note dashboard-success-note">Your intake has been submitted successfully.</p> : null}
      {error ? <p className="form-error">{intakeErrorMessages[error] ?? "Unable to save your intake."}</p> : null}

      <section className="dashboard-panel">
        {questionSet ? (
          <IntakeForm questionSet={questionSet} submission={submission} />
        ) : (
          <p className="dashboard-empty">Intake questions will appear once your programme focus is assigned.</p>
        )}
      </section>
    </div>
  );
}
