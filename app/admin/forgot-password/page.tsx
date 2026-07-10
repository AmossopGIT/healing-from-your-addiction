import type { Metadata } from "next";
import { PasswordRecoveryForm } from "@/components/dashboard/PasswordRecoveryForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Reset Admin Password | Healing From Your Addiction",
  description: "Reset your admin dashboard password.",
  path: "/admin/forgot-password/",
  noIndex: true,
});

export default function AdminForgotPasswordPage() {
  return (
    <div className="auth-page">
      <PasswordRecoveryForm portal="admin" />
    </div>
  );
}
