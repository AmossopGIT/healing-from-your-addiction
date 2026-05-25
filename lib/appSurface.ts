import { headers } from "next/headers";
import { withoutBasePath } from "@/lib/basePath";

export type AppSurface = "public" | "portal" | "admin";

export function normalizeSurfacePath(pathname: string | null | undefined) {
  const normalized = withoutBasePath(pathname ?? "/") || "/";
  if (normalized === "/") {
    return "/";
  }

  return normalized.endsWith("/") ? normalized : `${normalized}/`;
}

export function resolveAppSurface(pathname: string | null | undefined): AppSurface {
  const normalized = normalizeSurfacePath(pathname);

  if (normalized.startsWith("/admin/")) {
    return "admin";
  }

  if (normalized.startsWith("/portal/")) {
    return "portal";
  }

  return "public";
}

export async function getRequestSurface() {
  const headerStore = await headers();
  return (headerStore.get("x-app-surface") as AppSurface | null) ?? "public";
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return normalizeSurfacePath(headerStore.get("x-current-path"));
}

export function getActiveNavHref(
  pathname: string,
  navItems: ReadonlyArray<{ href: string }>,
) {
  let activeHref: string | null = null;

  for (const item of navItems) {
    const href = normalizeSurfacePath(item.href);
    const isMatch = pathname === href || (href !== "/" && pathname.startsWith(href));

    if (!isMatch) {
      continue;
    }

    if (!activeHref || href.length > activeHref.length) {
      activeHref = href;
    }
  }

  return activeHref;
}
