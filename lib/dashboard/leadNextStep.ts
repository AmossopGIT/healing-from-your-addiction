import { leadStatusLabels, leadStatusOptions } from "@/lib/dashboard/constants";
import type { Lead, LeadStatus } from "@/types/database";

export type LeadPrimaryAction = "open" | "invite" | "none";

const nextStepByStatus: Record<LeadStatus, string> = {
  new: "Review consent and triage, then send a first response in the allowed channel.",
  triage_review: "Send the first response, mark it sent, and set a follow-up due date.",
  outreach_started: "Continue the conversation and agree the next care pathway.",
  care_pathway_defined: "Confirm they are suitable and willing, then mark Qualified.",
  qualified: "Use Accept & invite client — status alone cannot create portal access.",
  enrolled: "Open the client profile, confirm invite received, then review portal intake.",
  closed: "No further action unless they re-enquire.",
};

const recommendedNextStatus: Partial<Record<LeadStatus, LeadStatus>> = {
  new: "triage_review",
  triage_review: "outreach_started",
  outreach_started: "care_pathway_defined",
  care_pathway_defined: "qualified",
  qualified: "enrolled",
};

export const leadStatusWorkflowLine =
  "New → Triage review → Outreach started → Care pathway defined → Qualified → Enrolled (via invite only) → Closed";

export function formatLeadTriageLabel(
  lead: Pick<Lead, "triage_priority" | "risk_flag">,
): string {
  const priority = lead.triage_priority ?? "routine";
  const risk = lead.risk_flag ?? "standard";

  const priorityLabel =
    priority === "urgent" ? "Urgent" : priority === "priority" ? "Priority" : "Routine";

  if (risk === "urgent_review") {
    return `${priorityLabel} · Urgent review`;
  }
  if (risk === "priority" && priority === "routine") {
    return `${priorityLabel} · Priority risk`;
  }
  if (risk === "priority" && priority === "priority") {
    return "Priority";
  }
  if (risk === "standard" || risk === priority || (risk === "priority" && priority === "urgent")) {
    return priorityLabel;
  }

  return `${priorityLabel} · ${risk.replace(/_/g, " ")}`;
}

export function getLeadNextStepCopy(status: LeadStatus): string {
  return nextStepByStatus[status];
}

export function getRecommendedNextStatus(status: LeadStatus): LeadStatus | null {
  return recommendedNextStatus[status] ?? null;
}

export function getLeadPrimaryAction(lead: Pick<Lead, "status" | "client_id">): LeadPrimaryAction {
  if (lead.client_id || lead.status === "enrolled" || lead.status === "closed") {
    return lead.client_id ? "open" : "none";
  }
  if (lead.status === "qualified" || lead.status === "care_pathway_defined") {
    return "invite";
  }
  return "open";
}

export function canInviteLead(lead: Pick<Lead, "client_id" | "status">): boolean {
  return !lead.client_id && lead.status !== "closed" && lead.status !== "enrolled";
}

export function leadStatusLabel(status: LeadStatus): string {
  return leadStatusLabels[status];
}

export function getLeadStatusOrder(): LeadStatus[] {
  return leadStatusOptions;
}
