import { programmes } from "@/content/programmes";
import { contactMethods } from "@/lib/constants";
import { leadStatusOptions } from "@/lib/dashboard/constants";
import { leadFieldMaxLengths } from "@/lib/leads/constraints";
import type { LeadStatus, SessionProgressStatus } from "@/types/database";

export const dashboardFieldMaxLengths = {
  noteBody: 2000,
  messageBody: 2000,
  clientNotes: 2000,
  intakeResponse: 2000,
  checkInNote: 500,
  recoveryGoalNote: 120,
  emergencyContact: 160,
  documentLabel: 120,
  redirectPath: 240,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[0-9+()\-\s]{6,32}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const allowedContactMethods = new Set<string>(contactMethods);
const allowedLeadStatuses = new Set<LeadStatus>(leadStatusOptions);
const allowedProgrammeSlugs = new Set<string>(programmes.map((programme) => programme.slug));
const allowedSessionProgressStatuses = new Set<SessionProgressStatus>(["in_progress", "completed"]);

export function normalizeSingleLine(value: string | null | undefined) {
  return (value ?? "")
    .replace(/[\u0000-\u001F\u007F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeMultiline(value: string | null | undefined) {
  return (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, "")
    .trim();
}

export function sanitizeUuid(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  return UUID_PATTERN.test(normalized) ? normalized : "";
}

export function sanitizeRedirectPath(value: string | null | undefined, allowedPrefixes: string[], fallback: string) {
  const normalized = normalizeSingleLine(value).slice(0, dashboardFieldMaxLengths.redirectPath);
  if (!normalized.startsWith("/") || normalized.startsWith("//")) return fallback;
  if (!allowedPrefixes.some((prefix) => normalized.startsWith(prefix))) return fallback;
  return normalized;
}

export function sanitizeLeadStatus(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value) as LeadStatus;
  return allowedLeadStatuses.has(normalized) ? normalized : "";
}

export function sanitizeSessionProgressStatus(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value) as SessionProgressStatus;
  return allowedSessionProgressStatuses.has(normalized) ? normalized : "";
}

export function sanitizeEmail(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value).toLowerCase();
  if (!normalized || normalized.length > leadFieldMaxLengths.email) return "";
  return EMAIL_PATTERN.test(normalized) ? normalized : "";
}

export function sanitizeOptionalPhone(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  if (normalized.length > leadFieldMaxLengths.phone) return "";
  return PHONE_PATTERN.test(normalized) ? normalized : "";
}

export function sanitizeContactMethod(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  return allowedContactMethods.has(normalized) ? normalized : "";
}

export function sanitizeProgrammeSlug(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  return allowedProgrammeSlugs.has(normalized) ? normalized : "";
}

export function sanitizeDateInput(value: string | null | undefined) {
  const normalized = normalizeSingleLine(value);
  if (!normalized) return "";
  return DATE_PATTERN.test(normalized) ? normalized : "";
}
