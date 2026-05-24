import type { Metadata } from "next";
import { contactMethods } from "@/lib/constants";
import { updateClientAccount } from "@/lib/dashboard/portalActions";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Account | Client Portal",
  description: "Update your account details.",
  path: "/portal/account/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ saved?: string }> };

export default async function PortalAccountPage({ searchParams }: PageProps) {
  const { saved } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Account</p>
        <h1>Your details</h1>
        {saved ? <p className="dashboard-inline-note">Your details were saved.</p> : null}
      </section>
      <section className="dashboard-panel">
        <form action={updateClientAccount} className="dashboard-form">
          <label className="form-field"><span>Email</span><input value={profile?.email ?? ""} disabled /></label>
          <label className="form-field"><span>Phone</span><input name="phone" defaultValue={profile?.phone ?? ""} /></label>
          <label className="form-field">
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue={clientProfile?.preferred_contact_method ?? ""}>
              <option value="">Select method</option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </label>
          <label className="form-field"><span>Emergency contact (optional)</span><input name="emergencyContact" defaultValue={clientProfile?.emergency_contact ?? ""} /></label>
          <button type="submit" className="button button-primary">Save changes</button>
        </form>
      </section>
    </div>
  );
}
