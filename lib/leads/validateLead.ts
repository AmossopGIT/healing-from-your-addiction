import { addictionOptions, contactMethods } from "@/lib/constants";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import type { LeadPayload, LeadValidationResult } from "@/lib/leads/types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{6,32}$/;

const allowedAddictionConcerns = new Set<string>(addictionOptions);
const allowedContactMethods = new Set<string>(contactMethods);
const allowedUrgencyLevels = new Set(["low", "medium", "high"]);
const allowedWithdrawalRisk = new Set(["none", "mild", "moderate", "severe", "unsure"]);
const allowedMedicalSupportInvolved = new Set(["yes", "no", "planning"]);
const allowedCallbackWindow = new Set(["early_morning", "late_morning", "afternoon", "evening", "flexible"]);
const allowedReadinessStage = new Set(["exploring", "ready_now", "currently_in_support"]);

function normalizeSingleLine(value: string | null | undefined) {
  return (value ?? "")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeMultiline(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, "")
    .trim();
}

function sanitizeOptionalPath(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized.startsWith("/")) return "";
  return normalized.slice(0, leadFieldMaxLengths.sourcePage);
}

function sanitizeOptionalText(value: string | null | undefined, maxLength: number) {
  return normalizeSingleLine(value).slice(0, maxLength);
}

