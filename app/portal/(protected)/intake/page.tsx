import type { Metadata } from "next";
import { SessionContent } from "@/components/dashboard/SessionContent";
import { getCaseStudiesByAddiction } from "@/content/caseStudies";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Intake | Client Portal",
  description: "Pre-programme intake questions.",
  path: "/portal/intake/",
  noIndex: true,
});

export default async function PortalIntakePage() {
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const addictionSlug = clientProfile?.addiction_slug;
  const intakeStudy = addictionSlug
    ? getCaseStudiesByAddiction(addictionSlug).find((study) => study.caseStudyType === "questions")
    : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Intake</p>
        <h1>Pre-programme questions</h1>
        <p>Review these questions before your intake conversation. You can reflect on them privately here.</p>
      </section>
      <section className="dashboard-panel">
        {intakeStudy ? (
          <SessionContent contentRef={intakeStudy.slug} contentType="questions" />
        ) : (
          <p className="dashboard-empty">Intake questions will appear once your programme focus is assigned.</p>
        )}
      </section>
    </div>
  );
}
