-- Record every admin read of a client-shared private answer.

CREATE TABLE IF NOT EXISTS private_answer_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  progress_id UUID NOT NULL REFERENCES client_activity_progress(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  accessed_by UUID NOT NULL REFERENCES profiles(id),
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reason TEXT NOT NULL DEFAULT 'programme_review'
);

CREATE INDEX IF NOT EXISTS private_answer_access_audit_client_idx
  ON private_answer_access_audit(client_profile_id, accessed_at DESC);

CREATE INDEX IF NOT EXISTS private_answer_access_audit_progress_idx
  ON private_answer_access_audit(progress_id, accessed_at DESC);

ALTER TABLE private_answer_access_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS private_answer_access_audit_admin_all ON private_answer_access_audit;
CREATE POLICY private_answer_access_audit_admin_all ON private_answer_access_audit
  FOR ALL USING (is_admin()) WITH CHECK (is_admin());

GRANT SELECT, INSERT ON private_answer_access_audit TO authenticated;
GRANT SELECT, INSERT ON private_answer_access_audit TO service_role;
