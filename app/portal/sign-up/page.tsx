import type { Metadata } from "next";
import { SignupForm } from "@/components/dashboard/SignupForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Create Portal Account | Healing From Your Addiction",
  description: "Create a private client portal account.",
  path: "/portal/sign-up/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

function sanitizeNextPath(value: string | undefined) {
  if (!value) return "/portal/onboarding/";
  if (!value.startsWith("/") || value.startsWith("//") || !value.startsWith("/portal/")) {
    return "/portal/onboarding/";
  }
  return value.slice(0, 240);
}

export default async function PortalSignupPage({ searchParams }: PageProps) {
  const { next } = await searchParams;
  const nextPath = sanitizeNextPath(next);

  return (
    <div className="auth-page">
      <SignupForm nextPath={nextPath} />
    </div>
  );
}
