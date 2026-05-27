import { sendLeadNotificationEmail, isResendConfigured } from "@/lib/email/resend";
import { persistLead } from "@/lib/leads/persistLead";
import type { LeadPayload } from "@/lib/leads/types";
import { validateLeadPayload } from "@/lib/leads/validateLead";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export type LeadSubmissionResponse = {
  status: number;
  body: { ok: boolean; error?: string };
};

function deriveTriage(lead: LeadPayload) {
  const urgentSignal =
    lead.urgencyLevel === "high" || lead.withdrawalRisk === "severe" || lead.medicalSupportInvolved === "yes";

  const prioritySignal =
    urgentSignal ||
    lead.urgencyLevel === "medium" ||
    lead.withdrawalRisk === "moderate" ||
    lead.readinessStage === "ready_now";

  if (urgentSignal) {
    return {
      triagePriority: "urgent" as const,
      riskFlag: "urgent_review" as const,
      triageSlaHours: 2,
    };
  }

  if (prioritySignal) {
    return {
      triagePriority: "priority" as const,
      riskFlag: "priority" as const,
      triageSlaHours: 8,
    };
  }

  return {
    triagePriority: "routine" as const,
    riskFlag: "standard" as const,
    triageSlaHours: 24,
  };
}

export async function handleLeadSubmission(payload: LeadPayload): Promise<LeadSubmissionResponse> {
  const validation = validateLeadPayload(payload);
  if (!validation.ok) {
    return { status: validation.status, body: { ok: false, error: validation.error } };
  }
  const triage = deriveTriage(validation.lead);
  const lead = {
    ...validation.lead,
    triagePriority: validation.lead.triagePriority ?? triage.triagePriority,
    riskFlag: validation.lead.riskFlag ?? triage.riskFlag,
    triageSlaHours: validation.lead.triageSlaHours ?? triage.triageSlaHours,
  };

  let persistedLeadId: string | null = null;

  if (isSupabaseServiceConfigured()) {
    const persistResult = await persistLead(lead);
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
        error: "Lead email is not configured yet. Set RESEND_API_KEY on the server (recommended: RESEND_FROM_EMAIL and LEAD_NOTIFICATION_EMAIL).",
      },
    };
  }

  try {
    await sendLeadNotificationEmail(lead);
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
