"use client";

import type { ConsentTier } from "@/lib/analytics/schema";
import { getSessionId, getVisitorId, readUtmParams } from "@/lib/analytics/visitor";
import { withBasePath } from "@/lib/basePath";
import { hasAnalyticsConsent } from "@/lib/analytics/consent";

type CollectPayload = {
  event_name: string;
  page_path: string;
  consent_tier: ConsentTier;
  page_type?: string;
  primary_keyword?: string;
  conversion_goal?: string;
  landing_page?: string;
  referrer?: string;
  properties?: Record<string, unknown>;
};

const queue: CollectPayload[] = [];
let flushTimer: ReturnType<typeof setTimeout> | null = null;

function currentConsentTier(): ConsentTier {
  return hasAnalyticsConsent() ? "analytics" : "essential";
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    void flushAnalyticsQueue();
  }, 1200);
}

export function collectEvent(payload: Omit<CollectPayload, "consent_tier"> & { consent_tier?: ConsentTier }) {
  if (typeof window === "undefined") return;

  queue.push({
    ...payload,
    consent_tier: payload.consent_tier ?? currentConsentTier(),
  });

  if (queue.length >= 8) {
    void flushAnalyticsQueue();
    return;
  }

  scheduleFlush();
}

export async function flushAnalyticsQueue() {
  if (typeof window === "undefined" || queue.length === 0) return;

  const batch = queue.splice(0, 25);
  const utm = readUtmParams();

  const body = JSON.stringify({
    events: batch.map((event) => ({
      ...event,
      occurred_at: new Date().toISOString(),
      session_id: getSessionId(),
      visitor_id: getVisitorId(),
      referrer: event.referrer ?? (document.referrer || null),
      ...utm,
    })),
  });

  const url = withBasePath("/api/analytics/collect/");

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const sent = navigator.sendBeacon(url, blob);
      if (sent) return;
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    queue.unshift(...batch);
  }
}
