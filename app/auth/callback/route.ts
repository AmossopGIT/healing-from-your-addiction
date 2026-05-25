import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { withBasePath } from "@/lib/basePath";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export const dynamic = "force-dynamic";
const allowedNextPaths = new Set(["/portal/", "/portal/onboarding/", "/portal/set-password/", "/admin/"]);

function redirectNoStore(url: string) {
  const response = NextResponse.redirect(url);
  response.headers.set("Cache-Control", "no-store, max-age=0");
  return response;
}

function resolveNextPath(rawNext: string | null) {
  const normalized = rawNext?.trim() || "/portal/";
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/portal/";
  }

  return allowedNextPaths.has(normalized) ? normalized : "/portal/";
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  if (process.env.NEXT_PUBLIC_STATIC_EXPORT === "true" || process.env.GITHUB_PAGES === "true") {
    return redirectNoStore(`${origin}${withBasePath("/portal/login/")}`);
  }

  const code = searchParams.get("code");
  const next = resolveNextPath(searchParams.get("next"));
  const loginPath = next.startsWith("/admin/") ? "/admin/login/" : "/portal/login/";

  if (!code || !getSupabaseUrl() || !getSupabaseAnonKey()) {
    return redirectNoStore(`${origin}${withBasePath(loginPath)}?error=invalid-link`);
  }

  const response = redirectNoStore(`${origin}${withBasePath(next)}`);

  const supabase = createServerClient<Database>(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return redirectNoStore(
      `${origin}${withBasePath(loginPath)}?error=${encodeURIComponent("The sign-in link is invalid or has expired.")}`,
    );
  }

  return response;
}
