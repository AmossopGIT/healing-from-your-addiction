import { headers } from "next/headers";
import { type AppSurface, normalizeSurfacePath } from "@/lib/appSurface";

export async function getRequestSurface() {
  const headerStore = await headers();
  return (headerStore.get("x-app-surface") as AppSurface | null) ?? "public";
}

export async function getRequestPathname() {
  const headerStore = await headers();
  return normalizeSurfacePath(headerStore.get("x-current-path"));
}
