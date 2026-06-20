"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { MarketingShell } from "@/components/MarketingShell";
import type { SeoPageRecord } from "@/content/seo";
import { resolveAppSurface } from "@/lib/appSurface";

type AppSurfaceShellProps = {
  children: ReactNode;
  initialPath: string;
  pageSeo?: SeoPageRecord;
};

export function AppSurfaceShell({ children, initialPath, pageSeo }: AppSurfaceShellProps) {
  const pathname = usePathname() ?? initialPath;
  const surface = resolveAppSurface(pathname);

  if (surface !== "public") {
    return children;
  }

  return (
    <MarketingShell currentPath={pathname} pageSeo={pageSeo}>
      {children}
    </MarketingShell>
  );
}
