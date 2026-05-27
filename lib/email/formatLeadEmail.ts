import { absoluteUrl, emailHref, formatSouthAfricanPhone, normalizeSouthAfricanPhone, phoneHref, siteConfig, siteSocialLinks, whatsappHref } from "@/lib/constants";
import type { LeadPayload } from "@/lib/leads/types";

function formatLine(label: string, value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : "";
}

type ActionLink = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

function formatValue(value: string | null | undefined, fallback = "Not provided") {
  const trimmed = value?.trim();
  return trimmed || fallback;
}

function formatBoolean(value: boolean | undefined, fallback = "Not recorded") {
  return typeof value === "boolean" ? (value ? "Yes" : "No") : fallback;
}

function toAbsoluteHref(href: string) {
  if (/^(https?:|mailto:|tel:)/i.test(href)) {
    return href;
  }

  return absoluteUrl(href);
}

function renderDataRows(rows: Array<{ label: string; value: string | null | undefined }>) {
  return rows
    .map(({ label, value }) => {
      const displayValue = formatValue(value);
      return `
        <tr>
          <td style="padding:0 0 12px;vertical-align:top;width:190px;">
            <div style="color:#5f6f68;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(label)}</div>
          </td>
          <td style="padding:0 0 12px;vertical-align:top;">
            <div style="color:#17231f;font-size:15px;line-height:1.6;">${escapeHtml(displayValue)}</div>
          </td>
        </tr>`;
    })
    .join("");
}

function renderActionButton(label: string, href: string, variant: "primary" | "secondary" = "secondary") {
  const styles =
    variant === "primary"
      ? "background:linear-gradient(135deg,#0f5b52 0%,#0a3f39 100%);border:1px solid #0b4a43;color:#ffffff;"
      : "background:#ffffff;border:1px solid #cfd8d2;color:#0a3f39;";

  return `<a href="${escapeAttribute(href)}" style="display:inline-block;margin:0 10px 10px 0;padding:12px 18px;border-radius:999px;font-size:14px;font-weight:700;line-height:1.2;text-decoration:none;${styles}">${escapeHtml(label)}</a>`;
}

function renderActionRow(actions: ActionLink[]) {
  if (!actions.length) {
    return "";
  }

  return `<div style="margin-top:18px;">${actions
    .map(({ label, href, variant }) => renderActionButton(label, href, variant))
    .join("")}</div>`;
}

function createLeadActionLinks(lead: LeadPayload) {
  const normalizedPhone = normalizeSouthAfricanPhone(lead.phone?.trim() || "");
  const whatsappDigits = normalizedPhone.replace(/\D+/g, "");
  const safeName = lead.fullName?.trim() || "there";

  const actions: ActionLink[] = [];

  if (lead.email?.trim()) {
    actions.push({
      label: "Reply by email",
      href: `mailto:${lead.email.trim()}`,
      variant: "primary",
    });
  }

  if (normalizedPhone) {
    actions.push({
      label: `Call ${formatSouthAfricanPhone(lead.phone || "") || "lead"}`,
      href: `tel:${normalizedPhone}`,
    });
  }

  if (whatsappDigits) {
    actions.push({
      label: "Open WhatsApp",
      href: `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(`Hello ${safeName}, thank you for your confidential enquiry with Healing From Your Addiction.`)}`,
    });
  }

  return actions;
}

function createSiteActionLinks() {
  const contactUrl = absoluteUrl("/contact/");
  const websiteUrl = absoluteUrl("/");

  return [
    { label: "Visit website", href: websiteUrl, variant: "primary" as const },
    { label: "Contact page", href: contactUrl },
    { label: "Email", href: toAbsoluteHref(emailHref("Confidential addiction support enquiry")) },
    { label: "Phone", href: toAbsoluteHref(phoneHref()) },
    { label: "WhatsApp", href: toAbsoluteHref(whatsappHref()) },
  ];
}

export function formatLeadEmailSubject(lead: LeadPayload) {
  const concern = lead.addictionConcern?.trim() || "Addiction support";
  return `New enquiry — ${concern}`;
}

