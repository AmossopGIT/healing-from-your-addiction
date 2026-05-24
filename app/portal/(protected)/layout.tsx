import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { portalNavItems } from "@/lib/dashboard/constants";
import { requireAuthProfile } from "@/lib/supabase/auth";

export default async function PortalProtectedLayout({ children }: { children: ReactNode }) {
  await requireAuthProfile("client");

  return (
    <DashboardShell
      title="Client portal"
      subtitle="Your private programme space"
      navItems={portalNavItems}
      variant="portal"
    >
      {children}
    </DashboardShell>
  );
}
