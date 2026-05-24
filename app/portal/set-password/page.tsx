import type { Metadata } from "next";
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
      <SetPasswordForm />
    </div>
  );
}
