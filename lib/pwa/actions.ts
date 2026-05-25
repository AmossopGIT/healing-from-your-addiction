"use server";

import { redirect } from "next/navigation";
import { requireAuthProfile } from "@/lib/supabase/auth";
import { isWebPushConfigured, sendWebPushBroadcast, webPushCategories } from "@/lib/pwa/push";

export async function sendPushBroadcastAction(formData: FormData) {
  await requireAuthProfile("admin");

  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const url = String(formData.get("url") ?? "/").trim() || "/";
  const category = String(formData.get("category") ?? "").trim();

  if (!isWebPushConfigured()) {
    redirect("/admin/notifications/?error=push-not-configured");
  }

  if (!title || !body || !webPushCategories.some((item) => item.id === category)) {
    redirect("/admin/notifications/?error=invalid-push-input");
  }

  const result = await sendWebPushBroadcast({
    title,
    body,
    url,
    category: category as (typeof webPushCategories)[number]["id"],
  });

  redirect(`/admin/notifications/?sent=${result.sent}&failed=${result.failed}&total=${result.total}`);
}
