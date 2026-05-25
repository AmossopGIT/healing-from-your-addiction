import webpush from "web-push";
import { withBasePath } from "@/lib/basePath";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/types/database";

export type WebPushCategory = "site_updates" | "new_resources" | "gentle_reminders";

export const webPushCategories: Array<{
  id: WebPushCategory;
  label: string;
}> = [
  { id: "site_updates", label: "Site updates" },
  { id: "new_resources", label: "New resources" },
  { id: "gentle_reminders", label: "Gentle reminders" },
];

type StoredSubscriptionRow = Database["public"]["Tables"]["web_push_subscriptions"]["Row"];

type UpsertWebPushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
  categories: WebPushCategory[];
  subscriptionJson: Record<string, unknown>;
  sourcePath?: string | null;
  userAgent?: string | null;
  userId?: string | null;
  visitorId?: string | null;
};

export type SendWebPushBroadcastInput = {
  title: string;
  body: string;
  url: string;
  category: WebPushCategory;
  tag?: string;
  renotify?: boolean;
};

export function getWebPushPublicKey() {
  return process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY?.trim() ?? "";
}

export function getWebPushPrivateKey() {
  return process.env.WEB_PUSH_PRIVATE_KEY?.trim() ?? "";
}

export function getWebPushSubject() {
  return process.env.WEB_PUSH_SUBJECT?.trim() || "mailto:start@healingfromyouraddiction.co.za";
}

export function isWebPushConfigured() {
  return Boolean(getWebPushPublicKey() && getWebPushPrivateKey());
}

export function normalizeWebPushCategories(values: string[] | undefined | null): WebPushCategory[] {
  const categorySet = new Set(webPushCategories.map((category) => category.id));
  const selected = (values ?? []).filter((value): value is WebPushCategory => categorySet.has(value as WebPushCategory));
  return selected.length ? Array.from(new Set(selected)) : (["site_updates", "new_resources"] satisfies WebPushCategory[]);
}

function configureWebPush() {
  if (!isWebPushConfigured()) {
    throw new Error("Web push is not configured.");
  }

  webpush.setVapidDetails(getWebPushSubject(), getWebPushPublicKey(), getWebPushPrivateKey());
}

function normalizeNotificationUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) {
    return withBasePath("/");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return withBasePath(trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
}

export async function upsertWebPushSubscription(input: UpsertWebPushSubscriptionInput) {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  const payload = {
    endpoint: input.endpoint,
    p256dh: input.p256dh,
    auth: input.auth,
    categories: input.categories,
    subscription_json: input.subscriptionJson,
    consent_state: "subscribed",
    status: "active",
    source_path: input.sourcePath ?? null,
    user_agent: input.userAgent ?? null,
    user_id: input.userId ?? null,
    visitor_id: input.visitorId ?? null,
    last_seen_at: now,
    unsubscribed_at: null,
    last_error: null,
  } satisfies Database["public"]["Tables"]["web_push_subscriptions"]["Insert"];

  const { data, error } = await supabase
    .from("web_push_subscriptions")
    .upsert(payload, { onConflict: "endpoint" })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function unsubscribeWebPushEndpoint(endpoint: string) {
  const supabase = createServiceClient();
  const { error } = await supabase
    .from("web_push_subscriptions")
    .update({
      consent_state: "unsubscribed",
      status: "inactive",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("endpoint", endpoint);

  if (error) {
    throw new Error(error.message);
  }
}

async function markSubscriptionStatus(
  subscriptionId: string,
  updates: Database["public"]["Tables"]["web_push_subscriptions"]["Update"],
) {
  const supabase = createServiceClient();
  await supabase.from("web_push_subscriptions").update(updates).eq("id", subscriptionId);
}

export async function listWebPushAudience(category?: WebPushCategory) {
  const supabase = createServiceClient();
  let query = supabase
    .from("web_push_subscriptions")
    .select("*")
    .eq("status", "active")
    .eq("consent_state", "subscribed")
    .order("created_at", { ascending: false });

  if (category) {
    query = query.contains("categories", [category]);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as StoredSubscriptionRow[];
}

export async function sendWebPushBroadcast(input: SendWebPushBroadcastInput) {
  configureWebPush();

  const supabase = createServiceClient();
  const subscriptions = await listWebPushAudience(input.category);
  const deliveryLogs: Database["public"]["Tables"]["web_push_delivery_logs"]["Insert"][] = [];

  let sent = 0;
  let failed = 0;

  for (const subscription of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        JSON.stringify({
          body: input.body,
          category: input.category,
          renotify: input.renotify ?? false,
          tag: input.tag ?? `hfya-${input.category}`,
          title: input.title,
          url: normalizeNotificationUrl(input.url),
        }),
      );

      sent += 1;
      deliveryLogs.push({
        subscription_id: subscription.id,
        category: input.category,
        title: input.title,
        body: input.body,
        target_url: normalizeNotificationUrl(input.url),
        status: "sent",
      });

      await markSubscriptionStatus(subscription.id, {
        last_error: null,
        last_sent_at: new Date().toISOString(),
        status: "active",
      });
    } catch (error) {
      failed += 1;

      const statusCode = typeof error === "object" && error && "statusCode" in error ? Number(error.statusCode) : null;
      const responseBody =
        typeof error === "object" && error && "body" in error && typeof error.body === "string" ? error.body : null;
      const message = error instanceof Error ? error.message : "Unknown delivery failure";
      const nextStatus = statusCode === 404 || statusCode === 410 ? "expired" : "failed";

      deliveryLogs.push({
        subscription_id: subscription.id,
        category: input.category,
        title: input.title,
        body: input.body,
        target_url: normalizeNotificationUrl(input.url),
        status: "failed",
        response_body: responseBody ?? message,
        response_status: statusCode,
      });

      await markSubscriptionStatus(subscription.id, {
        last_error: message,
        status: nextStatus,
      });
    }
  }

  if (deliveryLogs.length) {
    const { error } = await supabase.from("web_push_delivery_logs").insert(deliveryLogs);
    if (error) {
      throw new Error(error.message);
    }
  }

  return {
    total: subscriptions.length,
    sent,
    failed,
  };
}
