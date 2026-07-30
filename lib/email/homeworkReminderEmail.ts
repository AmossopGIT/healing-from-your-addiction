import { Resend } from "resend";
import { getResendFromEmail, isResendConfigured } from "@/lib/email/resend";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

export async function sendHomeworkReminderEmail(input: {
  to: string;
  firstName: string | null;
  portalUrl: string;
}) {
  const resend = getResendClient();
  if (!resend || !isResendConfigured()) {
    return { ok: false as const, error: "Resend not configured" };
  }

  const name = input.firstName?.trim() || "there";
  const subject = "A gentle nudge for today's practice";
  const text = `Hi ${name},

This is a calm reminder that today's EFT or affirmation practice is still open in your portal.

You can mark it done here: ${input.portalUrl}

Small consistent practice is enough.

— Healing From Your Addiction`;

  const html = `<p>Hi ${name},</p>
<p>This is a calm reminder that today's EFT or affirmation practice is still open in your portal.</p>
<p><a href="${input.portalUrl}">Open your daily ritual</a></p>
<p>Small consistent practice is enough.</p>
<p>— Healing From Your Addiction</p>`;

  const { error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [input.to],
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Homework reminder email failed:", error.message);
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const };
}
