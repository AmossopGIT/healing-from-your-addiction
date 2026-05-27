export type LeadPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  addictionConcern?: string;
  preferredContactMethod?: string;
  message?: string;
  urgencyLevel?: "low" | "medium" | "high";
  withdrawalRisk?: "none" | "mild" | "moderate" | "severe" | "unsure";
  medicalSupportInvolved?: "yes" | "no" | "planning";
  callbackWindow?: "early_morning" | "late_morning" | "afternoon" | "evening" | "flexible";
  supportGoals?: string;
  followUpConsentWhatsApp?: boolean;
  followUpConsentEmail?: boolean;
  followUpConsentPhone?: boolean;
  readinessStage?: "exploring" | "ready_now" | "currently_in_support";
  riskFlag?: "standard" | "priority" | "urgent_review";
  triagePriority?: "routine" | "priority" | "urgent";
  triageSlaHours?: number;
  company?: string;
  consentEmergencyAcknowledged?: boolean;
  sourcePage?: string;
  landing_page?: string;
  referrer?: string;
  page_type?: string;
  primary_keyword?: string;
  conversion_goal?: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
};

export type LeadValidationResult =
  | { ok: true; lead: Required<Pick<LeadPayload, "fullName" | "email" | "phone" | "addictionConcern" | "preferredContactMethod">> & LeadPayload }
  | { ok: false; status: number; error: string };
