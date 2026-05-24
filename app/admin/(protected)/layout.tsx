import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { adminNavItems } from "@/lib/dashboard/constants";
import { requireAuthProfile } from "@/lib/supabase/auth";

export default async function AdminProtectedLayout({ children }: { children: ReactNode }) {
  await requireAuthProfile("admin");

  return (
    <DashboardShell
      title="Admin dashboard"
      subtitle="Lead, client, and content management"
      navItems={adminNavItems}
      variant="admin"
    >
      {children}
    </DashboardShell>
  );
}