export function validateLeadPayload(payload: LeadPayload): LeadValidationResult {
  const company = sanitizeOptionalText(payload.company, leadFieldMaxLengths.company);
  if (company) {
    return { ok: false, status: 400, error: "Invalid submission." };
  }

  if (!payload.consentEmergencyAcknowledged) {
    return { ok: false, status: 400, error: "Consent is required before submitting an enquiry." };
  }

  const fullName = normalizeSingleLine(payload.fullName);
  const email = normalizeSingleLine(payload.email).toLowerCase();
  const phone = normalizeSingleLine(payload.phone);
  const addictionConcern = normalizeSingleLine(payload.addictionConcern);
  const preferredContactMethod = normalizeSingleLine(payload.preferredContactMethod);
  const message = normalizeMultiline(payload.message);
  const supportGoals = normalizeSingleLine(payload.supportGoals).slice(0, leadFieldMaxLengths.supportGoals);
  const sourcePage = sanitizeOptionalPath(payload.sourcePage);
  const landingPage = sanitizeOptionalPath(payload.landing_page);
  const referrer = sanitizeOptionalText(payload.referrer, leadFieldMaxLengths.referrer);
  const pageType = sanitizeOptionalText(payload.page_type, leadFieldMaxLengths.pageType);
  const primaryKeyword = sanitizeOptionalText(payload.primary_keyword, leadFieldMaxLengths.primaryKeyword);
  const conversionGoal = sanitizeOptionalText(payload.conversion_goal, leadFieldMaxLengths.conversionGoal);
  const utmSource = sanitizeOptionalText(payload.utm_source, leadFieldMaxLengths.trackingValue) || null;
  const utmMedium = sanitizeOptionalText(payload.utm_medium, leadFieldMaxLengths.trackingValue) || null;
  const utmCampaign = sanitizeOptionalText(payload.utm_campaign, leadFieldMaxLengths.trackingValue) || null;
  const utmTerm = sanitizeOptionalText(payload.utm_term, leadFieldMaxLengths.trackingValue) || null;
  const utmContent = sanitizeOptionalText(payload.utm_content, leadFieldMaxLengths.trackingValue) || null;
  const gclid = sanitizeOptionalText(payload.gclid, leadFieldMaxLengths.trackingValue) || null;
  const urgencyLevel = sanitizeOptionalText(payload.urgencyLevel, leadFieldMaxLengths.urgencyLevel);
  const withdrawalRisk = sanitizeOptionalText(payload.withdrawalRisk, leadFieldMaxLengths.withdrawalRisk);
  const medicalSupportInvolved = sanitizeOptionalText(payload.medicalSupportInvolved, leadFieldMaxLengths.medicalSupportInvolved);
  const callbackWindow = sanitizeOptionalText(payload.callbackWindow, leadFieldMaxLengths.callbackWindow);
  const readinessStage = sanitizeOptionalText(payload.readinessStage, leadFieldMaxLengths.readinessStage);

  const followUpConsentWhatsApp = Boolean(payload.followUpConsentWhatsApp);
  const followUpConsentEmail = Boolean(payload.followUpConsentEmail);
  const followUpConsentPhone = Boolean(payload.followUpConsentPhone);

  const triagePriority = sanitizeOptionalText(payload.triagePriority, leadFieldMaxLengths.triagePriority);
  const riskFlag = sanitizeOptionalText(payload.riskFlag, leadFieldMaxLengths.riskFlag);
  const triageSlaHours =
    typeof payload.triageSlaHours === "number" && Number.isFinite(payload.triageSlaHours) ? Math.max(1, Math.min(72, Math.round(payload.triageSlaHours))) : undefined;

  if (!fullName || fullName.length < 2 || fullName.length > leadFieldMaxLengths.fullName) {
    return { ok: false, status: 400, error: "Please enter your full name." };
  }

  if (!email || email.length > leadFieldMaxLengths.email || !EMAIL_PATTERN.test(email)) {
    return { ok: false, status: 400, error: "Please enter a valid email address." };
  }

  if (!phone || !PHONE_PATTERN.test(phone) || phone.length > leadFieldMaxLengths.phone) {
    return { ok: false, status: 400, error: "Please enter a valid phone or WhatsApp number." };
  }

  if (!allowedAddictionConcerns.has(addictionConcern)) {
    return { ok: false, status: 400, error: "Please select a valid addiction concern." };
  }

  if (!allowedContactMethods.has(preferredContactMethod)) {
    return { ok: false, status: 400, error: "Please select a valid preferred contact method." };
  }

  if (message.length > leadFieldMaxLengths.message) {
    return {
      ok: false,
      status: 400,
      error: `Please keep your message under ${leadFieldMaxLengths.message} characters.`,
    };
  }

  if (urgencyLevel && !allowedUrgencyLevels.has(urgencyLevel)) {
    return { ok: false, status: 400, error: "Please select a valid urgency level." };
  }

  if (withdrawalRisk && !allowedWithdrawalRisk.has(withdrawalRisk)) {
    return { ok: false, status: 400, error: "Please select a valid withdrawal support level." };
  }

  if (medicalSupportInvolved && !allowedMedicalSupportInvolved.has(medicalSupportInvolved)) {
    return { ok: false, status: 400, error: "Please select a valid medical support option." };
  }

  if (callbackWindow && !allowedCallbackWindow.has(callbackWindow)) {
    return { ok: false, status: 400, error: "Please select a valid callback window." };
  }

  if (readinessStage && !allowedReadinessStage.has(readinessStage)) {
    return { ok: false, status: 400, error: "Please select a valid readiness stage." };
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
      message,
      supportGoals: supportGoals || undefined,
      urgencyLevel: urgencyLevel ? (urgencyLevel as LeadPayload["urgencyLevel"]) : undefined,
      withdrawalRisk: withdrawalRisk ? (withdrawalRisk as LeadPayload["withdrawalRisk"]) : undefined,
      medicalSupportInvolved: medicalSupportInvolved ? (medicalSupportInvolved as LeadPayload["medicalSupportInvolved"]) : undefined,
      callbackWindow: callbackWindow ? (callbackWindow as LeadPayload["callbackWindow"]) : undefined,
      readinessStage: readinessStage ? (readinessStage as LeadPayload["readinessStage"]) : undefined,
      followUpConsentWhatsApp,
      followUpConsentEmail,
      followUpConsentPhone,
      triagePriority: triagePriority ? (triagePriority as LeadPayload["triagePriority"]) : undefined,
      riskFlag: riskFlag ? (riskFlag as LeadPayload["riskFlag"]) : undefined,
      triageSlaHours,
      sourcePage: sourcePage || landingPage,
      landing_page: landingPage || undefined,
      referrer: referrer || undefined,
      page_type: pageType || undefined,
      primary_keyword: primaryKeyword || undefined,
      conversion_goal: conversionGoal || undefined,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      gclid,
    },
  };
}
