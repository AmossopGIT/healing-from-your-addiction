import type { ReactNode } from "react";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SkipLink } from "@/components/SkipLink";
import { portalNavItems } from "@/lib/dashboard/constants";
import { requireClientPortalAccess } from "@/lib/supabase/auth";

export default async function PortalProtectedLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-current-path") ?? "/portal/";
  const allowIncomplete = currentPath.startsWith("/portal/readiness/");

  const portalState =
    process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true" && process.env.GITHUB_PAGES !== "true"
      ? await requireClientPortalAccess({ allowIncomplete })
      : null;

  return (
    <>
      <SkipLink />
      <DashboardShell
        title="Client portal"
        subtitle="Your private programme space"
        navItems={portalNavItems}
        variant="portal"
        currentProfile={portalState?.profile ?? null}
      >
        {children}
      </DashboardShell>
    </>
  );
}
