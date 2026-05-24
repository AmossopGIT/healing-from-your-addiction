import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Sign In | Healing From Your Addiction",
  description: "Sign in to the private admin dashboard.",
  path: "/admin/login/",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <div className="auth-page">
      <LoginForm
        title="Admin sign in"
        description="Sign in to manage leads, notes, and client invitations."
        redirectTo="/admin/"
      />
    </div>
  );
}
