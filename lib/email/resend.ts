import { Resend } from "resend";
import { siteConfig } from "@/lib/constants";
import { formatLeadEmailHtml, formatLeadEmailSubject, formatLeadEmailText } from "@/lib/email/formatLeadEmail";
import type { LeadPayload } from "@/lib/leads/types";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getLeadNotificationEmail() {
  return (
    process.env.LEAD_NOTIFICATION_EMAIL?.trim() ||
    process.env.RESEND_TO_EMAIL?.trim() ||
    siteConfig.email
  );
}

export function getResendFromEmail() {
  return process.env.RESEND_FROM_EMAIL?.trim() || `Healing From Your Addiction <${siteConfig.email}>`;
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY?.trim() && getResendFromEmail() && getLeadNotificationEmail());
}

export async function sendLeadNotificationEmail(lead: LeadPayload) {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = getResendFromEmail();
  const to = getLeadNotificationEmail();
  const subject = formatLeadEmailSubject(lead);
  const text = formatLeadEmailText(lead);
  const html = formatLeadEmailHtml(lead);

  const { data, error } = await resend.emails.send({
    from,
    to: [to],
    replyTo: lead.email?.trim() || undefined,
    subject,
    text,
    html,
  });

  if (error) {
    throw new Error(error.message || "Resend failed to send lead notification");
  }

  return data;
}
