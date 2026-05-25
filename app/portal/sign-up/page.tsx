import type { Metadata } from "next";
import { SignupForm } from "@/components/dashboard/SignupForm";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Create Portal Account | Healing From Your Addiction",
  description: "Create a private client portal account.",
  path: "/portal/sign-up/",
  noIndex: true,
});

export default function PortalSignupPage() {
  return (
    <div className="auth-page">
      <SignupForm />
    </div>
  );
}
