export type ConsentTier = "essential" | "analytics";

export const ANALYTICS_EVENT_ALLOWLIST = [
  "page_view",
  "session_start",
  "need_help_page_view",
  "need_help_wizard_start",
  "need_help_wizard_step_complete",
  "need_help_wizard_submit_attempt",
  "need_help_wizard_submit_error",
  "lead_form_start",
  "lead_form_submit",
  "lead_form_safety_acknowledged",
  "cta_click",
  "whatsapp_click",
  "email_click",
  "phone_click",
  "programme_card_click",
  "faq_open",
  "thank_you_view",
  "chat_widget_open",
  "chat_widget_start",
  "chat_widget_step_complete",
  "chat_widget_submit_attempt",
  "chat_widget_submit_success",
  "chat_widget_submit_error",
  "chat_widget_handoff_whatsapp",
  "chat_widget_handoff_email",
  "scroll_depth",
  "link_click",
  "outbound_click",
  "time_on_page",
  "blog_post_view",
  "blog_internal_link_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_ALLOWLIST)[number];

const PII_KEYS = new Set([
  "email",
  "phone",
  "full_name",
  "name",
  "message",
  "address",
  "password",
]);

export type AnalyticsEventInput = {
  event_name: string;
  page_path: string;
  occurred_at?: string;
  session_id?: string | null;
  visitor_id?: string | null;
  consent_tier: ConsentTier;
  page_type?: string | null;
  primary_keyword?: string | null;
  conversion_goal?: string | null;
  landing_page?: string | null;
  referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  gclid?: string | null;
  properties?: Record<string, unknown>;
};

export type AnalyticsCollectPayload = {
  events: AnalyticsEventInput[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sanitizeProperties(properties: Record<string, unknown> | undefined) {
  if (!properties) return {};

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (PII_KEYS.has(key.toLowerCase())) continue;
    if (typeof value === "string" && value.length > 500) {
      sanitized[key] = value.slice(0, 500);
      continue;
    }
    sanitized[key] = value;
  }
  return sanitized;
}

function normalizePath(path: string) {
  if (!path) return "/";
  if (path === "/") return path;
  return path.endsWith("/") ? path : `${path}/`;
}

function isPublicPath(path: string) {
  const normalized = normalizePath(path);
  return !normalized.startsWith("/admin/") && !normalized.startsWith("/portal/");
}

export function validateAnalyticsEvent(raw: unknown): AnalyticsEventInput | null {
  if (!isRecord(raw)) return null;

  const eventName = typeof raw.event_name === "string" ? raw.event_name.trim() : "";
  if (!eventName || !ANALYTICS_EVENT_ALLOWLIST.includes(eventName as AnalyticsEventName)) {
    return null;
  }

  const pagePath = typeof raw.page_path === "string" ? normalizePath(raw.page_path.trim()) : "";
  if (!pagePath || !isPublicPath(pagePath)) return null;

  const consentTier = raw.consent_tier;
  if (consentTier !== "essential" && consentTier !== "analytics") return null;

  const optionalString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value.trim().slice(0, 500) : null;

  let occurredAt: string | undefined;
  if (typeof raw.occurred_at === "string") {
    const parsed = Date.parse(raw.occurred_at);
    if (!Number.isNaN(parsed)) {
      occurredAt = new Date(parsed).toISOString();
    }
  }

  return {
    event_name: eventName,
    page_path: pagePath,
    occurred_at: occurredAt,
    session_id: optionalString(raw.session_id),
    visitor_id: optionalString(raw.visitor_id),
    consent_tier: consentTier,
    page_type: optionalString(raw.page_type),
    primary_keyword: optionalString(raw.primary_keyword),
    conversion_goal: optionalString(raw.conversion_goal),
    landing_page: optionalString(raw.landing_page),
    referrer: optionalString(raw.referrer),
    utm_source: optionalString(raw.utm_source),
    utm_medium: optionalString(raw.utm_medium),
    utm_campaign: optionalString(raw.utm_campaign),
    utm_term: optionalString(raw.utm_term),
    utm_content: optionalString(raw.utm_content),
    gclid: optionalString(raw.gclid),
    properties: sanitizeProperties(isRecord(raw.properties) ? raw.properties : undefined),
  };
}

export function validateAnalyticsCollectPayload(raw: unknown): AnalyticsEventInput[] {
  if (!isRecord(raw) || !Array.isArray(raw.events)) return [];

  const validated: AnalyticsEventInput[] = [];
  for (const event of raw.events.slice(0, 25)) {
    const parsed = validateAnalyticsEvent(event);
    if (parsed) validated.push(parsed);
  }
  return validated;
}
