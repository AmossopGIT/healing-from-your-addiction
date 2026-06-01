import type { Lead, LeadStatus } from "@/types/database";

export type LeadSlaState = "on_track" | "due_soon" | "overdue" | "responded";

const TERMINAL_STATUSES = new Set<LeadStatus>(["enrolled", "closed"]);
const DUE_SOON_MS = 24 * 60 * 60 * 1000;

export const leadSlaStateLabels: Record<LeadSlaState, string> = {
  on_track: "On track",
  due_soon: "Due soon",
  overdue: "Overdue",
  responded: "Responded",
};

function getSlaDeadline(lead: Pick<Lead, "created_at" | "triage_sla_hours">) {
  const hours = lead.triage_sla_hours ?? 24;
  return new Date(lead.created_at).getTime() + hours * 60 * 60 * 1000;
}

export function getLeadSlaState(lead: Lead): LeadSlaState {
  if (lead.first_response_sent_at) {
    return "responded";
  }

  if (TERMINAL_STATUSES.has(lead.status)) {
    return "on_track";
  }

  const now = Date.now();
  const followUpDue = lead.follow_up_due_at ? new Date(lead.follow_up_due_at).getTime() : null;
  const slaDeadline = getSlaDeadline(lead);

  const isFollowUpOverdue = followUpDue !== null && followUpDue < now;
  const isSlaOverdue = slaDeadline < now;

  if (isFollowUpOverdue || isSlaOverdue) {
    return "overdue";
  }

  const followUpDueSoon = followUpDue !== null && followUpDue - now <= DUE_SOON_MS;
  const slaDueSoon = slaDeadline - now <= DUE_SOON_MS;

  if (followUpDueSoon || slaDueSoon) {
    return "due_soon";
  }

  return "on_track";
}

export function isLeadOverdue(lead: Lead) {
  return getLeadSlaState(lead) === "overdue";
}

export function isLeadAwaitingFirstResponse(lead: Lead) {
  return !lead.first_response_sent_at && !TERMINAL_STATUSES.has(lead.status);
}

export function slaBadgeClass(state: LeadSlaState) {
  return `sla-badge sla-badge-${state}`;
}

/** Format ISO timestamp for datetime-local input (local timezone). */
export function formatDatetimeLocalValue(iso: string | null | undefined) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Parse datetime-local input to ISO string, or null if empty/invalid. */
export function parseDatetimeLocalInput(value: string | null | undefined) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}
