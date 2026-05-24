-- Healing From Your Addiction — dashboard schema
-- Run via Supabase CLI or SQL editor

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Leads from public enquiry forms
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  addiction_concern TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL,
  message TEXT,
  source_page TEXT,
  landing_page TEXT,
  referrer TEXT,
  page_type TEXT,
  primary_keyword TEXT,
  conversion_goal TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  gclid TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'enrolled', 'closed')),
  assigned_admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads(status);
CREATE INDEX IF NOT EXISTS leads_email_idx ON leads(email);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads(created_at DESC);

-- Internal admin notes on leads
CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS lead_notes_lead_id_idx ON lead_notes(lead_id);

-- Client profiles (linked to auth user after invite)
CREATE TABLE IF NOT EXISTS client_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  addiction_slug TEXT,
  preferred_contact_method TEXT,
  emergency_contact TEXT,
  consent_signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_profiles_user_id_idx ON client_profiles(user_id);

-- Programme templates (seeded from case-study content)
CREATE TABLE IF NOT EXISTS programme_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  addiction_slug TEXT NOT NULL,
  title TEXT NOT NULL,
  session_count INTEGER NOT NULL DEFAULT 8,
  source_case_study_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS programme_templates_addiction_slug_idx ON programme_templates(addiction_slug);

-- Sessions within a programme template
CREATE TABLE IF NOT EXISTS programme_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES programme_templates(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  session_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('hypno', 'eft', 'affirmations', 'questions', 'overview')),
  content_ref TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS programme_sessions_template_id_idx ON programme_sessions(template_id);

-- Client enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES programme_templates(id) ON DELETE RESTRICT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  start_date DATE,
  current_session_number INTEGER NOT NULL DEFAULT 1,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS enrollments_client_profile_id_idx ON enrollments(client_profile_id);

-- Per-session progress
CREATE TABLE IF NOT EXISTS session_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES programme_sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked' CHECK (status IN ('locked', 'available', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  client_notes TEXT,
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (enrollment_id, session_id)
);

CREATE INDEX IF NOT EXISTS session_progress_enrollment_id_idx ON session_progress(enrollment_id);

-- Secure messaging
CREATE TABLE IF NOT EXISTS client_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_messages_client_profile_id_idx ON client_messages(client_profile_id);

-- Client documents (Supabase Storage paths)
CREATE TABLE IF NOT EXISTS client_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES client_profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  label TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_documents_client_profile_id_idx ON client_documents(client_profile_id);

-- Audit log for sensitive access
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER enrollments_updated_at
  BEFORE UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER session_progress_updated_at
  BEFORE UPDATE ON session_progress
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Auto-create profile on signup (default client; admin set manually)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS helpers
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_client_profile_id()
RETURNS UUID AS $$
  SELECT id FROM client_profiles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE programme_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (id = auth.uid() OR is_admin());
CREATE POLICY profiles_admin_all ON profiles FOR ALL USING (is_admin());

-- Leads policies (admin only; public insert via service role)
CREATE POLICY leads_admin_select ON leads FOR SELECT USING (is_admin());
CREATE POLICY leads_admin_insert ON leads FOR INSERT WITH CHECK (is_admin());
CREATE POLICY leads_admin_update ON leads FOR UPDATE USING (is_admin());
CREATE POLICY leads_admin_delete ON leads FOR DELETE USING (is_admin());

-- Lead notes (admin only)
CREATE POLICY lead_notes_admin_all ON lead_notes FOR ALL USING (is_admin());

-- Client profiles
CREATE POLICY client_profiles_admin_all ON client_profiles FOR ALL USING (is_admin());
CREATE POLICY client_profiles_select_own ON client_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY client_profiles_update_own ON client_profiles FOR UPDATE USING (user_id = auth.uid());

-- Programme templates (admin full; clients read enrolled templates)
CREATE POLICY programme_templates_admin_all ON programme_templates FOR ALL USING (is_admin());
CREATE POLICY programme_templates_client_select ON programme_templates FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN client_profiles cp ON cp.id = e.client_profile_id
    WHERE cp.user_id = auth.uid() AND e.template_id = programme_templates.id
  )
);

-- Programme sessions
CREATE POLICY programme_sessions_admin_all ON programme_sessions FOR ALL USING (is_admin());
CREATE POLICY programme_sessions_client_select ON programme_sessions FOR SELECT USING (
  is_admin() OR EXISTS (
    SELECT 1 FROM enrollments e
    JOIN client_profiles cp ON cp.id = e.client_profile_id
    WHERE cp.user_id = auth.uid() AND e.template_id = programme_sessions.template_id
  )
);

-- Enrollments
CREATE POLICY enrollments_admin_all ON enrollments FOR ALL USING (is_admin());
CREATE POLICY enrollments_client_select ON enrollments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = enrollments.client_profile_id AND cp.user_id = auth.uid()
  )
);

-- Session progress
CREATE POLICY session_progress_admin_all ON session_progress FOR ALL USING (is_admin());
CREATE POLICY session_progress_client_select ON session_progress FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN client_profiles cp ON cp.id = e.client_profile_id
    WHERE e.id = session_progress.enrollment_id AND cp.user_id = auth.uid()
  )
);
CREATE POLICY session_progress_client_update ON session_progress FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM enrollments e
    JOIN client_profiles cp ON cp.id = e.client_profile_id
    WHERE e.id = session_progress.enrollment_id AND cp.user_id = auth.uid()
    AND session_progress.status IN ('available', 'in_progress', 'completed')
  )
);

-- Messages
CREATE POLICY client_messages_admin_all ON client_messages FOR ALL USING (is_admin());
CREATE POLICY client_messages_client_select ON client_messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = client_messages.client_profile_id AND cp.user_id = auth.uid()
  )
);
CREATE POLICY client_messages_client_insert ON client_messages FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = client_messages.client_profile_id AND cp.user_id = auth.uid()
  )
  AND author_id = auth.uid()
);

-- Documents
CREATE POLICY client_documents_admin_all ON client_documents FOR ALL USING (is_admin());
CREATE POLICY client_documents_client_select ON client_documents FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM client_profiles cp
    WHERE cp.id = client_documents.client_profile_id AND cp.user_id = auth.uid()
  )
);

-- Audit log (admin read only; insert via service role or admin)
CREATE POLICY audit_log_admin_select ON audit_log FOR SELECT USING (is_admin());
CREATE POLICY audit_log_admin_insert ON audit_log FOR INSERT WITH CHECK (is_admin() OR auth.uid() IS NOT NULL);

-- Storage bucket for client documents (run in Supabase dashboard or storage migration)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('client-documents', 'client-documents', false);
