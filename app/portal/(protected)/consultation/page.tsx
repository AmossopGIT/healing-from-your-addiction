import type { Metadata } from "next";
import { ConsultationWizard } from "@/components/dashboard/ConsultationWizard";
import { ensureClientConsultation } from "@/lib/dashboard/queries";
import { createMetadata } from "@/lib/seo";
import { getAuthProfile, getClientProfileForUser, requireClientPortalAccess } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = createMetadata({
  title: "Consultation | Client Portal",
  description: "Hypnotherapy consultation and informed consent form.",
  path: "/portal/consultation/",
  noIndex: true,
});

export const dynamic = "force-dynamic";

const consultationErrorMessages: Record<string, string> = {
  "missing-file": "Please choose a file before uploading.",
  "file-too-large": "Please upload a file smaller than 15 MB.",
  "invalid-file-type": "Please upload a PDF or image (JPG/PNG).",
  "upload-failed": "Unable to upload your file right now. Please try again.",
  "save-failed": "Unable to save your consultation right now. Please try again.",
};

type PageProps = {
  searchParams: Promise<{ error?: string; uploaded?: string }>;
};

export default async function PortalConsultationPage({ searchParams }: PageProps) {
  await requireClientPortalAccess();
  const { error, uploaded } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;

  if (!clientProfile) {
    return (
      <div className="dashboard-stack">
        <section className="dashboard-page-header">
          <p className="eyebrow">Consultation</p>
          <h1>Consultation form</h1>
          <p>Your client profile is still being prepared.</p>
        </section>
      </div>
    );
  }

  const consultation = await ensureClientConsultation(clientProfile.id);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Before therapy</p>
        <h1>Hypnotherapy consultation</h1>
        <p>
          Complete this form before hypnosis or EFT sessions begin. You can save progress, download a blank PDF, or upload a
          completed copy.
        </p>
      </section>

      {uploaded ? (
        <p className="dashboard-inline-note dashboard-success-note">Your completed form was uploaded successfully.</p>
      ) : null}
      {error ? <p className="form-error">{consultationErrorMessages[error] ?? "Unable to process your request."}</p> : null}

      <section className="dashboard-panel">
        {consultation ? (
          <ConsultationWizard
            consultation={consultation}
            clientName={profile?.full_name ?? ""}
            clientEmail={user?.email ?? ""}
          />
        ) : (
          <p className="dashboard-empty">Unable to open your consultation form right now. Please try again shortly.</p>
        )}
      </section>
    </div>
  );
}
