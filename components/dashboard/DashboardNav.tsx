"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveNavHref, normalizeSurfacePath } from "@/lib/appSurface";
import type { AdminNavSection, DashboardNavItem } from "@/lib/dashboard/constants";
import { flattenNavSections } from "@/lib/dashboard/constants";

type DashboardNavProps = {
  navItems?: DashboardNavItem[];
  navSections?: AdminNavSection[];
  ariaLabel: string;
  className: string;
  linkClassName: string;
};

export function DashboardNav({ navItems, navSections, ariaLabel, className, linkClassName }: DashboardNavProps) {
  const pathname = normalizeSurfacePath(usePathname());
  const items = navItems ?? (navSections ? flattenNavSections(navSections) : []);
  const activeHref = getActiveNavHref(pathname, items);

  if (navSections?.length) {
    return (
      <nav className={className} aria-label={ariaLabel}>
        {navSections.map((section) => (
          <div key={section.id} className="dashboard-nav-section">
            <p className="dashboard-nav-section-label">{section.label}</p>
            <div className="dashboard-nav-section-links">
              {section.items.map((item) => {
                const href = normalizeSurfacePath(item.href.split("#")[0] ?? item.href);
                const isActive = activeHref === href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${linkClassName}${isActive ? " is-active" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <nav className={className} aria-label={ariaLabel}>
      {items.map((item) => {
        const href = normalizeSurfacePath(item.href.split("#")[0] ?? item.href);
        const isActive = activeHref === href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`${linkClassName}${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
