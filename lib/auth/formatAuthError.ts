/**
 * Maps Supabase Auth API errors to calm, actionable portal copy.
 */
export function formatAuthError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit") || normalized.includes("over_email_send_rate_limit")) {
    return "Too many sign-in or reset emails were sent recently. Wait about an hour, then try again. If this keeps happening, custom SMTP must be enabled in Supabase (see docs/SUPABASE_AUTH_EMAIL.md).";
  }

  if (normalized.includes("invalid") && normalized.includes("expired")) {
    return "This link is invalid or has expired. Request a new password reset link and open it once.";
  }

  if (
    normalized.includes("error sending recovery email") ||
    normalized.includes("error sending confirmation email") ||
    normalized.includes("error sending")
  ) {
    return "We could not send the email because Supabase SMTP is misconfigured. In Supabase → Authentication → SMTP Settings, set Username to resend (literally) and Password to your Resend API key (re_...). See docs/SUPABASE_AUTH_EMAIL.md.";
  }

  return message;
}
