import type { LeadPayload, LeadValidationResult } from "@/lib/leads/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLeadPayload(payload: LeadPayload): LeadValidationResult {
  if (payload.company?.trim()) {
    return { ok: false, status: 400, error: "Invalid submission." };
  }

  if (!payload.consentEmergencyAcknowledged) {
    return { ok: false, status: 400, error: "Consent is required before submitting an enquiry." };
  }

  const fullName = payload.fullName?.trim() ?? "";
  const email = payload.email?.trim() ?? "";
  const phone = payload.phone?.trim() ?? "";
  const addictionConcern = payload.addictionConcern?.trim() ?? "";
  const preferredContactMethod = payload.preferredContactMethod?.trim() ?? "";

  if (!fullName || fullName.length < 2) {
    return { ok: false, status: 400, error: "Please enter your full name." };
  }

  if (!email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, status: 400, error: "Please enter a valid email address." };
  }

  if (!phone || phone.length < 6) {
    return { ok: false, status: 400, error: "Please enter a phone or WhatsApp number." };
  }

  if (!addictionConcern) {
    return { ok: false, status: 400, error: "Please select an addiction concern." };
  }

  if (!preferredContactMethod) {
    return { ok: false, status: 400, error: "Please select a preferred contact method." };
  }

  return {
    ok: true,
    lead: {
      ...payload,
      fullName,
      email,
      phone,
      addictionConcern,
      preferredContactMethod,
      message: payload.message?.trim() ?? "",
      sourcePage: payload.sourcePage?.trim() ?? payload.landing_page?.trim() ?? "",
    },
  };
}
