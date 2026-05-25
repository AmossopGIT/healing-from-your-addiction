import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthProfile } from "@/lib/supabase/auth";
import {
  isWebPushConfigured,
  normalizeWebPushCategories,
  unsubscribeWebPushEndpoint,
  upsertWebPushSubscription,
} from "@/lib/pwa/push";

type SubscribeBody = {
  categories?: string[];
  currentPath?: string;
  subscription?: {
    endpoint?: string;
    expirationTime?: number | null;
    keys?: {
      auth?: string;
      p256dh?: string;
    };
  };
};

export async function POST(request: Request) {
  if (!isWebPushConfigured()) {
    return NextResponse.json({ ok: false, error: "push_not_configured" }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as SubscribeBody | null;
  const endpoint = body?.subscription?.endpoint?.trim();
  const auth = body?.subscription?.keys?.auth?.trim();
  const p256dh = body?.subscription?.keys?.p256dh?.trim();

  if (!endpoint || !auth || !p256dh) {
    return NextResponse.json({ ok: false, error: "invalid_subscription" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const visitorId = cookieStore.get("hfya_push_visitor")?.value ?? crypto.randomUUID();
  const profile = await getAuthProfile();

  await upsertWebPushSubscription({
    auth,
    categories: normalizeWebPushCategories(body?.categories),
    endpoint,
    p256dh,
    sourcePath: body?.currentPath ?? null,
    subscriptionJson: body?.subscription ?? {},
    userAgent: request.headers.get("user-agent"),
    userId: profile?.id ?? null,
    visitorId,
  });

  const response = NextResponse.json({ ok: true });
  response.cookies.set("hfya_push_visitor", visitorId, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  return response;
}

export async function DELETE(request: Request) {
  const body = (await request.json().catch(() => null)) as { endpoint?: string } | null;
  const endpoint = body?.endpoint?.trim();

  if (!endpoint) {
    return NextResponse.json({ ok: false, error: "missing_endpoint" }, { status: 400 });
  }

  await unsubscribeWebPushEndpoint(endpoint);
  return NextResponse.json({ ok: true });
}
