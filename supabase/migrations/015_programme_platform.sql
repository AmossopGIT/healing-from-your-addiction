-- Programme schedule, homework, points, and session recordings

ALTER TABLE session_progress
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER,
  ADD COLUMN IF NOT EXISTS recording_url TEXT,
  ADD COLUMN IF NOT EXISTS recording_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS recording_label TEXT;

CREATE TABLE IF NOT EXISTS enrollment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL UNIQUE REFERENCES enrollments(id) ON DELETE CASCADE,
  weekday TEXT NOT NULL CHECK (weekday IN ('tue', 'fri')),
  time_slot TEXT NOT NULL CHECK (time_slot IN ('11:00', '16:00')),
  meet_url TEXT NOT NULL,
  first_session_at TIMESTAMPTZ NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'Africa/Johannesburg',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enrollment_schedules_enrollment_id_idx
  ON enrollment_schedules(enrollment_id);

CREATE TRIGGER enrollment_schedules_updated_at
  BEFORE UPDATE ON enrollment_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS programme_homework_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES programme_templates(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('eft_daily', 'affirmations_daily', 'reflection', 'custom')),
  week_number INTEGER,
  cadence TEXT NOT NULL DEFAULT 'daily' CHECK (cadence IN ('daily', 'per_session', 'once')),
  points INTEGER NOT NULL DEFAULT 5 CHECK (points >= 0),
  tone TEXT NOT NULL DEFAULT 'standard' CHECK (tone IN ('rigid', 'playful', 'standard')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (template_id, task_key)
);

CREATE INDEX IF NOT EXISTS programme_homework_tasks_template_id_idx
  ON programme_homework_tasks(template_id);

CREATE TABLE IF NOT EXISTS client_homework_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES programme_homework_tasks(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  mood TEXT CHECK (mood IS NULL OR mood IN ('calm', 'steady', 'low', 'anxious', 'irritable')),
  note TEXT,
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (client_profile_id, task_id, entry_date)
);

CREATE INDEX IF NOT EXISTS client_homework_entries_client_date_idx
  ON client_homework_entries(client_profile_id, entry_date DESC);

CREATE INDEX IF NOT EXISTS client_homework_entries_enrollment_id_idx
  ON client_homework_entries(enrollment_id);

CREATE TRIGGER client_homework_entries_updated_at
  BEFORE UPDATE ON client_homework_entries
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS client_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_type TEXT,
  source_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_points_ledger_client_profile_id_idx
  ON client_points_ledger(client_profile_id, created_at DESC);

CREATE TABLE IF NOT EXISTS programme_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_slug TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  body_markdown TEXT NOT NULL DEFAULT '',
  week_number INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (addiction_slug, slug)
);

CREATE INDEX IF NOT EXISTS programme_docs_addiction_slug_idx
  ON programme_docs(addiction_slug);

CREATE TRIGGER programme_docs_updated_at
  BEFORE UPDATE ON programme_docs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE enrollment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_homework_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_homework_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY enrollment_schedules_admin_all ON enrollment_schedules FOR ALL USING (is_admin());
CREATE POLICY enrollment_schedules_client_select ON enrollment_schedules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = enrollment_schedules.enrollment_id
      AND e.client_profile_id = get_my_client_profile_id()
  )
);
CREATE POLICY enrollment_schedules_client_insert ON enrollment_schedules FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = enrollment_schedules.enrollment_id
      AND e.client_profile_id = get_my_client_profile_id()
  )
);
CREATE POLICY enrollment_schedules_client_update ON enrollment_schedules FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.id = enrollment_schedules.enrollment_id
      AND e.client_profile_id = get_my_client_profile_id()
  )
);

CREATE POLICY programme_homework_tasks_admin_all ON programme_homework_tasks FOR ALL USING (is_admin());
CREATE POLICY programme_homework_tasks_client_select ON programme_homework_tasks FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    WHERE e.template_id = programme_homework_tasks.template_id
      AND e.client_profile_id = get_my_client_profile_id()
  )
  OR is_admin()
);

CREATE POLICY client_homework_entries_admin_all ON client_homework_entries FOR ALL USING (is_admin());
CREATE POLICY client_homework_entries_client_select ON client_homework_entries FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());
CREATE POLICY client_homework_entries_client_insert ON client_homework_entries FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());
CREATE POLICY client_homework_entries_client_update ON client_homework_entries FOR UPDATE
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY client_points_ledger_admin_all ON client_points_ledger FOR ALL USING (is_admin());
CREATE POLICY client_points_ledger_client_select ON client_points_ledger FOR SELECT
  USING (client_profile_id = get_my_client_profile_id() OR is_admin());
CREATE POLICY client_points_ledger_client_insert ON client_points_ledger FOR INSERT
  WITH CHECK (client_profile_id = get_my_client_profile_id() OR is_admin());

CREATE POLICY programme_docs_admin_all ON programme_docs FOR ALL USING (is_admin());
CREATE POLICY programme_docs_authenticated_select ON programme_docs FOR SELECT USING (auth.role() = 'authenticated');

GRANT SELECT, INSERT, UPDATE, DELETE ON enrollment_schedules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_homework_tasks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_homework_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_points_ledger TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_docs TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON enrollment_schedules TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_homework_tasks TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_homework_entries TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON client_points_ledger TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON programme_docs TO service_role;
