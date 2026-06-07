export type AnalyticsRange = 7 | 14 | 30 | 60 | 90 | null;

export type AnalyticsSummary = {
  pageViews: number;
  sessions: number;
  conversions: number;
  conversionRate: number;
  formStarts: number;
  formSubmits: number;
  ctaClicks: number;
  avgTimeOnPageSeconds: number;
  totalEngagedMinutes: number;
  preConsentShare: number;
  postConsentShare: number;
  topCta: string | null;
};

export type AnalyticsFormRow = {
  formKey: string;
  label: string;
  starts: number;
  submitAttempts: number;
  submits: number;
  safetyAcks: number;
  errors: number;
  completionRate: number;
};

export type AnalyticsCtaRow = {
  name: string;
  type: "cta" | "whatsapp" | "email" | "phone" | "programme";
  location: string;
  clicks: number;
};

export type AnalyticsDailyPoint = {
  date: string;
  pageViews: number;
  sessions: number;
  conversions: number;
  preConsentViews: number;
  postConsentViews: number;
};

export type AnalyticsTopPage = {
  path: string;
  views: number;
  conversions: number;
};

export type AnalyticsPageEngagement = {
  path: string;
  pageType: string | null;
  views: number;
  linkClicks: number;
  outboundClicks: number;
  scroll75: number;
  scroll100: number;
  timeSamples: number;
  totalTimeSeconds: number;
  avgTimeSeconds: number;
};

export type AnalyticsScrollMilestone = {
  milestone: number;
  count: number;
};

export type AnalyticsTopLink = {
  label: string;
  destination: string;
  clicks: number;
  section: string;
};

export type AnalyticsTopEvent = {
  event: string;
  count: number;
  essentialCount: number;
  analyticsCount: number;
};

export type AnalyticsFunnelStep = {
  step: string;
  label: string;
  count: number;
  rate: number;
};

export type AnalyticsAttributionRow = {
  source: string;
  medium: string;
  leads: number;
  conversions: number;
};

export type AnalyticsLeadVelocityPoint = {
  date: string;
  newLeads: number;
  enrolled: number;
};

export type AnalyticsBundle = {
  range: AnalyticsRange;
  rangeLabel: string;
  generatedAt: string;
  storageReady: boolean;
  storageMessage: string | null;
  summary: AnalyticsSummary;
  dailySeries: AnalyticsDailyPoint[];
  topPages: AnalyticsTopPage[];
  pageEngagement: AnalyticsPageEngagement[];
  scrollDepth: AnalyticsScrollMilestone[];
  topLinks: AnalyticsTopLink[];
  forms: AnalyticsFormRow[];
  ctas: AnalyticsCtaRow[];
  topEvents: AnalyticsTopEvent[];
  funnel: AnalyticsFunnelStep[];
  attribution: AnalyticsAttributionRow[];
  leadVelocity: AnalyticsLeadVelocityPoint[];
};

export function parseAnalyticsRange(value: string | null | undefined): AnalyticsRange {
  if (!value || value === "none" || value === "all") return null;
  const parsed = Number(value);
  if ([7, 14, 30, 60, 90].includes(parsed)) return parsed as AnalyticsRange;
  return 30;
}

export function formatAnalyticsRangeLabel(range: AnalyticsRange) {
  if (range === null) return "All time";
  return `Last ${range} days`;
}

export function rangeToStartIso(range: AnalyticsRange) {
  if (range === null) return null;
  const start = new Date();
  start.setUTCDate(start.getUTCDate() - range);
  start.setUTCHours(0, 0, 0, 0);
  return start.toISOString();
}
