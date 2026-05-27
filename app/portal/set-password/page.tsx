import type { Metadata } from "next";
import { Suspense } from "react";
import { EstablishAuthSession } from "@/components/dashboard/EstablishAuthSession";
import { SetPasswordForm } from "@/components/dashboard/SetPasswordForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Set Password | Client Portal",
  description: "Set your client portal password.",
  path: "/portal/set-password/",
  noIndex: true,
});

export default function PortalSetPasswordPage() {
  return (
    <div className="auth-page">
      <Suspense
        fallback={
          <div className="auth-card">
            <p className="eyebrow">Client portal</p>
            <h1>Verifying your link</h1>
            <p className="auth-description">Please wait while we confirm your secure sign-in link.</p>
          </div>
        }
      >
        <EstablishAuthSession successPath="/portal/set-password/">
          <SetPasswordForm />
        </EstablishAuthSession>
      </Suspense>
    </div>
  );
}
