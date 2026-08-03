-- Harden readiness assessments: drafts, history, review workflow, admin notifications

CREATE TABLE IF NOT EXISTS readiness_assessment_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash TEXT NOT NULL UNIQUE,
  ciphertext TEXT NOT NULL,
  iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  assessment_version INTEGER NOT NULL DEFAULT 2,
  email_hint TEXT,
  client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  claimed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS readiness_assessment_drafts_expires_at_idx
  ON readiness_assessment_drafts(expires_at);

CREATE INDEX IF NOT EXISTS readiness_assessment_drafts_client_profile_id_idx
  ON readiness_assessment_drafts(client_profile_id);

DROP TRIGGER IF EXISTS readiness_assessment_drafts_updated_at ON readiness_assessment_drafts;
CREATE TRIGGER readiness_assessment_drafts_updated_at
  BEFORE UPDATE ON readiness_assessment_drafts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE readiness_assessment_drafts ENABLE ROW LEVEL SECURITY;

-- Drafts are only accessible via service-role / server actions with token hash.
DROP POLICY IF EXISTS readiness_assessment_drafts_admin_select ON readiness_assessment_drafts;
CREATE POLICY readiness_assessment_drafts_admin_select
  ON readiness_assessment_drafts FOR SELECT
  USING (is_admin());

-- Allow multiple completed assessments per client (retake history).
ALTER TABLE readiness_assessments DROP CONSTRAINT IF EXISTS readiness_assessments_client_profile_id_key;

ALTER TABLE readiness_assessments
  ADD COLUMN IF NOT EXISTS readiness_index NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS attempt_number INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS is_current BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS urgent_safety BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS next_step TEXT,
  ADD COLUMN IF NOT EXISTS privacy_consent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_status TEXT NOT NULL DEFAULT 'unreviewed',
  ADD COLUMN IF NOT EXISTS practitioner_notes TEXT,
  ADD COLUMN IF NOT EXISTS recommended_focus TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_on DATE,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS retention_until DATE;

DO $$ BEGIN
  ALTER TABLE readiness_assessments
    ADD CONSTRAINT readiness_assessments_review_status_check
    CHECK (review_status IN ('unreviewed', 'in_review', 'reviewed', 'follow_up_needed'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE readiness_assessments
    ADD CONSTRAINT readiness_assessments_next_step_check
    CHECK (next_step IS NULL OR next_step IN (
      'programme_enquiry', 'motivation_work', 'trigger_mapping', 'emotional_regulation', 'urgent_safety'
    ));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Migrate legacy band constraint/value.
ALTER TABLE readiness_assessments DROP CONSTRAINT IF EXISTS readiness_assessments_readiness_band_check;

DO $$ BEGIN
  ALTER TABLE readiness_assessments
    ADD CONSTRAINT readiness_assessments_band_check
    CHECK (readiness_band IN ('needs_support_first', 'developing', 'mostly_ready', 'fully_ready'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

UPDATE readiness_assessments
SET readiness_band = 'needs_support_first'
WHERE readiness_band = 'not_yet_ready';

CREATE UNIQUE INDEX IF NOT EXISTS readiness_assessments_one_current_per_client_idx
  ON readiness_assessments(client_profile_id)
  WHERE is_current = TRUE;

CREATE INDEX IF NOT EXISTS readiness_assessments_client_completed_idx
  ON readiness_assessments(client_profile_id, completed_at DESC);

CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('readiness_completed', 'message', 'consultation', 'note')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  href TEXT,
  client_profile_id UUID REFERENCES client_profiles(id) ON DELETE SET NULL,
  source_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_notifications_created_at_idx
  ON admin_notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS admin_notifications_unread_idx
  ON admin_notifications(read_at, created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS admin_notifications_admin_all ON admin_notifications;
CREATE POLICY admin_notifications_admin_all
  ON admin_notifications FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_assessment_drafts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_assessment_drafts TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON admin_notifications TO service_role;
