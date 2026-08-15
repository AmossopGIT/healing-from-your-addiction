import type { ReactNode } from "react";
import { headers } from "next/headers";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { SkipLink } from "@/components/SkipLink";
import { portalNavItems, resolvePortalMobileNavItems } from "@/lib/dashboard/constants";
import { getClientEnrollmentBundle, getClientIntakeSubmission } from "@/lib/dashboard/queries";
import { resolvePortalHomeStage } from "@/lib/portal/homeState";
import { requireClientPortalAccess } from "@/lib/supabase/auth";

export default async function PortalProtectedLayout({ children }: { children: ReactNode }) {
  const requestHeaders = await headers();
  const currentPath = requestHeaders.get("x-current-path") ?? "/portal/";
  const allowIncomplete = currentPath.startsWith("/portal/readiness/");

  const portalState =
    process.env.NEXT_PUBLIC_STATIC_EXPORT !== "true" && process.env.GITHUB_PAGES !== "true"
      ? await requireClientPortalAccess({ allowIncomplete })
      : null;

  let mobileNavItems = portalNavItems;
  if (portalState?.profile?.id) {
    const [enrollmentBundle, intakeSubmission] = await Promise.all([
      getClientEnrollmentBundle(portalState.profile.id),
      portalState.clientProfile
        ? getClientIntakeSubmission(portalState.clientProfile.id)
        : Promise.resolve(null),
    ]);
    const progressBySessionId = new Map(
      (enrollmentBundle?.progress ?? []).map((item) => [item.session_id, item]),
    );
    const stage = resolvePortalHomeStage({
      clientProfile: portalState.clientProfile ?? enrollmentBundle?.clientProfile ?? null,
      intakeCompleted: Boolean(intakeSubmission?.completed_at),
      enrollment: enrollmentBundle?.enrollment ?? null,
      sessions: enrollmentBundle?.sessions ?? [],
      progressBySessionId,
    });
    mobileNavItems = resolvePortalMobileNavItems(stage);
  }

  return (
    <>
      <SkipLink />
      <DashboardShell
        title="Client portal"
        subtitle="Your private programme space"
        navItems={portalNavItems}
        mobileNavItems={mobileNavItems}
        variant="portal"
        currentProfile={portalState?.profile ?? null}
      >
        {children}
      </DashboardShell>
    </>
  );
}
