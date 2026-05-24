import type { Metadata } from "next";
import { getAuthProfile } from "@/lib/supabase/auth";
import { getClientEnrollmentBundle } from "@/lib/dashboard/queries";
import { standardDisclaimer } from "@/lib/constants";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Client Portal | Healing From Your Addiction",
  description: "Private client portal.",
  path: "/portal/",
  noIndex: true,
});

export default async function PortalHomePage() {
  const profile = await getAuthProfile();
  const bundle = profile ? await getClientEnrollmentBundle(profile.id) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Welcome</p>
        <h1>Hello{profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}</h1>
        <p>This is your private space for programme materials, progress, and secure messages.</p>
      </section>
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
