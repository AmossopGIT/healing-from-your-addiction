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
  searchParams: Promise<{ error?: string; saved?: string; next?: string }>;
};

const loginErrorMessages: Record<string, string> = {
  "invalid-link": "The sign-in link is invalid or has expired. Please sign in again.",
};

function sanitizeNextPath(value: string | undefined) {
  if (!value) return "/portal/";
  if (!value.startsWith("/") || value.startsWith("//") || !value.startsWith("/portal/")) {
    return "/portal/";
  }
  return value.slice(0, 240);
}

export default async function PortalLoginPage({ searchParams }: PageProps) {
  const { error, saved, next } = await searchParams;
  const redirectTo = sanitizeNextPath(next);
  const readinessResume = redirectTo.includes("/portal/readiness/");
  const notice = saved
    ? "Your password was saved. Sign in below with your new password."
    : error
      ? loginErrorMessages[error] ?? decodeURIComponent(error)
      : null;
  const helperText =
    saved || error
      ? null
      : readinessResume
        ? "Sign in with your client portal email. Your readiness assessment will save to your profile so you can see results."
        : "Invited by Gerald? Open the invitation email and tap Accept invitation to set your password first. If the link expired, use Forgot your password.";

  return (
    <div className="auth-page">
      <LoginForm
        portal="client"
        title={readinessResume ? "Sign in to see your results" : "Client portal sign in"}
        description={
          readinessResume
            ? "Use your existing client account to save the assessment and unlock your private results."
            : "Sign in to view your programme, resources, and secure messages."
        }
        redirectTo={redirectTo}
        showClientLinks
        notice={notice}
        helperText={helperText}
        hideAdminLink={readinessResume}
      />
    </div>
  );
}
