import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Admin Sign In | Healing From Your Addiction",
  description: "Sign in to the private admin dashboard.",
  path: "/admin/login/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ saved?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { saved } = await searchParams;
  const notice = saved ? "Your password was saved. Sign in below with your new password." : null;

  return (
    <div className="auth-page">
      <LoginForm
        portal="admin"
        title="Admin sign in"
        description="Sign in to manage leads, notes, and client invitations."
        redirectTo="/admin/"
        notice={notice}
      />
    </div>
  );
}
