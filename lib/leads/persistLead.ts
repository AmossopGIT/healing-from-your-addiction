import type { LeadPayload } from "@/lib/leads/types";
import { createServiceClient } from "@/lib/supabase/service";
import { isSupabaseServiceConfigured } from "@/lib/supabase/env";

export function leadPayloadToRow(lead: LeadPayload & { fullName: string; email: string; phone: string; addictionConcern: string; preferredContactMethod: string }) {
  return {
    full_name: lead.fullName,
    email: lead.email,
    phone: lead.phone,
    addiction_concern: lead.addictionConcern,
    preferred_contact_method: lead.preferredContactMethod,
    message: lead.message ?? null,
    urgency_level: lead.urgencyLevel ?? null,
    withdrawal_risk: lead.withdrawalRisk ?? null,
    medical_support_involved: lead.medicalSupportInvolved ?? null,
    callback_window: lead.callbackWindow ?? null,
    support_goals: lead.supportGoals ?? null,
    follow_up_consent_whatsapp: lead.followUpConsentWhatsApp ?? false,
    follow_up_consent_email: lead.followUpConsentEmail ?? false,
    follow_up_consent_phone: lead.followUpConsentPhone ?? false,
    readiness_stage: lead.readinessStage ?? null,
    risk_flag: lead.riskFlag ?? null,
    triage_priority: lead.triagePriority ?? null,
    triage_sla_hours: lead.triageSlaHours ?? null,
    source_page: lead.sourcePage ?? null,
    landing_page: lead.landing_page ?? null,
    referrer: lead.referrer ?? null,
    page_type: lead.page_type ?? null,
    primary_keyword: lead.primary_keyword ?? null,
    conversion_goal: lead.conversion_goal ?? null,
    utm_source: lead.utm_source ?? null,
    utm_medium: lead.utm_medium ?? null,
    utm_campaign: lead.utm_campaign ?? null,
    utm_term: lead.utm_term ?? null,
    utm_content: lead.utm_content ?? null,
    gclid: lead.gclid ?? null,
    status: "new" as const,
  };
}

export async function persistLead(
  lead: LeadPayload & { fullName: string; email: string; phone: string; addictionConcern: string; preferredContactMethod: string },
) {
  if (!isSupabaseServiceConfigured()) {
    return { ok: false as const, error: "Supabase not configured" };
  }

  const supabase = createServiceClient();
  const { data, error } = await supabase.from("leads").insert(leadPayloadToRow(lead)).select("id").single();

  if (error) {
    console.error("Lead persistence failed:", error);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, id: data.id };
}
