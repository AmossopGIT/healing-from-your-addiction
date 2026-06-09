import type { Metadata } from "next";
import { contactMethods } from "@/lib/constants";
import { programmeBySlug } from "@/content/programmes";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { updateClientAccount } from "@/lib/dashboard/portalActions";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { getAuthProfile, getClientProfileForUser } from "@/lib/supabase/auth";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Account | Client Portal",
  description: "Update your account details.",
  path: "/portal/account/",
  noIndex: true,
});

type PageProps = { searchParams: Promise<{ saved?: string; error?: string }> };

const accountErrorMessages: Record<string, string> = {
  "invalid-phone": "Please enter a valid phone or WhatsApp number.",
  "invalid-contact-method": "Please select a valid preferred contact method.",
  "invalid-emergency-contact": "Please shorten the emergency contact details.",
};

export default async function PortalAccountPage({ searchParams }: PageProps) {
  const { saved, error } = await searchParams;
  const profile = await getAuthProfile();
  const clientProfile = profile ? await getClientProfileForUser(profile.id) : null;
  const supportFocus = clientProfile?.addiction_slug
    ? programmeBySlug.get(clientProfile.addiction_slug)?.title ?? clientProfile.addiction_slug
    : null;

  return (
    <div className="dashboard-stack">
      <section className="dashboard-page-header">
        <p className="eyebrow">Account</p>
        <h1>Your profile</h1>
        {saved ? <p className="dashboard-inline-note">Your details were saved.</p> : null}
        {error ? <p className="form-error" role="alert">{accountErrorMessages[error] ?? "Unable to save those details."}</p> : null}
      </section>
      <section className="dashboard-panel">
        <h2>Profile summary</h2>
        <dl className="dashboard-dl">
          <div><dt>Full name</dt><dd>{profile?.full_name ?? "—"}</dd></div>
          <div><dt>Main support focus</dt><dd>{supportFocus ?? "—"}</dd></div>
        </dl>
      </section>
      <section className="dashboard-panel">
        <h2>Contact details</h2>
        <form action={updateClientAccount} className="dashboard-form">
          <label className="form-field"><span>Email</span><input value={profile?.email ?? ""} disabled /></label>
          <label className="form-field">
            <span>Phone</span>
            <input
              name="phone"
              defaultValue={profile?.phone ?? ""}
              maxLength={leadFieldMaxLengths.phone}
              pattern="[0-9+()\-\s]{6,32}"
              title="Use 6 to 32 characters: digits, spaces, parentheses, plus, and hyphens."
            />
          </label>
          <label className="form-field">
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" defaultValue={clientProfile?.preferred_contact_method ?? ""}>
              <option value="">Select method</option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Emergency contact (optional)</span>
            <input
              name="emergencyContact"
              defaultValue={clientProfile?.emergency_contact ?? ""}
              maxLength={dashboardFieldMaxLengths.emergencyContact}
            />
          </label>
          <button type="submit" className="button button-primary">Save changes</button>
        </form>
      </section>
    </div>
  );
}
