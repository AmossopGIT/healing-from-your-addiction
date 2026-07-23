import { Resend } from "resend";
import { getResendFromEmail, isResendConfigured } from "@/lib/email/resend";
import { siteConfig } from "@/lib/constants";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export async function sendConsultationFormEmail(input: {
  to: string;
  clientName: string;
  portalUrl: string;
}): Promise<{ ok: true; emailId?: string } | { ok: false; error: string }> {
  const resend = getResendClient();
  if (!resend || !isResendConfigured()) {
    return { ok: false, error: "email-not-configured" };
  }

  const subject = "Your hypnotherapy consultation form";
  const text = [
    `Hello ${input.clientName},`,
    "",
    "Gerald has invited you to complete your hypnotherapy consultation and informed consent form before your sessions begin.",
    "",
    `You can fill it in online here: ${input.portalUrl}`,
    "",
    "You can also download a blank PDF from that page, complete it offline, and upload it when ready.",
    "",
    "This is not for emergencies. If you feel medically unsafe, contact emergency care or your GP immediately.",
    "",
    `— ${siteConfig.name}`,
  ].join("\n");

  const html = `
    <div style="font-family: Georgia, serif; color: #17231f; line-height: 1.6; max-width: 560px;">
      <p>Hello ${escapeHtml(input.clientName)},</p>
      <p>Gerald has invited you to complete your hypnotherapy consultation and informed consent form before your sessions begin.</p>
      <p><a href="${escapeHtml(input.portalUrl)}" style="display:inline-block;padding:12px 18px;background:#0a3f39;color:#fffdfa;text-decoration:none;border-radius:8px;">Open consultation form</a></p>
      <p>You can also download a blank PDF from that page, complete it offline, and upload it when ready.</p>
      <p style="font-size:14px;color:#4a5a54;">This is not for emergencies. If you feel medically unsafe, contact emergency care or your GP immediately.</p>
      <p>— ${escapeHtml(siteConfig.name)}</p>
    </div>
  `;

  const { data, error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [input.to],
    replyTo: siteConfig.email,
    subject,
    text,
    html,
    tags: [{ name: "category", value: "consultation_form" }],
  });

  if (error) {
    return { ok: false, error: error.message || "send-failed" };
  }

  return { ok: true, emailId: data?.id };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
