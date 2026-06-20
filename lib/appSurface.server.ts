import { headers } from "next/headers";
import { type AppSurface, normalizeSurfacePath, resolveAppSurface } from "@/lib/appSurface";

export async function getRequestSurface() {
  const headerStore = await headers();
  const fromHeader = headerStore.get("x-app-surface") as AppSurface | null;
  if (fromHeader === "admin" || fromHeader === "portal" || fromHeader === "public") {
    return fromHeader;
  }

  return resolveAppSurface(headerStore.get("x-current-path"));
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return normalizeSurfacePath(headerStore.get("x-current-path"));
}
