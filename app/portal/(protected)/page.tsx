import type { Metadata } from "next";
import Link from "next/link";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle, getClientIntakeSubmission } from "@/lib/dashboard/queries";
import { standardDisclaimer } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Client Portal | Healing From Your Addiction",
  description: "Private client portal.",
  path: "/portal/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ onboarded?: string }>;
};

export default async function PortalHomePage({ searchParams }: PageProps) {
  const { onboarded } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const [bundle, intakeSubmission] = await Promise.all([
    profile ? getClientEnrollmentBundle(profile.id) : Promise.resolve(null),
    clientProfile ? getClientIntakeSubmission(clientProfile.id) : Promise.resolve(null),
  ]);

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Welcome</p>
        <h1>Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
        <p>This is your private space for programme materials, progress, and secure messages.</p>
        {onboarded ? (
          <p className="dashboard-inline-note">
            Your profile is complete and your portal is ready.{" "}
            <Link href="/portal/account/">View your profile</Link>
          </p>
        ) : null}
      </section>
      {!intakeSubmission?.completed_at && clientProfile?.addiction_slug ? (
        <section className="dashboard-panel dashboard-panel-highlight">
          <h2>Complete your intake</h2>
          <p>
            {intakeSubmission
              ? "You have started your pre-programme questions. Finish and submit them before your intake conversation."
              : "Please answer your pre-programme intake questions before your intake conversation with Gerald."}
          </p>
          <p>
            <Link href="/portal/intake/" className="button button-primary button-small">
              {intakeSubmission ? "Continue intake" : "Start intake"}
            </Link>
          </p>
        </section>
      ) : null}
      <section className="dashboard-panel">
        <h2>Programme status</h2>
        {bundle?.enrollment ? (
          <p>
            You are enrolled in <strong>{bundle.template?.title}</strong>. Visit your programme to view available sessions.
          </p>
        ) : (
          <p>Your programme will appear here once Gerald assigns it after your intake conversation.</p>
        )}
      </section>
      <section className="dashboard-panel dashboard-disclaimer">
        <p>{standardDisclaimer}</p>
      </section>
    </div>
  );
}
