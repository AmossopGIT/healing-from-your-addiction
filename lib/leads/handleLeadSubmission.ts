import { sendLeadNotificationEmail, isResendConfigured } from "@/lib/email/resend";
import type { LeadPayload } from "@/lib/leads/types";
import { validateLeadPayload } from "@/lib/leads/validateLead";

export type LeadSubmissionResponse = {
  status: number;
  body: { ok: boolean; error?: string };
};

export async function handleLeadSubmission(payload: LeadPayload): Promise<LeadSubmissionResponse> {
  const validation = validateLeadPayload(payload);
  if (!validation.ok) {
    return { status: validation.status, body: { ok: false, error: validation.error } };
  }

  if (!isResendConfigured()) {
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
    return {
      status: 500,
      body: { ok: false, error: "Unable to send your enquiry right now. Please try WhatsApp or email instead." },
    };
  }
}
