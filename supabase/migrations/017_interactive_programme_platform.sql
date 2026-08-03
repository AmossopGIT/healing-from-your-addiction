-- Interactive programme platform: versioned content, activity progress, safer RLS

ALTER TABLE programme_templates
  ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'behavioral',
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS version INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS safety_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS week_count INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS day_count INTEGER NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS content_json JSONB NOT NULL DEFAULT '{}'::jsonb;

DO $$ BEGIN
  ALTER TABLE programme_templates
    ADD CONSTRAINT programme_templates_category_check CHECK (category IN ('behavioral', 'substance'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE programme_templates
    ADD CONSTRAINT programme_templates_status_check CHECK (status IN ('draft', 'ready', 'published'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS programme_templates_addiction_slug_uidx
  ON programme_templates (addiction_slug);

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS programme_version INTEGER,
  ADD COLUMN IF NOT EXISTS current_activity_id TEXT,
  ADD COLUMN IF NOT EXISTS content_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS journey_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS journey_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS client_activity_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  activity_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'locked'
    CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'skipped')),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  shared_with_admin BOOLEAN NOT NULL DEFAULT FALSE,
  points_awarded INTEGER NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  skipped_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, activity_id)
);

CREATE INDEX IF NOT EXISTS client_activity_progress_enrollment_id_idx
  ON client_activity_progress(enrollment_id);

CREATE INDEX IF NOT EXISTS client_activity_progress_status_idx
  ON client_activity_progress(status);

DROP TRIGGER IF EXISTS client_activity_progress_updated_at ON client_activity_progress;
CREATE TRIGGER client_activity_progress_updated_at
  BEFORE UPDATE ON client_activity_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS programme_admin_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  flag_type TEXT NOT NULL CHECK (flag_type IN ('safety', 'inactive', 'support', 'note')),
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'watch', 'urgent')),
  note TEXT NOT NULL,
  created_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS programme_admin_flags_enrollment_id_idx
  ON programme_admin_flags(enrollment_id, created_at DESC);

ALTER TABLE client_activity_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_admin_flags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS client_activity_progress_admin_all ON client_activity_progress;
CREATE POLICY client_activity_progress_admin_all ON client_activity_progress
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS client_activity_progress_client_select ON client_activity_progress;
CREATE POLICY client_activity_progress_client_select ON client_activity_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = client_activity_progress.enrollment_id
        AND e.client_profile_id = get_my_client_profile_id()
    )
  );

DROP POLICY IF EXISTS client_activity_progress_client_update ON client_activity_progress;
CREATE POLICY client_activity_progress_client_update ON client_activity_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = client_activity_progress.enrollment_id
        AND e.client_profile_id = get_my_client_profile_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = client_activity_progress.enrollment_id
        AND e.client_profile_id = get_my_client_profile_id()
    )
  );

DROP POLICY IF EXISTS programme_admin_flags_admin_all ON programme_admin_flags;
CREATE POLICY programme_admin_flags_admin_all ON programme_admin_flags
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS programme_docs_authenticated_select ON programme_docs;
DROP POLICY IF EXISTS programme_docs_client_select ON programme_docs;
CREATE POLICY programme_docs_client_select ON programme_docs
  FOR SELECT USING (
    is_admin()
    OR EXISTS (
      SELECT 1
      FROM client_content_receipts r
      JOIN client_profiles cp ON cp.id = r.client_profile_id
      WHERE r.content_kind = 'programme_doc'
        AND r.content_id = programme_docs.id
        AND cp.id = get_my_client_profile_id()
    )
  );

DROP POLICY IF EXISTS client_points_ledger_client_insert ON client_points_ledger;
CREATE POLICY client_points_ledger_client_insert ON client_points_ledger
  FOR INSERT WITH CHECK (
    (
      client_profile_id = get_my_client_profile_id()
      AND points <> 0
      AND points BETWEEN -20 AND 20
      AND source_type IN ('activity', 'homework', 'check_in', 'practice')
    )
    OR is_admin()
  );

DROP POLICY IF EXISTS session_progress_client_update ON session_progress;
CREATE POLICY session_progress_client_update ON session_progress
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = session_progress.enrollment_id
        AND e.client_profile_id = get_my_client_profile_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM enrollments e
      WHERE e.id = session_progress.enrollment_id
        AND e.client_profile_id = get_my_client_profile_id()
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE ON client_activity_progress TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_activity_progress TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_admin_flags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_admin_flags TO service_role;
