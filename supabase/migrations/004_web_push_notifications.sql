-- Web push notifications for visitor subscriptions and delivery logging

CREATE TABLE IF NOT EXISTS web_push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  subscription_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  categories TEXT[] NOT NULL DEFAULT ARRAY['site_updates', 'new_resources']::TEXT[],
  consent_state TEXT NOT NULL DEFAULT 'subscribed'
    CHECK (consent_state IN ('subscribed', 'dismissed', 'denied', 'unsubscribed')),
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'failed', 'expired')),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  visitor_id UUID,
  source_path TEXT,
  user_agent TEXT,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  unsubscribed_at TIMESTAMPTZ,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS web_push_subscriptions_status_idx
  ON web_push_subscriptions(status, consent_state, created_at DESC);

CREATE INDEX IF NOT EXISTS web_push_subscriptions_user_id_idx
  ON web_push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS web_push_subscriptions_categories_idx
  ON web_push_subscriptions USING GIN (categories);

CREATE TABLE IF NOT EXISTS web_push_delivery_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES web_push_subscriptions(id) ON DELETE CASCADE,
  category TEXT NOT NULL
    CHECK (category IN ('site_updates', 'new_resources', 'gentle_reminders')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  target_url TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('sent', 'failed')),
  response_status INTEGER,
  response_body TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS web_push_delivery_logs_subscription_id_idx
  ON web_push_delivery_logs(subscription_id, created_at DESC);

ALTER TABLE web_push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE web_push_delivery_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION set_web_push_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS web_push_subscriptions_set_updated_at ON web_push_subscriptions;

CREATE TRIGGER web_push_subscriptions_set_updated_at
  BEFORE UPDATE ON web_push_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION set_web_push_updated_at();

CREATE POLICY web_push_subscriptions_admin_all
  ON web_push_subscriptions
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY web_push_delivery_logs_admin_all
  ON web_push_delivery_logs
  FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
