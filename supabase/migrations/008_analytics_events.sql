-- First-party analytics events (consent-tiered)

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  page_path TEXT NOT NULL,
  session_id TEXT,
  visitor_id TEXT,
  consent_tier TEXT NOT NULL CHECK (consent_tier IN ('essential', 'analytics')),
  page_type TEXT,
  primary_keyword TEXT,
  conversion_goal TEXT,
  landing_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS analytics_events_occurred_at_idx ON analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_occurred_at_idx ON analytics_events (event_name, occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_page_path_occurred_at_idx ON analytics_events (page_path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_consent_tier_occurred_at_idx ON analytics_events (consent_tier, occurred_at DESC);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events (session_id);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY analytics_events_admin_select ON analytics_events
  FOR SELECT USING (is_admin());
