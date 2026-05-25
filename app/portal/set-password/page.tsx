import type { Metadata } from "next";
import { SetPasswordForm } from "@/components/dashboard/SetPasswordForm";
import { createMetadata } from "@/lib/seo";
import { requireClientPortalAccess } from "@/lib/supabase/auth";

export const metadata: Metadata = createMetadata({
  title: "Set Password | Client Portal",
  description: "Set your client portal password.",
  path: "/portal/set-password/",
  noIndex: true,
});

export default async function PortalSetPasswordPage() {
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true" && process.env.GITHUB_PAGES !== "true") {
    await requireClientPortalAccess({ allowIncomplete: true });
  }

  return (
    <div className="auth-page">
      <SetPasswordForm />
    </div>
  );
}
