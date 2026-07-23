import type { Lead } from "@/types/database";

type ResponseTemplate = {
  id: string;
  label: string;
  channel: "whatsapp" | "email" | "phone";
  buildMessage: (lead: Lead) => string;
};

export const firstResponseTemplates: ResponseTemplate[] = [
  {
    id: "triage-priority-whatsapp",
    label: "Priority WhatsApp check-in",
    channel: "whatsapp",
    buildMessage: (lead) =>
      `Hi ${lead.full_name}, thank you for your confidential enquiry with Healing From Your Addiction. I reviewed your intake and would like to check in today. If you feel medically unsafe, please contact emergency care or your GP immediately.`,
  },
  {
    id: "standard-email-intro",
    label: "Standard email introduction",
    channel: "email",
    buildMessage: (lead) =>
      `Hello ${lead.full_name}, thank you for your enquiry. I can support you with a structured plan around ${(lead.addiction_concern ?? "your concern").toLowerCase()}. Please share a suitable time in your preferred callback window so we can begin.`,
  },
  {
    id: "phone-prep-script",
    label: "Phone call prep script",
    channel: "phone",
    buildMessage: (lead) =>
      `Call prep for ${lead.full_name}: confirm confidentiality, confirm urgency and withdrawal support needs, confirm current medical support, agree next step and timeframe.`,
  },
];

export function resolveFirstResponseTemplate(lead: Lead) {
  if (lead.first_response_template_id) {
    const selected = firstResponseTemplates.find((template) => template.id === lead.first_response_template_id);
    if (selected) return selected;
  }

  if (lead.triage_priority === "urgent" || lead.triage_priority === "priority") {
    return firstResponseTemplates[0];
  }

  if ((lead.preferred_contact_method ?? "").toLowerCase() === "email") {
    return firstResponseTemplates[1];
  }

  return firstResponseTemplates[2];
}
