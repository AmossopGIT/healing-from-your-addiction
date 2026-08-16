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

export function getActiveNavHref(
  pathname: string,
  navItems: ReadonlyArray<{ href: string }>,
) {
  let activeHref: string | null = null;

  for (const item of navItems) {
    const hrefPath = item.href.split("#")[0] ?? item.href;
    const href = normalizeSurfacePath(hrefPath);
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
