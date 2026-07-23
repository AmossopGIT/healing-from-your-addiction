import { createServiceClient } from "@/lib/supabase/service";
import type { ConsultationStatus } from "@/types/database";

type ResendWebhookEvent = {
  type?: string;
  data?: {
    email_id?: string;
    created_at?: string;
  };
};

const OPEN_TYPES = new Set(["email.opened"]);
const DELIVERED_TYPES = new Set(["email.delivered"]);

function statusRank(status: ConsultationStatus) {
  const order: ConsultationStatus[] = [
    "not_sent",
    "sent",
    "delivered",
    "opened",
    "started",
    "in_progress",
    "completed",
    "uploaded",
  ];
  return order.indexOf(status);
}

function canAdvance(current: ConsultationStatus, next: ConsultationStatus) {
  // Never overwrite client progress or completion with email events.
  if (current === "started" || current === "in_progress" || current === "completed" || current === "uploaded") {
    return false;
  }
  return statusRank(next) > statusRank(current);
}

export async function applyResendConsultationWebhook(payload: ResendWebhookEvent) {
  const emailId = payload.data?.email_id?.trim();
  const type = payload.type?.trim();
  if (!emailId || !type) {
    return { handled: false as const, reason: "missing-fields" };
  }

  if (!OPEN_TYPES.has(type) && !DELIVERED_TYPES.has(type)) {
    return { handled: false as const, reason: "ignored-type" };
  }

  const service = createServiceClient();
  const { data: consultation } = await service
    .from("client_consultations")
    .select("*")
    .eq("resend_email_id", emailId)
    .maybeSingle();

  if (!consultation) {
    return { handled: false as const, reason: "not-found" };
  }

  const now = payload.data?.created_at || new Date().toISOString();
  const patch: {
    delivered_at?: string;
    opened_at?: string;
    status?: ConsultationStatus;
  } = {};

  if (DELIVERED_TYPES.has(type)) {
    if (!consultation.delivered_at) patch.delivered_at = now;
    if (canAdvance(consultation.status as ConsultationStatus, "delivered")) {
      patch.status = "delivered";
    }
  }

  if (OPEN_TYPES.has(type)) {
    if (!consultation.opened_at) patch.opened_at = now;
    if (!consultation.delivered_at) patch.delivered_at = consultation.delivered_at ?? now;
    if (canAdvance(consultation.status as ConsultationStatus, "opened")) {
      patch.status = "opened";
    }
  }

  if (!Object.keys(patch).length) {
    return { handled: true as const, updated: false };
  }

  const { error } = await service.from("client_consultations").update(patch).eq("id", consultation.id);
  if (error) {
    return { handled: false as const, reason: error.message };
  }

  return { handled: true as const, updated: true };
}
