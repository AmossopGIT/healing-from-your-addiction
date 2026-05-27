import type { Metadata } from "next";
import { LoginForm } from "@/components/dashboard/LoginForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Client Portal Sign In",
  description: "Sign in to your private client portal.",
  path: "/portal/login/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ error?: string; saved?: string }>;
};

const loginErrorMessages: Record<string, string> = {
  "invalid-link": "The sign-in link is invalid or has expired. Please sign in again.",
};

export default async function PortalLoginPage({ searchParams }: PageProps) {
  const { error, saved } = await searchParams;
  const notice = saved
    ? "Your password was saved. Sign in below with your new password."
    : error
      ? loginErrorMessages[error] ?? decodeURIComponent(error)
      : null;

  return (
    <div className="auth-page">
      <LoginForm
        title="Client portal sign in"
        description="Sign in to view your programme, resources, and secure messages."
        redirectTo="/portal/"
        showClientLinks
        notice={notice}
      />
    </div>
  );
}
