import type { AnalyticsBundle, AnalyticsRange } from "@/lib/analytics/types";
import { formatAnalyticsRangeLabel, rangeToStartIso } from "@/lib/analytics/types";
import { createClient } from "@/lib/supabase/server";
import type { AnalyticsEvent, Lead } from "@/types/database";

const FUNNEL_STEPS = [
  { step: "page_view", label: "Page views" },
  { step: "lead_form_start", label: "Form started" },
  { step: "lead_form_submit", label: "Form submitted" },
  { step: "thank_you_view", label: "Thank-you reached" },
] as const;

const FORM_LABELS: Record<string, string> = {
  addiction_enquiry: "Addiction enquiry form",
  need_help_wizard: "Need help wizard",
  chat_widget: "Chat widget",
};

const CTA_EVENT_TYPES = {
  cta_click: "cta",
  whatsapp_click: "whatsapp",
  email_click: "email",
  phone_click: "phone",
  programme_card_click: "programme",
} as const;

function dateKey(iso: string) {
  return iso.slice(0, 10);
}

function countUniqueSessions(events: AnalyticsEvent[]) {
  const ids = new Set<string>();
  for (const event of events) {
    if (event.session_id) ids.add(event.session_id);
  }
  return ids.size;
}

function buildDailySeries(events: AnalyticsEvent[]) {
  const map = new Map<string, AnalyticsBundle["dailySeries"][number]>();

  for (const event of events) {
    const key = dateKey(event.occurred_at);
    const row = map.get(key) ?? {
      date: key,
      pageViews: 0,
      sessions: 0,
      conversions: 0,
      preConsentViews: 0,
      postConsentViews: 0,
    };

    if (event.event_name === "page_view") {
      row.pageViews += 1;
      if (event.consent_tier === "essential") row.preConsentViews += 1;
      if (event.consent_tier === "analytics") row.postConsentViews += 1;
    }
    if (event.event_name === "lead_form_submit" || event.event_name === "thank_you_view") {
      row.conversions += 1;
    }

    map.set(key, row);
  }

  const sessionMap = new Map<string, Set<string>>();
  for (const event of events) {
    if (!event.session_id) continue;
    const key = dateKey(event.occurred_at);
    const set = sessionMap.get(key) ?? new Set<string>();
    set.add(event.session_id);
    sessionMap.set(key, set);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, row]) => ({
      ...row,
      sessions: sessionMap.get(key)?.size ?? 0,
    }));
}

