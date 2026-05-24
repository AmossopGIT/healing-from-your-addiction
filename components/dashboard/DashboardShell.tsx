import Link from "next/link";
import type { ReactNode } from "react";
import { createClient } from "@/lib/supabase/server";

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

export async function DashboardShell({ title, subtitle, navItems, children, variant }: DashboardShellProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, role").eq("id", user.id).single()
    : { data: null };

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
            <Link key={item.href} href={item.href} className="dashboard-nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="dashboard-sidebar-footer">
          <p className="dashboard-user-name">{profile?.full_name ?? user?.email ?? "Signed in"}</p>
          <SignOutButton />
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <p className="dashboard-topbar-label">{variant === "admin" ? "Admin workspace" : "Private client portal"}</p>
        </header>
        <div className="dashboard-content">{children}</div>
      </div>
    </div>
  );
}
