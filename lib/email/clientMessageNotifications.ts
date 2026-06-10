import {
  formatClientMessageEmailHtml,
  formatClientMessageEmailSubject,
  formatClientMessageEmailText,
  type ClientMessageEmailPayload,
} from "@/lib/email/formatClientMessageEmail";
import { getLeadNotificationEmail, getResendFromEmail, isResendConfigured } from "@/lib/email/resend";
import { Resend } from "resend";

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

async function sendClientMessageEmail(
  to: string,
  replyTo: string | undefined,
  toTherapist: boolean,
  senderName: string,
  payload: ClientMessageEmailPayload,
) {
  const resend = getResendClient();
  if (!resend || !isResendConfigured()) {
    return;
  }

  const subject = formatClientMessageEmailSubject(senderName, toTherapist);
  const text = formatClientMessageEmailText(payload);
  const html = formatClientMessageEmailHtml(payload);

  const { error } = await resend.emails.send({
    from: getResendFromEmail(),
    to: [to],
    replyTo,
    subject,
    text,
    html,
  });

  if (error) {
    console.error("Secure message email failed:", error.message);
  }
}

export async function sendTherapistMessageNotification(input: {
  clientName: string;
  clientEmail: string;
  body: string;
  adminMessagesUrl: string;
}) {
  const therapistEmail = getLeadNotificationEmail();
  const senderName = input.clientName.trim() || input.clientEmail || "A client";

  await sendClientMessageEmail(
    therapistEmail,
    input.clientEmail || undefined,
    true,
    senderName,
    {
      recipientName: "Gerald",
      senderName,
      body: input.body,
      eyebrow: "Client portal message",
      title: "New secure message from a client",
      intro: `${senderName} sent a message in the private client portal.`,
      actionLabel: "Open client messages",
      actionHref: input.adminMessagesUrl,
      footerNote: "This is not for emergencies. Reply in the admin dashboard or contact the client through your usual clinical process.",
    },
  );
}

export async function sendClientMessageNotification(input: {
  clientEmail: string;
  clientName: string;
  therapistName: string;
  body: string;
  portalMessagesUrl: string;
}) {
  const senderName = input.therapistName.trim() || "Gerald Crawford";

  await sendClientMessageEmail(
    input.clientEmail,
    getLeadNotificationEmail(),
    false,
    senderName,
    {
      recipientName: input.clientName,
      senderName,
      body: input.body,
      eyebrow: "Client portal message",
      title: "You have a new secure message",
      intro: `${senderName} replied in your private client portal.`,
      actionLabel: "Open secure messages",
      actionHref: input.portalMessagesUrl,
      footerNote: "Sign in to your client portal to read the full thread. This email is not for emergencies.",
    },
  );
}
