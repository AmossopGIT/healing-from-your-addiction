-- Portal engagement: daily check-ins and optional recovery goals

CREATE TABLE IF NOT EXISTS client_daily_check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  mood TEXT NOT NULL CHECK (mood IN ('calm', 'steady', 'low', 'anxious', 'irritable')),
  craving_level SMALLINT NOT NULL CHECK (craving_level >= 0 AND craving_level <= 5),
  pause_taken BOOLEAN NOT NULL DEFAULT FALSE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_profile_id, check_in_date)
);

CREATE INDEX IF NOT EXISTS client_daily_check_ins_client_profile_id_idx
  ON client_daily_check_ins(client_profile_id);

CREATE INDEX IF NOT EXISTS client_daily_check_ins_check_in_date_idx
  ON client_daily_check_ins(check_in_date DESC);

CREATE TABLE IF NOT EXISTS client_recovery_goals (
  client_profile_id UUID PRIMARY KEY REFERENCES client_profiles(id) ON DELETE CASCADE,
  show_abstinence_counter BOOLEAN NOT NULL DEFAULT FALSE,
  abstinence_start_date DATE,
  goal_note TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER client_recovery_goals_updated_at
  BEFORE UPDATE ON client_recovery_goals
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE client_daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_recovery_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY client_daily_check_ins_client_select
  ON client_daily_check_ins FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_daily_check_ins_client_insert
  ON client_daily_check_ins FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_daily_check_ins_client_update
  ON client_daily_check_ins FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_daily_check_ins_admin_all
  ON client_daily_check_ins FOR ALL
  USING (is_admin());

CREATE POLICY client_recovery_goals_client_select
  ON client_recovery_goals FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_recovery_goals_client_insert
  ON client_recovery_goals FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_recovery_goals_client_update
  ON client_recovery_goals FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_recovery_goals_admin_all
  ON client_recovery_goals FOR ALL
  USING (is_admin());

GRANT SELECT, INSERT, UPDATE, DELETE ON client_daily_check_ins TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_recovery_goals TO authenticated;
