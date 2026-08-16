"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getActiveNavHref, normalizeSurfacePath } from "@/lib/appSurface";

type DashboardNavItem = {
  href: string;
  label: string;
};

type DashboardNavProps = {
  navItems: DashboardNavItem[];
  ariaLabel: string;
  className: string;
  linkClassName: string;
};

export function DashboardNav({ navItems, ariaLabel, className, linkClassName }: DashboardNavProps) {
  const pathname = normalizeSurfacePath(usePathname());
  const activeHref = getActiveNavHref(pathname, navItems);

  return (
    <nav className={className} aria-label={ariaLabel}>
      {navItems.map((item) => {
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
