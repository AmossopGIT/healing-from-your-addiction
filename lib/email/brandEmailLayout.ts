import { absoluteUrl, emailHref, formatSouthAfricanPhone, phoneHref, siteConfig, siteSocialLinks } from "@/lib/constants";

/** Shared palette aligned with lead notification emails and site branding. */
export const brandEmailColors = {
  pageBackground: "#f8f4ec",
  cardBackground: "linear-gradient(180deg,#fffaf2 0%,#efe6d7 100%)",
  cardBorder: "rgba(15,91,82,0.10)",
  ink: "#17231f",
  muted: "#5f6f68",
  accent: "#0a3f39",
  accentBright: "#0f5b52",
  gold: "#b1842f",
  footerBackground: "#0e2420",
  footerText: "rgba(255,255,255,0.82)",
  footerLink: "#f2e4c7",
  whiteCard: "#fffdf9",
  whiteCardBorder: "#d8ded7",
} as const;

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function escapeAttribute(value: string) {
  return escapeHtml(value).replace(/"/g, "&quot;");
}

export function renderBrandEmailButton(label: string, href: string) {
  return `<a href="${escapeAttribute(href)}" style="display:inline-block;margin:18px 0 0;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#0f5b52 0%,#0a3f39 100%);border:1px solid #0b4a43;color:#ffffff;font-size:15px;font-weight:700;line-height:1.2;text-decoration:none;">${escapeHtml(label)}</a>`;
}

type BrandAuthEmailContent = {
  eyebrow: string;
  title: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
  footerNote: string;
  badge?: string;
};

/**
 * Branded HTML shell for transactional auth emails (preview / tooling).
 * Supabase dashboard templates live in `supabase/email-templates/` and use Go syntax (`{{ .ConfirmationURL }}`).
 */
export function renderBrandAuthEmailHtml(content: BrandAuthEmailContent) {
  const siteUrl = absoluteUrl("/");
  const contactUrl = absoluteUrl("/contact/");
  const logoUrl = absoluteUrl("/icon.png");
  const sitePhone = formatSouthAfricanPhone(siteConfig.phone) || siteConfig.phone;
  const badge = content.badge
    ? `<div style="display:inline-block;margin-bottom:14px;padding:6px 12px;border-radius:999px;background:#dcebe7;color:#0a3f39;font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">${escapeHtml(content.badge)}</div>`
    : "";

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
                  <div style="color:${brandEmailColors.gold};font-size:12px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(content.eyebrow)}</div>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 18px;">
                  <div style="background:${brandEmailColors.cardBackground};border:1px solid ${brandEmailColors.cardBorder};border-radius:26px;padding:28px;box-shadow:0 18px 45px rgba(15,91,82,0.12);">
                    ${badge}
                    <h1 style="margin:0 0 12px;color:${brandEmailColors.ink};font-size:28px;line-height:1.15;font-weight:700;">${escapeHtml(content.title)}</h1>
                    <p style="margin:0;color:${brandEmailColors.muted};font-size:16px;line-height:1.75;">${escapeHtml(content.intro)}</p>
                    ${renderBrandEmailButton(content.ctaLabel, content.ctaHref)}
                    <p style="margin:20px 0 0;color:${brandEmailColors.muted};font-size:14px;line-height:1.7;">${escapeHtml(content.footerNote)}</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="padding:0;">
                  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0;background:${brandEmailColors.footerBackground};border-radius:20px;overflow:hidden;">
                    <tr>
                      <td style="padding:24px;">
                        <h2 style="margin:0 0 10px;color:#ffffff;font-size:20px;line-height:1.2;">Healing From Your Addiction</h2>
                        <p style="margin:0 0 14px;color:${brandEmailColors.footerText};font-size:14px;line-height:1.7;">
                          Confidential hypnotherapy and pattern-focused addiction support with ${escapeHtml(siteConfig.owner)} in South Africa.
                        </p>
                        <p style="margin:0;color:${brandEmailColors.footerText};font-size:13px;line-height:1.7;">
                          <a href="${escapeAttribute(siteUrl)}" style="color:${brandEmailColors.footerLink};text-decoration:none;font-weight:700;">Website</a>
                          &nbsp;&middot;&nbsp;
                          <a href="${escapeAttribute(contactUrl)}" style="color:${brandEmailColors.footerLink};text-decoration:none;">Contact</a>
                          &nbsp;&middot;&nbsp;
                          <a href="${escapeAttribute(emailHref())}" style="color:${brandEmailColors.footerLink};text-decoration:none;">${escapeHtml(siteConfig.email)}</a>
                          &nbsp;&middot;&nbsp;
                          <a href="${escapeAttribute(phoneHref())}" style="color:${brandEmailColors.footerLink};text-decoration:none;">${escapeHtml(sitePhone)}</a>
                        </p>
                        <p style="margin:10px 0 0;color:rgba(255,255,255,0.74);font-size:13px;line-height:1.7;">
                          <a href="${escapeAttribute(siteSocialLinks.facebook)}" style="color:${brandEmailColors.footerLink};text-decoration:none;">Facebook</a>
                          &nbsp;&middot;&nbsp;
                          <a href="${escapeAttribute(siteSocialLinks.instagram)}" style="color:${brandEmailColors.footerLink};text-decoration:none;">Instagram</a>
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
