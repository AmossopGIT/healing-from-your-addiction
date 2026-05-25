-- Portal self-signup and onboarding support

ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Backfill existing invited / legacy clients so they keep portal access.
UPDATE client_profiles
SET onboarding_completed_at = COALESCE(onboarding_completed_at, created_at)
WHERE onboarding_completed_at IS NULL;

-- Public self-signup should never be able to self-assign admin via user metadata.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    CASE
      WHEN NEW.raw_app_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'client'
    END,
    NULLIF(TRIM(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), '')
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
