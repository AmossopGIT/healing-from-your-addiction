import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { normalizeSurfacePath, resolveAppSurface } from "@/lib/appSurface";
import { withBasePath } from "@/lib/basePath";
import { isClientOnboardingComplete } from "@/lib/supabase/onboarding";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const ADMIN_AUTH_PATHS = new Set(["/admin/login/"]);
const PORTAL_PUBLIC_PATHS = new Set([
  "/portal/login/",
  "/portal/sign-up/",
  "/portal/check-email/",
  "/portal/forgot-password/",
  "/portal/set-password/",
]);
const PORTAL_ONBOARDING_PATH = "/portal/onboarding/";

function createMiddlewareClient(request: NextRequest, requestHeaders: Headers) {
  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request: { headers: requestHeaders } });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, getResponse: () => response };
}

export async function middleware(request: NextRequest) {
  const pathname = normalizeSurfacePath(request.nextUrl.pathname);
  const authCode = request.nextUrl.searchParams.get("code");

  if (authCode && (pathname === "/" || pathname === "/portal/login/")) {
    const callbackUrl = new URL(withBasePath("/auth/callback/"), request.url);
    callbackUrl.searchParams.set("code", authCode);
    const next = request.nextUrl.searchParams.get("next");
    if (next) {
      callbackUrl.searchParams.set("next", next);
    } else if (pathname === "/portal/login/") {
      callbackUrl.searchParams.set("next", "/portal/");
    }
    return NextResponse.redirect(callbackUrl);
  }

  const isAdminRoute = pathname.startsWith("/admin/");
  const isPortalRoute = pathname.startsWith("/portal/");
  const requestHeaders = new Headers(request.headers);

  requestHeaders.set("x-app-surface", resolveAppSurface(pathname));
  requestHeaders.set("x-current-path", pathname);

  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    if (ADMIN_AUTH_PATHS.has(pathname) || PORTAL_PUBLIC_PATHS.has(pathname)) {
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    const loginUrl = isAdminRoute ? withBasePath("/admin/login/") : withBasePath("/portal/login/");
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const { supabase, getResponse } = createMiddlewareClient(request, requestHeaders);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPath = ADMIN_AUTH_PATHS.has(pathname) || PORTAL_PUBLIC_PATHS.has(pathname);
  const isSetPasswordPath = pathname === "/portal/set-password/";

  if (!user) {
    if (isAuthPath) {
      return getResponse();
    }
    const loginUrl = isAdminRoute ? withBasePath("/admin/login/") : withBasePath("/portal/login/");
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  // Password recovery must not bounce by role (avoids admin <-> portal redirect loop).
  if (isSetPasswordPath) {
    return getResponse();
  }

  if (isAdminRoute) {
    if (role !== "admin") {
      const fallback = role ? withBasePath("/portal/") : withBasePath("/portal/login/");
      return NextResponse.redirect(new URL(fallback, request.url));
    }
    if (pathname === "/admin/login/") {
      return NextResponse.redirect(new URL(withBasePath("/admin/"), request.url));
    }
  }

  if (isPortalRoute) {
    const isPortalPublicAuthPath = PORTAL_PUBLIC_PATHS.has(pathname);

    // Login, sign-up, forgot-password, check-email, set-password must always render (no role bounce).
    if (isPortalPublicAuthPath) {
      if (role === "admin") {
        return NextResponse.redirect(new URL(withBasePath("/admin/"), request.url));
      }

      if (role === "client") {
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id, onboarding_completed_at")
          .eq("user_id", user.id)
          .maybeSingle();
        const onboardingComplete = isClientOnboardingComplete(clientProfile);

        if (pathname === "/portal/login/" || pathname === "/portal/sign-up/" || pathname === "/portal/forgot-password/") {
          const target = onboardingComplete ? "/portal/" : PORTAL_ONBOARDING_PATH;
          return NextResponse.redirect(new URL(withBasePath(target), request.url));
        }

        if (pathname === "/portal/check-email/") {
          const target = onboardingComplete ? "/portal/" : PORTAL_ONBOARDING_PATH;
          return NextResponse.redirect(new URL(withBasePath(target), request.url));
        }
      }

      return getResponse();
    }

    if (role !== "client") {
      if (role === "admin") {
        return NextResponse.redirect(new URL(withBasePath("/admin/"), request.url));
      }
      return NextResponse.redirect(
        new URL(`${withBasePath("/portal/login/")}?error=${encodeURIComponent("This account is not set up for the client portal.")}`, request.url),
      );
    }

    const { data: clientProfile } = await supabase
      .from("client_profiles")
      .select("id, onboarding_completed_at")
      .eq("user_id", user.id)
      .maybeSingle();
    const onboardingComplete = isClientOnboardingComplete(clientProfile);

    if (pathname === PORTAL_ONBOARDING_PATH) {
      if (onboardingComplete) {
        return NextResponse.redirect(new URL(withBasePath("/portal/"), request.url));
      }
      return getResponse();
    }

    if (!onboardingComplete) {
      return NextResponse.redirect(new URL(withBasePath(PORTAL_ONBOARDING_PATH), request.url));
    }
  }

  return getResponse();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.[^/]+$).*)"],
};
