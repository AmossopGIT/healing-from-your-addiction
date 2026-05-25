import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/dashboard/PasswordRecoveryForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Reset Client Portal Password | Healing From Your Addiction",
  description: "Reset your client portal password.",
  path: "/portal/forgot-password/",
  noIndex: true,
});

export default function PortalForgotPasswordPage() {
  return (
    <div className="auth-page">
      <PasswordRecoveryForm />
    </div>
  );
}
