import { sendLeadNotificationEmail, isResendConfigured } from "@/lib/email/resend";
import { persistLead } from "@/lib/leads/persistLead";
import type { LeadPayload } from "@/lib/leads/types";
import { validateLeadPayload } from "@/lib/leads/validateLead";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export type LeadSubmissionResponse = {
  status: number;
  body: { ok: boolean; error?: string };
};

export async function handleLeadSubmission(payload: LeadPayload): Promise<LeadSubmissionResponse> {
  const validation = validateLeadPayload(payload);
  if (!validation.ok) {
    return { status: validation.status, body: { ok: false, error: validation.error } };
  }

  let persistedLeadId: string | null = null;

  if (isSupabaseServiceConfigured()) {
    const persistResult = await persistLead(validation.lead);
    if (persistResult.ok) {
      persistedLeadId = persistResult.id;
    } else {
      console.error("Lead DB persistence failed:", persistResult.error);
    }
  }

  if (!isResendConfigured()) {
    if (persistedLeadId) {
      return { status: 200, body: { ok: true } };
    }

    return {
      status: 503,
      body: {
        ok: false,
        error: "Lead email is not configured yet. Add RESEND_API_KEY and related env vars on the server.",
      },
    };
  }

  try {
    await sendLeadNotificationEmail(validation.lead);
    return { status: 200, body: { ok: true } };
  } catch (error) {
    console.error("Lead notification email failed:", error);

    if (persistedLeadId) {
      return { status: 200, body: { ok: true } };
    }

    return {
      status: 500,
      body: { ok: false, error: "Unable to send your enquiry right now. Please try WhatsApp or email instead." },
    };
  }
}
