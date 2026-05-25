import Link from "next/link";
import type { ReactNode } from "react";
import { PortalNotificationBell } from "@/components/dashboard/PortalNotificationBell";
import { getActiveNavHref, getRequestPathname } from "@/lib/appSurface";
import { getPortalNotificationSummary } from "@/lib/dashboard/queries";
import type { AuthProfile } from "@/lib/supabase/auth";

type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardShellProps = {
  title: string;
  subtitle: string;
  navItems: DashboardNavItem[];
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

export async function DashboardShell({ title, subtitle, navItems, children, variant, currentProfile = null }: DashboardShellProps) {
  const currentPath = await getRequestPathname();
  const activeHref = getActiveNavHref(currentPath, navItems);
  const notificationSummary = variant === "portal" && currentProfile?.id
    ? await getPortalNotificationSummary(currentProfile.id)
    : null;

  return (
    <div className={`dashboard-shell dashboard-shell-${variant}`}>
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <p className="dashboard-brand-eyebrow">Healing From Your Addiction</p>
          <p className="dashboard-brand-title">{title}</p>
          <p className="dashboard-brand-subtitle">{subtitle}</p>
        </div>
        <nav className="dashboard-nav" aria-label={`${title} navigation`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-nav-link${activeHref === item.href ? " is-active" : ""}`}
              aria-current={activeHref === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <p className="dashboard-user-name">{currentProfile?.full_name ?? currentProfile?.email ?? "Signed in"}</p>
          <SignOutButton />
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p className="dashboard-topbar-label">{variant === "admin" ? "Admin workspace" : "Private client portal"}</p>
          </div>
          <div className="dashboard-topbar-actions">
            {variant === "portal" ? <PortalNotificationBell summary={notificationSummary} /> : null}
          </div>
        </header>
        <div className="dashboard-content">{children}</div>
        <nav className="dashboard-mobile-nav" aria-label={`${title} quick navigation`}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dashboard-mobile-nav-link${activeHref === item.href ? " is-active" : ""}`}
              aria-current={activeHref === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
