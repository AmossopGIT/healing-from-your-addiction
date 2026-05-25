import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { programmes } from "@/content/programmes";
import { contactMethods } from "@/lib/constants";
import { dashboardFieldMaxLengths } from "@/lib/dashboard/formValidation";
import { completePortalOnboarding } from "@/lib/dashboard/portalActions";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import { createMetadata } from "@/lib/seo";
import { getClientPortalState } from "@/lib/supabase/auth";

export const metadata: Metadata = createMetadata({
  title: "Complete Your Profile | Client Portal",
  description: "Complete your client portal profile.",
  path: "/portal/onboarding/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

const onboardingErrorMessages: Record<string, string> = {
  "invalid-name": "Please enter your full name.",
  "invalid-phone": "Please enter a valid phone or WhatsApp number.",
  "invalid-contact-method": "Please choose a valid preferred contact method.",
  "invalid-programme": "Please choose the support focus that fits you best.",
  "invalid-emergency-contact": "Please shorten the emergency contact details.",
};

export default async function PortalOnboardingPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const { profile, clientProfile, onboardingComplete } = await getClientPortalState();

  if (onboardingComplete) {
    redirect("/portal/");
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">Client portal</p>
        <h1>Complete your profile</h1>
        <p className="auth-description">Before you use the portal, tell us a few basics so your private profile is complete.</p>
        {error ? <p className="form-error">{onboardingErrorMessages[error] ?? "Unable to save your profile."}</p> : null}
        <form className="auth-form" action={completePortalOnboarding}>
          <label className="form-field">
            <span>Full name</span>
            <input
              name="fullName"
              required
              minLength={2}
              maxLength={leadFieldMaxLengths.fullName}
              defaultValue={profile.full_name ?? ""}
            />
          </label>
          <label className="form-field">
            <span>Phone / WhatsApp number</span>
            <input
              name="phone"
              required
              minLength={6}
              maxLength={leadFieldMaxLengths.phone}
              pattern="[0-9+()\-\s]{6,32}"
              title="Use 6 to 32 characters: digits, spaces, parentheses, plus, and hyphens."
              defaultValue={profile.phone ?? ""}
            />
          </label>
          <label className="form-field">
            <span>Preferred contact method</span>
            <select name="preferredContactMethod" required defaultValue={clientProfile?.preferred_contact_method ?? ""}>
              <option value="">Select method</option>
              {contactMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Main support focus</span>
            <select name="addictionSlug" required defaultValue={clientProfile?.addiction_slug ?? ""}>
              <option value="">Select a focus</option>
              {programmes.map((programme) => (
                <option key={programme.slug} value={programme.slug}>
                  {programme.title}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field">
            <span>Emergency contact (optional)</span>
            <input
              name="emergencyContact"
              maxLength={dashboardFieldMaxLengths.emergencyContact}
              defaultValue={clientProfile?.emergency_contact ?? ""}
            />
          </label>
          <button type="submit" className="button button-primary form-submit">
            Save and continue
          </button>
        </form>
      </div>
    </div>
  );
}
