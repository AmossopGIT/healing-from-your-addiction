import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Client Portal Sign In",
  description: "Sign in to your private client portal.",
  path: "/portal/login/",
  noIndex: true,
});

export default function PortalLoginPage() {
  return (
    <div className="auth-page">
      <LoginForm
        title="Client portal sign in"
        description="Sign in to view your programme, resources, and secure messages."
        redirectTo="/portal/"
      />
    </div>
  );
}