export function formatLeadEmailText(lead: LeadPayload) {
  const lines = [
    "A new confidential enquiry was submitted on Healing From Your Addiction.",
    "",
    "--- Triage summary ---",
    formatLine("Triage priority", lead.triagePriority),
    formatLine("Risk flag", lead.riskFlag),
    formatLine("Target response SLA (hours)", lead.triageSlaHours ? String(lead.triageSlaHours) : undefined),
    formatLine("Urgency level", lead.urgencyLevel),
    formatLine("Withdrawal support level", lead.withdrawalRisk),
    formatLine("Medical support involved", lead.medicalSupportInvolved),
    formatLine("Best callback window", lead.callbackWindow),
    formatLine("Readiness stage", lead.readinessStage),
    "",
    formatLine("Name", lead.fullName),
    formatLine("Email", lead.email),
    formatLine("Phone / WhatsApp", lead.phone),
    formatLine("Addiction concern", lead.addictionConcern),
    formatLine("Preferred contact", lead.preferredContactMethod),
    formatLine("Message", lead.message),
    formatLine("Support goals", lead.supportGoals),
    formatLine("Follow-up consent WhatsApp", typeof lead.followUpConsentWhatsApp === "boolean" ? (lead.followUpConsentWhatsApp ? "Yes" : "No") : undefined),
    formatLine("Follow-up consent Email", typeof lead.followUpConsentEmail === "boolean" ? (lead.followUpConsentEmail ? "Yes" : "No") : undefined),
    formatLine("Follow-up consent Phone", typeof lead.followUpConsentPhone === "boolean" ? (lead.followUpConsentPhone ? "Yes" : "No") : undefined),
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
    "--- HFYA contact links ---",
    formatLine("Website", absoluteUrl("/")),
    formatLine("Contact page", absoluteUrl("/contact/")),
    formatLine("Email", siteConfig.email),
    formatLine("Phone", formatSouthAfricanPhone(siteConfig.phone) || siteConfig.phone),
    formatLine("WhatsApp", toAbsoluteHref(whatsappHref())),
    formatLine("Facebook", siteSocialLinks.facebook),
    formatLine("Instagram", siteSocialLinks.instagram),
    "",
    "Reply using the visitor's preferred contact method.",
  ].filter(Boolean);

  return lines.join("\n");
}

