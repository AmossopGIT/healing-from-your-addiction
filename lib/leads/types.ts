export type LeadPayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  addictionConcern?: string;
  preferredContactMethod?: string;
  message?: string;
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