function buildTopPages(events: AnalyticsEvent[]) {
  const map = new Map<string, { views: number; conversions: number }>();

  for (const event of events) {
    const current = map.get(event.page_path) ?? { views: 0, conversions: 0 };
    if (event.event_name === "page_view") current.views += 1;
    if (event.event_name === "lead_form_submit" || event.event_name === "thank_you_view") {
      current.conversions += 1;
    }
    map.set(event.page_path, current);
  }

  return [...map.entries()]
    .map(([path, stats]) => ({ path, ...stats }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 12);
}

function buildPageEngagement(events: AnalyticsEvent[]) {
  const map = new Map<
    string,
    {
      pageType: string | null;
      views: number;
      linkClicks: number;
      outboundClicks: number;
      scroll75: number;
      scroll100: number;
      timeSamples: number;
      totalTimeSeconds: number;
    }
  >();

  for (const event of events) {
    const row = map.get(event.page_path) ?? {
      pageType: event.page_type,
      views: 0,
      linkClicks: 0,
      outboundClicks: 0,
      scroll75: 0,
      scroll100: 0,
      timeSamples: 0,
      totalTimeSeconds: 0,
    };

    if (event.page_type && !row.pageType) row.pageType = event.page_type;
    if (event.event_name === "page_view") row.views += 1;
    if (event.event_name === "link_click") row.linkClicks += 1;
    if (event.event_name === "outbound_click") row.outboundClicks += 1;
    if (event.event_name === "scroll_depth") {
      const depth = event.properties?.depth_percent;
      if (depth === 75 || depth === 90) row.scroll75 += 1;
      if (depth === 100) row.scroll100 += 1;
    }
    if (event.event_name === "time_on_page") {
      const duration = event.properties?.duration_seconds;
      if (typeof duration === "number" && duration > 0) {
        row.timeSamples += 1;
        row.totalTimeSeconds += duration;
      }
    }

    map.set(event.page_path, row);
  }

  return [...map.entries()]
    .map(([path, stats]) => ({
      path,
      pageType: stats.pageType,
      views: stats.views,
      linkClicks: stats.linkClicks,
      outboundClicks: stats.outboundClicks,
      scroll75: stats.scroll75,
      scroll100: stats.scroll100,
      timeSamples: stats.timeSamples,
      totalTimeSeconds: stats.totalTimeSeconds,
      avgTimeSeconds: stats.timeSamples > 0 ? Math.round(stats.totalTimeSeconds / stats.timeSamples) : 0,
    }))
    .sort((a, b) => b.views - a.views || b.totalTimeSeconds - a.totalTimeSeconds)
    .slice(0, 20);
}

function buildTimeOnPageSummary(events: AnalyticsEvent[]) {
  let totalSeconds = 0;
  let samples = 0;

  for (const event of events) {
    if (event.event_name !== "time_on_page") continue;
    const duration = event.properties?.duration_seconds;
    if (typeof duration !== "number" || duration <= 0) continue;
    totalSeconds += duration;
    samples += 1;
  }

  return {
    avgTimeOnPageSeconds: samples > 0 ? Math.round(totalSeconds / samples) : 0,
    totalEngagedMinutes: Math.round(totalSeconds / 60),
  };
}

function buildScrollDepth(events: AnalyticsEvent[]) {
  const counts = new Map<number, number>();
  for (const milestone of [25, 50, 75, 90, 100]) counts.set(milestone, 0);

  for (const event of events) {
    if (event.event_name !== "scroll_depth") continue;
    const depth = event.properties?.depth_percent;
    if (typeof depth !== "number") continue;
    counts.set(depth, (counts.get(depth) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([milestone, count]) => ({ milestone, count }))
    .sort((a, b) => a.milestone - b.milestone);
}

function buildTopLinks(events: AnalyticsEvent[]) {
  const map = new Map<string, { label: string; destination: string; section: string; clicks: number }>();

  for (const event of events) {
    if (event.event_name !== "link_click" && event.event_name !== "outbound_click") continue;

    const label = typeof event.properties?.link_text === "string" ? event.properties.link_text : "(no label)";
    const destination =
      typeof event.properties?.destination_path === "string"
        ? event.properties.destination_path
        : typeof event.properties?.link_href === "string"
          ? event.properties.link_href
          : "unknown";
    const section = typeof event.properties?.link_section === "string" ? event.properties.link_section : "content";
    const key = `${label}::${destination}::${section}`;
    const current = map.get(key) ?? { label, destination, section, clicks: 0 };
    current.clicks += 1;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 15);
}

function getFormKey(event: AnalyticsEvent) {
  const formName = event.properties?.form_name;
  if (typeof formName === "string" && formName.trim()) return formName.trim();
  if (event.event_name.startsWith("need_help_wizard")) return "need_help_wizard";
  if (event.event_name.startsWith("chat_widget")) return "chat_widget";
  if (event.event_name.startsWith("lead_form")) return "addiction_enquiry";
  return null;
}

function buildFormBreakdown(events: AnalyticsEvent[]) {
  const map = new Map<
    string,
    { starts: number; submitAttempts: number; submits: number; safetyAcks: number; errors: number }
  >();

  for (const event of events) {
    const formKey = getFormKey(event);
    if (!formKey) continue;

    const row = map.get(formKey) ?? {
      starts: 0,
      submitAttempts: 0,
      submits: 0,
      safetyAcks: 0,
      errors: 0,
    };

    if (
      event.event_name === "lead_form_start" ||
      event.event_name === "need_help_wizard_start" ||
      event.event_name === "chat_widget_start"
    ) {
      row.starts += 1;
    }
    if (
      event.event_name === "need_help_wizard_submit_attempt" ||
      event.event_name === "chat_widget_submit_attempt"
    ) {
      row.submitAttempts += 1;
    }
    if (event.event_name === "lead_form_submit" || event.event_name === "chat_widget_submit_success") {
      row.submits += 1;
    }
    if (event.event_name === "lead_form_safety_acknowledged") row.safetyAcks += 1;
    if (
      event.event_name === "need_help_wizard_submit_error" ||
      event.event_name === "chat_widget_submit_error"
    ) {
      row.errors += 1;
    }

    map.set(formKey, row);
  }

  return [...map.entries()]
    .map(([formKey, stats]) => ({
      formKey,
      label: FORM_LABELS[formKey] ?? formKey,
      ...stats,
      completionRate: stats.starts > 0 ? Math.round((stats.submits / stats.starts) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.starts - a.starts || b.submits - a.submits);
}

function buildCtaBreakdown(events: AnalyticsEvent[]) {
  const map = new Map<string, AnalyticsBundle["ctas"][number]>();

  for (const event of events) {
    const type = CTA_EVENT_TYPES[event.event_name as keyof typeof CTA_EVENT_TYPES];
    if (!type) continue;

    const name =
      (typeof event.properties?.cta_name === "string" && event.properties.cta_name) ||
      (typeof event.properties?.programme_name === "string" && event.properties.programme_name) ||
      (typeof event.properties?.link_location === "string" && event.properties.link_location) ||
      "Unknown";
    const location =
      (typeof event.properties?.cta_location === "string" && event.properties.cta_location) ||
      (typeof event.properties?.link_location === "string" && event.properties.link_location) ||
      "unknown";

    const key = `${type}::${name}::${location}`;
    const current = map.get(key) ?? { name, type, location, clicks: 0 };
    current.clicks += 1;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.clicks - a.clicks).slice(0, 20);
}

function countFormStarts(events: AnalyticsEvent[]) {
  return events.filter(
    (event) =>
      event.event_name === "lead_form_start" ||
      event.event_name === "need_help_wizard_start" ||
      event.event_name === "chat_widget_start",
  ).length;
}

function countFormSubmits(events: AnalyticsEvent[]) {
  return events.filter(
    (event) => event.event_name === "lead_form_submit" || event.event_name === "chat_widget_submit_success",
  ).length;
}

function countCtaClicks(events: AnalyticsEvent[]) {
  return events.filter((event) => event.event_name in CTA_EVENT_TYPES).length;
}

function buildTopEvents(events: AnalyticsEvent[]) {
  const map = new Map<string, { count: number; essentialCount: number; analyticsCount: number }>();

  for (const event of events) {
    const current = map.get(event.event_name) ?? { count: 0, essentialCount: 0, analyticsCount: 0 };
    current.count += 1;
    if (event.consent_tier === "essential") current.essentialCount += 1;
    if (event.consent_tier === "analytics") current.analyticsCount += 1;
    map.set(event.event_name, current);
  }

  return [...map.entries()]
    .map(([eventName, stats]) => ({ event: eventName, ...stats }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);
}

function buildFunnel(events: AnalyticsEvent[]) {
  const counts = new Map<string, number>();
  for (const { step } of FUNNEL_STEPS) counts.set(step, 0);

  for (const event of events) {
    if (counts.has(event.event_name)) {
      counts.set(event.event_name, (counts.get(event.event_name) ?? 0) + 1);
    }
  }

  const firstCount = counts.get("page_view") ?? 0;
  return FUNNEL_STEPS.map(({ step, label }) => {
    const count = counts.get(step) ?? 0;
    return {
      step,
      label,
      count,
      rate: firstCount > 0 ? Math.round((count / firstCount) * 1000) / 10 : 0,
    };
  });
}

function buildAttribution(leads: Lead[]) {
  const map = new Map<string, { source: string; medium: string; leads: number; conversions: number }>();

  for (const lead of leads) {
    const source = lead.utm_source || "(direct)";
    const medium = lead.utm_medium || "(none)";
    const key = `${source}::${medium}`;
    const current = map.get(key) ?? { source, medium, leads: 0, conversions: 0 };
    current.leads += 1;
    if (lead.status === "enrolled" || lead.status === "qualified") current.conversions += 1;
    map.set(key, current);
  }

  return [...map.values()].sort((a, b) => b.leads - a.leads).slice(0, 12);
}

function buildLeadVelocity(leads: Lead[]) {
  const map = new Map<string, { newLeads: number; enrolled: number }>();

  for (const lead of leads) {
    const key = dateKey(lead.created_at);
    const row = map.get(key) ?? { newLeads: 0, enrolled: 0 };
    row.newLeads += 1;
    if (lead.status === "enrolled") row.enrolled += 1;
    map.set(key, row);
  }

  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, stats]) => ({ date, ...stats }));
}

function findTopCta(events: AnalyticsEvent[]) {
  const counts = new Map<string, number>();
  for (const event of events) {
    if (event.event_name !== "cta_click") continue;
    const name = typeof event.properties?.cta_name === "string" ? event.properties.cta_name : "Unknown CTA";
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}

function isAnalyticsStorageMissing(message: string) {
  return (
    message.includes("analytics_events") ||
    message.includes("schema cache") ||
    message.includes("PGRST205")
  );
}

function emptyAnalyticsBundle(range: AnalyticsRange, storageMessage: string | null = null): AnalyticsBundle {
  return {
    range,
    rangeLabel: formatAnalyticsRangeLabel(range),
    generatedAt: new Date().toISOString(),
    storageReady: storageMessage === null,
    storageMessage,
    summary: {
      pageViews: 0,
      sessions: 0,
      conversions: 0,
      conversionRate: 0,
      formStarts: 0,
      formSubmits: 0,
      ctaClicks: 0,
      avgTimeOnPageSeconds: 0,
      totalEngagedMinutes: 0,
      preConsentShare: 0,
      postConsentShare: 0,
      topCta: null,
    },
    dailySeries: [],
    topPages: [],
    pageEngagement: [],
    scrollDepth: [25, 50, 75, 90, 100].map((milestone) => ({ milestone, count: 0 })),
    topLinks: [],
    forms: [],
    ctas: [],
    topEvents: [],
    funnel: FUNNEL_STEPS.map(({ step, label }) => ({ step, label, count: 0, rate: 0 })),
    attribution: [],
    leadVelocity: [],
  };
}

function buildAnalyticsBundle(
  range: AnalyticsRange,
  eventRows: AnalyticsEvent[],
  leadRows: Lead[],
): AnalyticsBundle {
  const pageViews = eventRows.filter((event) => event.event_name === "page_view").length;
  const sessions = countUniqueSessions(eventRows);
  const conversions = eventRows.filter(
    (event) => event.event_name === "lead_form_submit" || event.event_name === "thank_you_view",
  ).length;
  const preConsentViews = eventRows.filter(
    (event) => event.event_name === "page_view" && event.consent_tier === "essential",
  ).length;
  const postConsentViews = eventRows.filter(
    (event) => event.event_name === "page_view" && event.consent_tier === "analytics",
  ).length;
  const consentTotal = preConsentViews + postConsentViews;
  const timeOnPage = buildTimeOnPageSummary(eventRows);

  return {
    range,
    rangeLabel: formatAnalyticsRangeLabel(range),
    generatedAt: new Date().toISOString(),
    storageReady: true,
    storageMessage: null,
    summary: {
      pageViews,
      sessions,
      conversions,
      conversionRate: pageViews > 0 ? Math.round((conversions / pageViews) * 1000) / 10 : 0,
      formStarts: countFormStarts(eventRows),
      formSubmits: countFormSubmits(eventRows),
      ctaClicks: countCtaClicks(eventRows),
      avgTimeOnPageSeconds: timeOnPage.avgTimeOnPageSeconds,
      totalEngagedMinutes: timeOnPage.totalEngagedMinutes,
      preConsentShare: consentTotal > 0 ? Math.round((preConsentViews / consentTotal) * 1000) / 10 : 0,
      postConsentShare: consentTotal > 0 ? Math.round((postConsentViews / consentTotal) * 1000) / 10 : 0,
      topCta: findTopCta(eventRows),
    },
    dailySeries: buildDailySeries(eventRows),
    topPages: buildTopPages(eventRows),
    pageEngagement: buildPageEngagement(eventRows),
    scrollDepth: buildScrollDepth(eventRows),
    topLinks: buildTopLinks(eventRows),
    forms: buildFormBreakdown(eventRows),
    ctas: buildCtaBreakdown(eventRows),
    topEvents: buildTopEvents(eventRows),
    funnel: buildFunnel(eventRows),
    attribution: buildAttribution(leadRows),
    leadVelocity: buildLeadVelocity(leadRows),
  };
}

export async function getAnalyticsBundle(range: AnalyticsRange): Promise<AnalyticsBundle> {
  const supabase = await createClient();
  const startIso = rangeToStartIso(range);

  let eventsQuery = supabase
    .from("analytics_events")
    .select("*")
    .order("occurred_at", { ascending: true });

  if (startIso) {
    eventsQuery = eventsQuery.gte("occurred_at", startIso);
  }

  let leadsQuery = supabase.from("leads").select("*").order("created_at", { ascending: true });
  if (startIso) {
    leadsQuery = leadsQuery.gte("created_at", startIso);
  }

  const [{ data: events, error: eventsError }, { data: leads, error: leadsError }] = await Promise.all([
    eventsQuery,
    leadsQuery,
  ]);

  if (eventsError) {
    if (isAnalyticsStorageMissing(eventsError.message)) {
      return emptyAnalyticsBundle(
        range,
        "Analytics storage is not set up yet. Apply migration 008_analytics_events.sql to Supabase.",
      );
    }
    throw new Error(eventsError.message);
  }

  if (leadsError) throw new Error(leadsError.message);

  const eventRows = (events ?? []) as AnalyticsEvent[];
  const leadRows = (leads ?? []) as Lead[];

  return buildAnalyticsBundle(range, eventRows, leadRows);
}

export async function getAnalyticsSummary(range: AnalyticsRange) {
  const bundle = await getAnalyticsBundle(range);
  return {
    range: bundle.range,
    rangeLabel: bundle.rangeLabel,
    summary: bundle.summary,
    dailySeries: bundle.dailySeries,
  };
}
