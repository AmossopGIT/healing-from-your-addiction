import type { Metadata } from "next";
import Link from "next/link";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Check Your Email | Client Portal",
  description: "Check your email for the next client portal step.",
  path: "/portal/check-email/",
  noIndex: true,
});

type PageProps = {
  searchParams: Promise<{ mode?: string; portal?: string }>;
};

const pageCopy = {
  signup: {
    title: "Check your email",
    description: "We sent a verification link to your email address. Open it to activate your account and finish your portal profile.",
  },
  recovery: {
    title: "Check your email",
    description: "We sent a password reset link to your email address. Open it to choose a new password.",
  },
} as const;

export default async function PortalCheckEmailPage({ searchParams }: PageProps) {
  const { mode, portal } = await searchParams;
  const content = mode === "recovery" ? pageCopy.recovery : pageCopy.signup;
  const isAdmin = portal === "admin";
  const signInHref = isAdmin ? "/admin/login/" : "/portal/login/";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="eyebrow">{isAdmin ? "Private access" : "Client portal"}</p>
        <h1>{content.title}</h1>
        <p className="auth-description">{content.description}</p>
        <p className="auth-description">
          Once you are done, return to <Link href={signInHref}>sign in</Link>.
        </p>
      </div>
    </div>
  );
}
