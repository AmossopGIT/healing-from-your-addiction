import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SkipLink } from "@/components/SkipLink";
import { adminMobileNavItems, adminNavItems } from "@/lib/dashboard/constants";
import { requireAuthProfile } from "@/lib/supabase/auth";

// Admin uses cookies/auth — never statically prerender these routes (avoids DYNAMIC_SERVER_USAGE 500s).
export const dynamic = "force-dynamic";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  const profile =
    process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true" && process.env.GITHUB_PAGES !== "true"
      ? await requireAuthProfile("admin")
      : null;

  return (
    <>
      <SkipLink />
      <DashboardShell
        title="Admin dashboard"
        subtitle="Lead, client, and content management"
        navItems={adminNavItems}
        mobileNavItems={adminMobileNavItems}
        variant="admin"
        currentProfile={profile}
      >
        {children}
      </DashboardShell>
    </>
  );
}
