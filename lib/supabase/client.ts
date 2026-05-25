"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export function getSupabaseBrowserConfigError() {
  const missingVars = [
    !getSupabaseUrl() ? "NEXT_PUBLIC_SUPABASE_URL" : null,
    !getSupabaseAnonKey() ? "NEXT_PUBLIC_SUPABASE_ANON_KEY" : null,
  ].filter(Boolean);

  if (!missingVars.length) {
    return null;
  }

  return `Portal auth is unavailable because these env vars are missing: ${missingVars.join(", ")}. Add them to your local env file and restart the dev server.`;
}

export function createClient() {
  const configError = getSupabaseBrowserConfigError();
  if (configError) {
    throw new Error(configError);
  }

  return createBrowserClient<Database>(getSupabaseUrl(), getSupabaseAnonKey());
}