export function formatLeadEmailHtml(lead: LeadPayload) {
  const preferredContact = formatValue(lead.preferredContactMethod, "No preference shared");
  const sourcePage = formatValue(lead.sourcePage || lead.landing_page);
  const leadActions = createLeadActionLinks(lead);
  const siteActions = createSiteActionLinks();
  const sitePhone = formatSouthAfricanPhone(siteConfig.phone) || siteConfig.phone;
  const message = formatValue(lead.message, "No additional message was provided.");
  const concern = formatValue(lead.addictionConcern, "Addiction support");
  const supportGoals = formatValue(lead.supportGoals, "No specific goals shared yet.");

  const enquiryRows = renderDataRows([
    { label: "Name", value: lead.fullName },
    { label: "Email", value: lead.email },
    { label: "Phone / WhatsApp", value: lead.phone },
    { label: "Addiction concern", value: concern },
    { label: "Preferred contact", value: preferredContact },
    { label: "Source page", value: sourcePage },
    { label: "Emergency notice acknowledged", value: formatBoolean(lead.consentEmergencyAcknowledged) },
  ]);

  const triageRows = renderDataRows([
    { label: "Triage priority", value: lead.triagePriority },
    { label: "Risk flag", value: lead.riskFlag },
    { label: "Target response SLA (hours)", value: lead.triageSlaHours ? String(lead.triageSlaHours) : undefined },
    { label: "Urgency level", value: lead.urgencyLevel },
    { label: "Withdrawal support level", value: lead.withdrawalRisk },
    { label: "Medical support involved", value: lead.medicalSupportInvolved },
    { label: "Best callback window", value: lead.callbackWindow },
    { label: "Readiness stage", value: lead.readinessStage },
    { label: "Follow-up consent WhatsApp", value: formatBoolean(lead.followUpConsentWhatsApp) },
    { label: "Follow-up consent Email", value: formatBoolean(lead.followUpConsentEmail) },
    { label: "Follow-up consent Phone", value: formatBoolean(lead.followUpConsentPhone) },
  ]);

  const attributionRows = renderDataRows([
    { label: "Referrer", value: lead.referrer },
    { label: "Page type", value: lead.page_type },
    { label: "Primary keyword", value: lead.primary_keyword },
    { label: "Conversion goal", value: lead.conversion_goal },
    { label: "UTM source", value: lead.utm_source ?? undefined },
    { label: "UTM medium", value: lead.utm_medium ?? undefined },
    { label: "UTM campaign", value: lead.utm_campaign ?? undefined },
    { label: "UTM term", value: lead.utm_term ?? undefined },
    { label: "UTM content", value: lead.utm_content ?? undefined },
    { label: "GCLID", value: lead.gclid ?? undefined },
  ]);

  return `
  <!DOCTYPE html>
  <html lang="en">
    <body style="margin:0;padding:0;background:#f8f4ec;color:#17231f;font-family:Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
      <div style="background:#f8f4ec;padding:32px 16px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:720px;width:100%;">
                <tr>
                  <td style="padding:0 0 18px;">
                    <div style="color:#b1842f;font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">New confidential enquiry</div>
                    <h1 style="margin:10px 0 8px;color:#17231f;font-size:30px;line-height:1.1;font-weight:700;">${escapeHtml(formatValue(lead.fullName, "New visitor enquiry"))}</h1>
                    <p style="margin:0;color:#5f6f68;font-size:16px;line-height:1.7;">
                      A new enquiry was submitted on <a href="${escapeAttribute(absoluteUrl("/"))}" style="color:#0a3f39;font-weight:700;text-decoration:none;">Healing From Your Addiction</a>.
                      The preferred contact method is <strong style="color:#0f5b52;">${escapeHtml(preferredContact)}</strong>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <div style="background:linear-gradient(180deg,#fffaf2 0%,#efe6d7 100%);border:1px solid rgba(15,91,82,0.10);border-radius:26px;padding:24px;box-shadow:0 18px 45px rgba(15,91,82,0.12);">
                      <div style="display:inline-block;margin-bottom:14px;padding:6px 12px;border-radius:999px;background:#dcebe7;color:#0a3f39;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(concern)}</div>
                      <p style="margin:0;color:#17231f;font-size:17px;line-height:1.75;">${escapeHtml(message)}</p>
                      <p style="margin:14px 0 0;color:#0a3f39;font-size:15px;line-height:1.7;"><strong>Support goals:</strong> ${escapeHtml(supportGoals)}</p>
                      ${renderActionRow(leadActions)}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#fffdf9;border:1px solid #d8ded7;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:24px 24px 8px;">
                          <h2 style="margin:0;color:#17231f;font-size:22px;line-height:1.2;">Triage summary</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 24px 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            ${triageRows}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#fffdf9;border:1px solid #d8ded7;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:24px 24px 8px;">
                          <h2 style="margin:0;color:#17231f;font-size:22px;line-height:1.2;">Lead details</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 24px 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            ${enquiryRows}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#fffdf9;border:1px solid #d8ded7;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:24px 24px 8px;">
                          <h2 style="margin:0;color:#17231f;font-size:22px;line-height:1.2;">Attribution</h2>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:8px 24px 12px;">
                          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
                            ${attributionRows}
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 18px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:#0e2420;border-radius:20px;overflow:hidden;">
                      <tr>
                        <td style="padding:24px;">
                          <h2 style="margin:0 0 10px;color:#ffffff;font-size:22px;line-height:1.2;">Healing From Your Addiction</h2>
                          <p style="margin:0 0 16px;color:rgba(255,255,255,0.82);font-size:15px;line-height:1.7;">
                            ${escapeHtml(siteConfig.owner)} provides confidential hypnotherapy, EFT and pattern-focused addiction support in South Africa.
                          </p>
                          ${renderActionRow(siteActions)}
                          <p style="margin:14px 0 0;color:rgba(255,255,255,0.74);font-size:13px;line-height:1.7;">
                            Contact: <a href="${escapeAttribute(toAbsoluteHref(emailHref("Confidential addiction support enquiry")))}" style="color:#f2e4c7;text-decoration:none;">${escapeHtml(siteConfig.email)}</a>
                            &nbsp;&middot;&nbsp;
                            <a href="${escapeAttribute(toAbsoluteHref(phoneHref()))}" style="color:#f2e4c7;text-decoration:none;">${escapeHtml(sitePhone)}</a>
                          </p>
                          <p style="margin:10px 0 0;color:rgba(255,255,255,0.74);font-size:13px;line-height:1.7;">
                            Follow:
                            <a href="${escapeAttribute(siteSocialLinks.facebook)}" style="color:#f2e4c7;text-decoration:none;">Facebook</a>
                            &nbsp;&middot;&nbsp;
                            <a href="${escapeAttribute(siteSocialLinks.instagram)}" style="color:#f2e4c7;text-decoration:none;">Instagram</a>
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
  </html>`;
}
