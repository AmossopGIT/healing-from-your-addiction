-- Client pre-programme intake question responses

CREATE TABLE IF NOT EXISTS client_intake_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL UNIQUE REFERENCES client_profiles(id) ON DELETE CASCADE,
  question_set_slug TEXT NOT NULL,
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_intake_submissions_client_profile_id_idx
  ON client_intake_submissions(client_profile_id);

CREATE INDEX IF NOT EXISTS client_intake_submissions_completed_at_idx
  ON client_intake_submissions(completed_at);

CREATE TRIGGER client_intake_submissions_updated_at
  BEFORE UPDATE ON client_intake_submissions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE client_intake_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_intake_submissions_client_select
  ON client_intake_submissions FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_intake_submissions_client_insert
  ON client_intake_submissions FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_intake_submissions_client_update
  ON client_intake_submissions FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_intake_submissions_admin_all
  ON client_intake_submissions FOR ALL
  USING (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON client_intake_submissions TO authenticated;
