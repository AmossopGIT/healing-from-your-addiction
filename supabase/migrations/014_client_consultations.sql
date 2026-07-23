-- Pre-therapy hypnotherapy consultation form (separate from addiction intake)

CREATE TABLE IF NOT EXISTS client_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL UNIQUE REFERENCES client_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_sent'
    CHECK (status IN (
      'not_sent',
      'sent',
      'delivered',
      'opened',
      'started',
      'in_progress',
      'completed',
      'uploaded'
    )),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  current_step TEXT NOT NULL DEFAULT 'personal',
  percent_complete INTEGER NOT NULL DEFAULT 0
    CHECK (percent_complete >= 0 AND percent_complete <= 100),
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  signature_name TEXT,
  signed_at TIMESTAMPTZ,
  upload_storage_path TEXT,
  upload_file_name TEXT,
  upload_mime_type TEXT,
  completion_mode TEXT
    CHECK (completion_mode IS NULL OR completion_mode IN ('online', 'upload')),
  resend_email_id TEXT,
  practitioner_notes TEXT,
  practitioner_reviewed_at TIMESTAMPTZ,
  practitioner_reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_consultations_client_profile_id_idx
  ON client_consultations(client_profile_id);

CREATE INDEX IF NOT EXISTS client_consultations_status_idx
  ON client_consultations(status);

CREATE INDEX IF NOT EXISTS client_consultations_resend_email_id_idx
  ON client_consultations(resend_email_id)
  WHERE resend_email_id IS NOT NULL;

CREATE TRIGGER client_consultations_updated_at
  BEFORE UPDATE ON client_consultations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION restrict_client_consultation_update()
RETURNS TRIGGER AS $$
BEGIN
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF OLD.client_profile_id <> get_my_client_profile_id() THEN
    RAISE EXCEPTION 'Not allowed to update this consultation.';
  END IF;

  IF NEW.client_profile_id IS DISTINCT FROM OLD.client_profile_id
    OR NEW.sent_at IS DISTINCT FROM OLD.sent_at
    OR NEW.delivered_at IS DISTINCT FROM OLD.delivered_at
    OR NEW.opened_at IS DISTINCT FROM OLD.opened_at
    OR NEW.resend_email_id IS DISTINCT FROM OLD.resend_email_id
    OR NEW.practitioner_notes IS DISTINCT FROM OLD.practitioner_notes
    OR NEW.practitioner_reviewed_at IS DISTINCT FROM OLD.practitioner_reviewed_at
    OR NEW.practitioner_reviewed_by IS DISTINCT FROM OLD.practitioner_reviewed_by
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Clients cannot update admin or email lifecycle fields.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_consultations_restrict_client_update ON client_consultations;

CREATE TRIGGER client_consultations_restrict_client_update
  BEFORE UPDATE ON client_consultations
  FOR EACH ROW
  EXECUTE FUNCTION restrict_client_consultation_update();

ALTER TABLE client_consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_consultations_client_select
  ON client_consultations FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_consultations_client_insert
  ON client_consultations FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_consultations_client_update
  ON client_consultations FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_consultations_admin_all
  ON client_consultations FOR ALL
  USING (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON client_consultations TO authenticated;

-- Allow clients to upload/read consultation files under consultations/{client_profile_id}/...
CREATE POLICY consultation_storage_client_insert ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = 'consultations'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM client_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY consultation_storage_client_select ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = 'consultations'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM client_profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY consultation_storage_client_update ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = 'consultations'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM client_profiles WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    bucket_id = 'client-documents'
    AND (storage.foldername(name))[1] = 'consultations'
    AND (storage.foldername(name))[2] IN (
      SELECT id::text FROM client_profiles WHERE user_id = auth.uid()
    )
  );
