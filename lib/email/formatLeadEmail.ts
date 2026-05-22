import type { LeadPayload } from "@/lib/leads/types";

function formatLine(label: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : "";
}

export function formatLeadEmailSubject(lead: LeadPayload) {
  const concern = lead.addictionConcern?.trim() || "Addiction support";
  return `New enquiry — ${concern}`;
}

export function formatLeadEmailText(lead: LeadPayload) {
  const lines = [
    "A new confidential enquiry was submitted on Healing From Your Addiction.",
    "",
    formatLine("Name", lead.fullName),
    formatLine("Email", lead.email),
    formatLine("Phone / WhatsApp", lead.phone),
    formatLine("Addiction concern", lead.addictionConcern),
    formatLine("Preferred contact", lead.preferredContactMethod),
    formatLine("Message", lead.message),
    formatLine("Source page", lead.sourcePage || lead.landing_page),
    "",
    "--- Attribution ---",
    formatLine("Referrer", lead.referrer),
    formatLine("Page type", lead.page_type),
    formatLine("Primary keyword", lead.primary_keyword),
    formatLine("Conversion goal", lead.conversion_goal),
    formatLine("UTM source", lead.utm_source ?? undefined),
    formatLine("UTM medium", lead.utm_medium ?? undefined),
    formatLine("UTM campaign", lead.utm_campaign ?? undefined),
    formatLine("UTM term", lead.utm_term ?? undefined),
    formatLine("UTM content", lead.utm_content ?? undefined),
    formatLine("GCLID", lead.gclid ?? undefined),
    "",
    "Reply using the visitor's preferred contact method.",
  ].filter(Boolean);

  return lines.join("\n");
}

export function formatLeadEmailHtml(lead: LeadPayload) {
  const text = formatLeadEmailText(lead);
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return `<pre style="font-family:ui-sans-serif,system-ui,sans-serif;font-size:14px;line-height:1.5;white-space:pre-wrap;">${escaped}</pre>`;
}
