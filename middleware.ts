import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

const AUTH_PATHS = new Set(["/admin/login/", "/portal/login/", "/portal/set-password/"]);

function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, getResponse: () => response };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isPortalRoute = pathname.startsWith("/portal");

  if (!isAdminRoute && !isPortalRoute) {
    return NextResponse.next();
  }

  if (!getSupabaseUrl() || !getSupabaseAnonKey()) {
    if (AUTH_PATHS.has(pathname)) {
      return NextResponse.next();
    }
    const loginUrl = isAdminRoute ? "/admin/login/" : "/portal/login/";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const { supabase, getResponse } = createMiddlewareClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPath = AUTH_PATHS.has(pathname);

  if (!user) {
    if (isAuthPath) {
      return getResponse();
    }
    const loginUrl = isAdminRoute ? "/admin/login/" : "/portal/login/";
    return NextResponse.redirect(new URL(loginUrl, request.url));
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = profile?.role;

  if (isAdminRoute) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/portal/", request.url));
    }
    if (pathname === "/admin/login/") {
      return NextResponse.redirect(new URL("/admin/", request.url));
    }
  }

  if (isPortalRoute) {
    if (role !== "client") {
      return NextResponse.redirect(new URL("/admin/", request.url));
    }
    if (pathname === "/portal/login/") {
      return NextResponse.redirect(new URL("/portal/", request.url));
    }
  }

  return getResponse();
}

export const config = {
  matcher: ["/admin/:path*", "/portal/:path*"],
};
