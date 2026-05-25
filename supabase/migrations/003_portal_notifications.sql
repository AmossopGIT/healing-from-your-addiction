-- Portal notifications: unread content receipts and safe client read updates

CREATE TABLE IF NOT EXISTS client_content_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  content_kind TEXT NOT NULL CHECK (content_kind IN ('document', 'session')),
  content_id UUID NOT NULL,
  released_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_profile_id, content_kind, content_id)
);

CREATE INDEX IF NOT EXISTS client_content_receipts_client_profile_id_idx
  ON client_content_receipts(client_profile_id);

CREATE INDEX IF NOT EXISTS client_content_receipts_released_at_idx
  ON client_content_receipts(released_at DESC);

CREATE INDEX IF NOT EXISTS client_content_receipts_unread_idx
  ON client_content_receipts(client_profile_id, read_at, released_at DESC);

ALTER TABLE client_content_receipts ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_content_receipts_admin_all
  ON client_content_receipts
  FOR ALL
  USING (is_admin());

CREATE POLICY client_content_receipts_client_select
  ON client_content_receipts
  FOR SELECT
  USING (client_profile_id = get_my_client_profile_id());

CREATE POLICY client_content_receipts_client_mark_read
  ON client_content_receipts
  FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id())
  WITH CHECK (client_profile_id = get_my_client_profile_id());

CREATE POLICY client_messages_client_mark_read
  ON client_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM client_profiles cp
      JOIN profiles p ON p.id = client_messages.author_id
      WHERE cp.id = client_messages.client_profile_id
        AND cp.user_id = auth.uid()
        AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM client_profiles cp
      JOIN profiles p ON p.id = client_messages.author_id
      WHERE cp.id = client_messages.client_profile_id
        AND cp.user_id = auth.uid()
        AND p.role = 'admin'
    )
  );

CREATE OR REPLACE FUNCTION restrict_client_message_read_update()
RETURNS TRIGGER AS $$
BEGIN
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF OLD.client_profile_id <> get_my_client_profile_id() THEN
    RAISE EXCEPTION 'Not allowed to update this message.';
  END IF;

  IF NEW.client_profile_id IS DISTINCT FROM OLD.client_profile_id
    OR NEW.author_id IS DISTINCT FROM OLD.author_id
    OR NEW.body IS DISTINCT FROM OLD.body
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only read state can be updated.';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM profiles
    WHERE id = OLD.author_id
      AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admin-authored messages can be marked as read.';
  END IF;

  IF OLD.read_at IS NOT NULL AND NEW.read_at IS DISTINCT FROM OLD.read_at THEN
    RAISE EXCEPTION 'Read state cannot be changed once set.';
  END IF;

  IF OLD.read_at IS NULL AND NEW.read_at IS NULL THEN
    RAISE EXCEPTION 'Read state must be set when updating a message.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_messages_restrict_client_read_update ON client_messages;

CREATE TRIGGER client_messages_restrict_client_read_update
  BEFORE UPDATE ON client_messages
  FOR EACH ROW
  EXECUTE FUNCTION restrict_client_message_read_update();

CREATE OR REPLACE FUNCTION restrict_client_content_receipt_update()
RETURNS TRIGGER AS $$
BEGIN
  IF is_admin() THEN
    RETURN NEW;
  END IF;

  IF OLD.client_profile_id <> get_my_client_profile_id() THEN
    RAISE EXCEPTION 'Not allowed to update this content receipt.';
  END IF;

  IF NEW.client_profile_id IS DISTINCT FROM OLD.client_profile_id
    OR NEW.content_kind IS DISTINCT FROM OLD.content_kind
    OR NEW.content_id IS DISTINCT FROM OLD.content_id
    OR NEW.released_at IS DISTINCT FROM OLD.released_at
    OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
    RAISE EXCEPTION 'Only read state can be updated.';
  END IF;

  IF OLD.read_at IS NOT NULL AND NEW.read_at IS DISTINCT FROM OLD.read_at THEN
    RAISE EXCEPTION 'Read state cannot be changed once set.';
  END IF;

  IF OLD.read_at IS NULL AND NEW.read_at IS NULL THEN
    RAISE EXCEPTION 'Read state must be set when updating a receipt.';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS client_content_receipts_restrict_client_read_update ON client_content_receipts;

CREATE TRIGGER client_content_receipts_restrict_client_read_update
  BEFORE UPDATE ON client_content_receipts
  FOR EACH ROW
  EXECUTE FUNCTION restrict_client_content_receipt_update();
