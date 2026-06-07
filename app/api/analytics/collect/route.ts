import { validateAnalyticsCollectPayload } from "@/lib/analytics/schema";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export const runtime = "nodejs";

const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;

function getClientKey(request: Request, visitorId: string | null | undefined) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const ip = forwarded || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${visitorId ?? "anon"}`;
}

function isRateLimited(key: string) {
  const now = Date.now();
  const entry = rateLimit.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX) return true;
  return false;
}

export async function POST(request: Request) {
  let raw: unknown;

  try {
    raw = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid JSON body." }, { status: 400 });
  }

  const events = validateAnalyticsCollectPayload(raw);
  if (!events.length) {
    return Response.json({ ok: false, error: "No valid events." }, { status: 400 });
  }

  const clientKey = getClientKey(request, events[0]?.visitor_id);
  if (isRateLimited(clientKey)) {
    return Response.json({ ok: false, error: "Rate limit exceeded." }, { status: 429 });
  }

  if (!isSupabaseServiceConfigured()) {
    return Response.json({ ok: true, stored: 0, warning: "Analytics storage not configured." });
  }

  const supabase = createServiceClient();
  const rows = events.map((event) => ({
    occurred_at: event.occurred_at ?? new Date().toISOString(),
    event_name: event.event_name,
    page_path: event.page_path,
    session_id: event.session_id,
    visitor_id: event.visitor_id,
    consent_tier: event.consent_tier,
    page_type: event.page_type,
    primary_keyword: event.primary_keyword,
    conversion_goal: event.conversion_goal,
    landing_page: event.landing_page,
    referrer: event.referrer,
    utm_source: event.utm_source,
    utm_medium: event.utm_medium,
    utm_campaign: event.utm_campaign,
    utm_term: event.utm_term,
    utm_content: event.utm_content,
    gclid: event.gclid,
    properties: event.properties ?? {},
  }));

  const { error } = await supabase.from("analytics_events").insert(rows);

  if (error) {
    return Response.json({ ok: false, error: "Failed to store events." }, { status: 500 });
  }

  return Response.json({ ok: true, stored: rows.length });
}
