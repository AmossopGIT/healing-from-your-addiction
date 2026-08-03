-- Close programme platform gaps: drafts, events, private answers, review, cadence

ALTER TABLE programme_templates
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  ADD COLUMN IF NOT EXISTS cadence_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS draft_content_json JSONB,
  ADD COLUMN IF NOT EXISTS source_checksum TEXT;

DO $$ BEGIN
  ALTER TABLE programme_templates
    ADD CONSTRAINT programme_templates_review_status_check
    CHECK (review_status IN ('pending', 'approved', 'changes_requested'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS programme_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES programme_templates(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'ready', 'published', 'archived')),
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  source_checksum TEXT,
  review_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (review_status IN ('pending', 'approved', 'changes_requested')),
  created_by UUID REFERENCES profiles(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, version)
);

CREATE INDEX IF NOT EXISTS programme_versions_template_id_idx
  ON programme_versions(template_id, version DESC);

ALTER TABLE client_activity_progress
  ADD COLUMN IF NOT EXISTS public_responses JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE TABLE IF NOT EXISTS client_activity_private_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL UNIQUE REFERENCES client_activity_progress(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  private_responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  shared_with_admin BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_activity_private_answers_enrollment_id_idx
  ON client_activity_private_answers(enrollment_id);

CREATE INDEX IF NOT EXISTS client_activity_private_answers_shared_idx
  ON client_activity_private_answers(shared_with_admin);

DROP TRIGGER IF EXISTS client_activity_private_answers_updated_at ON client_activity_private_answers;
CREATE TRIGGER client_activity_private_answers_updated_at
  BEFORE UPDATE ON client_activity_private_answers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS programme_activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  programme_slug TEXT,
  programme_version INTEGER,
  module_id TEXT,
  activity_id TEXT,
  event_type TEXT NOT NULL
    CHECK (event_type IN (
      'started', 'viewed', 'saved', 'completed', 'unlocked', 'skipped',
      'paused', 'resumed', 'safety_flag', 'module_completed', 'programme_completed'
    )),
  actor_role TEXT NOT NULL DEFAULT 'client' CHECK (actor_role IN ('client', 'admin', 'system')),
  actor_id UUID,
  idempotency_key TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key)
);

CREATE INDEX IF NOT EXISTS programme_activity_events_enrollment_id_idx
  ON programme_activity_events(enrollment_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS programme_activity_events_type_idx
  ON programme_activity_events(event_type, occurred_at DESC);

CREATE INDEX IF NOT EXISTS programme_activity_events_slug_idx
  ON programme_activity_events(programme_slug, occurred_at DESC);

ALTER TABLE programme_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_activity_private_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_activity_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS programme_versions_admin_all ON programme_versions;
CREATE POLICY programme_versions_admin_all ON programme_versions
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS client_activity_private_answers_admin_shared ON client_activity_private_answers;
CREATE POLICY client_activity_private_answers_admin_shared ON client_activity_private_answers
  FOR SELECT USING (is_admin() AND shared_with_admin = TRUE);

DROP POLICY IF EXISTS client_activity_private_answers_admin_update ON client_activity_private_answers;
CREATE POLICY client_activity_private_answers_admin_update ON client_activity_private_answers
  FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS client_activity_private_answers_client_all ON client_activity_private_answers;
CREATE POLICY client_activity_private_answers_client_all ON client_activity_private_answers
  FOR ALL USING (client_profile_id = get_my_client_profile_id())
  WITH CHECK (client_profile_id = get_my_client_profile_id());

DROP POLICY IF EXISTS programme_activity_events_admin_all ON programme_activity_events;
CREATE POLICY programme_activity_events_admin_all ON programme_activity_events
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS programme_activity_events_client_select ON programme_activity_events;
CREATE POLICY programme_activity_events_client_select ON programme_activity_events
  FOR SELECT USING (client_profile_id = get_my_client_profile_id());

DROP POLICY IF EXISTS programme_activity_events_client_insert ON programme_activity_events;
CREATE POLICY programme_activity_events_client_insert ON programme_activity_events
  FOR INSERT WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON programme_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_versions TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_activity_private_answers TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_activity_private_answers TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_activity_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_activity_events TO service_role;
