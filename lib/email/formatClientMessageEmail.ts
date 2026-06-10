import { absoluteUrl } from "@/lib/constants";
import { brandEmailColors, escapeAttribute, escapeHtml, renderBrandEmailButton } from "@/lib/email/brandEmailLayout";

export type ClientMessageEmailPayload = {
  recipientName: string;
  senderName: string;
  body: string;
  actionLabel: string;
  actionHref: string;
  eyebrow: string;
  title: string;
  intro: string;
  footerNote: string;
};

function truncateMessage(body: string, maxLength = 480) {
  const trimmed = body.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}

function renderMessagePreview(body: string) {
  const preview = truncateMessage(body);
  return `<div style="margin:18px 0 0;padding:16px 18px;border-radius:16px;background:${brandEmailColors.whiteCard};border:1px solid ${brandEmailColors.whiteCardBorder};color:${brandEmailColors.ink};font-size:15px;line-height:1.7;white-space:pre-wrap;">${escapeHtml(preview)}</div>`;
}

export function formatClientMessageEmailSubject(senderName: string, toTherapist: boolean) {
  if (toTherapist) {
    return `New client portal message from ${senderName}`;
  }
  return `New secure message from ${senderName}`;
}

export function formatClientMessageEmailText(payload: ClientMessageEmailPayload) {
  return [
    payload.title,
    "",
    payload.intro,
    "",
    truncateMessage(payload.body),
    "",
    `${payload.actionLabel}: ${payload.actionHref}`,
    "",
    payload.footerNote,
    "",
    absoluteUrl("/"),
  ].join("\n");
}

export function formatClientMessageEmailHtml(payload: ClientMessageEmailPayload) {
  const logoUrl = absoluteUrl("/icon.png");

  return `<!DOCTYPE html>
<html lang="en">
  <body style="margin:0;padding:0;background:${brandEmailColors.pageBackground};color:${brandEmailColors.ink};font-family:Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <div style="background:${brandEmailColors.pageBackground};padding:32px 16px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;width:100%;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:640px;width:100%;">
              <tr>
                <td style="padding:0 0 18px;text-align:center;">
                  <img src="${escapeAttribute(logoUrl)}" alt="Healing From Your Addiction" width="48" height="48" style="display:block;margin:0 auto 12px;border-radius:12px;" />
                  <div style="color:${brandEmailColors.gold};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(payload.eyebrow)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 18px;">
                  <div style="background:${brandEmailColors.cardBackground};border:1px solid ${brandEmailColors.cardBorder};border-radius:26px;padding:28px;box-shadow:0 18px 45px rgba(15,91,82,0.12);">
                    <h1 style="margin:0 0 12px;color:${brandEmailColors.ink};font-size:28px;line-height:1.15;font-weight:700;">${escapeHtml(payload.title)}</h1>
                    <p style="margin:0;color:${brandEmailColors.muted};font-size:16px;line-height:1.75;">${escapeHtml(payload.intro)}</p>
                    ${renderMessagePreview(payload.body)}
                    ${renderBrandEmailButton(payload.actionLabel, payload.actionHref)}
                    <p style="margin:20px 0 0;color:${brandEmailColors.muted};font-size:14px;line-height:1.7;">${escapeHtml(payload.footerNote)}</p>
                  </div>
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
