-- Addiction Healing Readiness Assessment (AHRA) submissions

CREATE TABLE IF NOT EXISTS readiness_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL UNIQUE REFERENCES client_profiles(id) ON DELETE CASCADE,
  assessment_version INTEGER NOT NULL DEFAULT 1,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  commitment_score NUMERIC(4,1) NOT NULL,
  self_awareness_score NUMERIC(4,1) NOT NULL,
  emotional_capacity_score NUMERIC(4,1) NOT NULL,
  readiness_product NUMERIC(8,1) NOT NULL,
  readiness_band TEXT NOT NULL
    CHECK (readiness_band IN ('not_yet_ready', 'developing', 'mostly_ready', 'fully_ready')),
  focus_areas TEXT[] NOT NULL DEFAULT '{}'::text[],
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS readiness_assessments_client_profile_id_idx
  ON readiness_assessments(client_profile_id);

CREATE INDEX IF NOT EXISTS readiness_assessments_completed_at_idx
  ON readiness_assessments(completed_at);

CREATE INDEX IF NOT EXISTS readiness_assessments_band_idx
  ON readiness_assessments(readiness_band);

DROP TRIGGER IF EXISTS readiness_assessments_updated_at ON readiness_assessments;
CREATE TRIGGER readiness_assessments_updated_at
  BEFORE UPDATE ON readiness_assessments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE readiness_assessments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS readiness_assessments_client_select ON readiness_assessments;
CREATE POLICY readiness_assessments_client_select
  ON readiness_assessments FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

DROP POLICY IF EXISTS readiness_assessments_client_insert ON readiness_assessments;
CREATE POLICY readiness_assessments_client_insert
  ON readiness_assessments FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

DROP POLICY IF EXISTS readiness_assessments_client_update ON readiness_assessments;
CREATE POLICY readiness_assessments_client_update
  ON readiness_assessments FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

DROP POLICY IF EXISTS readiness_assessments_admin_all ON readiness_assessments;
CREATE POLICY readiness_assessments_admin_all
  ON readiness_assessments FOR ALL
  USING (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_assessments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON readiness_assessments TO service_role;
