import type { ReactNode } from "react";
import { DashboardMobileTables } from "@/components/dashboard/DashboardMobileTables";
import { DashboardNav } from "@/components/dashboard/DashboardNav";
import { PortalNotificationBell } from "@/components/dashboard/PortalNotificationBell";
import type { AdminNavSection, DashboardNavItem } from "@/lib/dashboard/constants";
import { getPortalNotificationSummary } from "@/lib/dashboard/queries";
import type { AuthProfile } from "@/lib/supabase/auth";

type DashboardShellProps = {
  title: string;
  subtitle: string;
  navItems?: DashboardNavItem[];
  navSections?: AdminNavSection[];
  /** Optional shorter nav for sticky mobile bar. Defaults to navItems or flattened sections. */
  mobileNavItems?: DashboardNavItem[];
  children: ReactNode;
  variant: "admin" | "portal";
  currentProfile?: AuthProfile | null;
};

function SignOutButton() {
  return (
    <form action="/api/auth/signout/" method="post">
      <button type="submit" className="dashboard-signout">
        Sign out
      </button>
    </form>
  );
}

export async function DashboardShell({
  title,
  subtitle,
  navItems,
  navSections,
  mobileNavItems,
  children,
  variant,
  currentProfile = null,
}: DashboardShellProps) {
  const notificationSummary =
    variant === "portal" && currentProfile?.id
      ? await getPortalNotificationSummary(currentProfile.id)
      : null;
  const mobileItems = mobileNavItems ?? navItems;
  const surfaceLabel = variant === "admin" ? "Admin workspace" : "Private client portal";

  return (
    <div className={`dashboard-shell dashboard-shell-${variant}`}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
          <p className="dashboard-brand-title">{title}</p>
          <p className="dashboard-brand-subtitle">{subtitle}</p>
        </div>
        <DashboardNav
          navItems={navSections ? undefined : navItems}
          navSections={navSections}
          ariaLabel={`${title} navigation`}
          className="dashboard-nav"
          linkClassName="dashboard-nav-link"
        />
        <div className="dashboard-sidebar-footer">
          <p className="dashboard-user-name">{currentProfile?.full_name ?? currentProfile?.email ?? "Signed in"}</p>
          <SignOutButton />
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-topbar-label">{surfaceLabel}</p>
            <p className="dashboard-topbar-title">{title}</p>
          </div>
          <div className="dashboard-topbar-actions">
            {variant === "portal" ? <PortalNotificationBell summary={notificationSummary} /> : null}
            <div className="dashboard-topbar-signout">
              <SignOutButton />
            </div>
          </div>
        </header>
        <div id="main-content" className="dashboard-content">
          <DashboardMobileTables>{children}</DashboardMobileTables>
        </div>
        {mobileItems ? (
          <DashboardNav
            navItems={mobileItems}
            ariaLabel={`${title} quick navigation`}
            className="dashboard-mobile-nav"
            linkClassName="dashboard-mobile-nav-link"
          />
        ) : null}
      </div>
    </div>
  );
}
