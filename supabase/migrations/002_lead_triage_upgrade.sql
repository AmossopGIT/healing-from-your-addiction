-- Lead intake + triage upgrade

ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high')),
  ADD COLUMN IF NOT EXISTS withdrawal_risk TEXT CHECK (withdrawal_risk IN ('none', 'mild', 'moderate', 'severe', 'unsure')),
  ADD COLUMN IF NOT EXISTS medical_support_involved TEXT CHECK (medical_support_involved IN ('yes', 'no', 'planning')),
  ADD COLUMN IF NOT EXISTS callback_window TEXT CHECK (callback_window IN ('early_morning', 'late_morning', 'afternoon', 'evening', 'flexible')),
  ADD COLUMN IF NOT EXISTS support_goals TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_consent_whatsapp BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_consent_email BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS follow_up_consent_phone BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS readiness_stage TEXT CHECK (readiness_stage IN ('exploring', 'ready_now', 'currently_in_support')),
  ADD COLUMN IF NOT EXISTS risk_flag TEXT CHECK (risk_flag IN ('standard', 'priority', 'urgent_review')),
  ADD COLUMN IF NOT EXISTS triage_priority TEXT CHECK (triage_priority IN ('routine', 'priority', 'urgent')),
  ADD COLUMN IF NOT EXISTS triage_sla_hours INTEGER CHECK (triage_sla_hours > 0 AND triage_sla_hours <= 72),
  ADD COLUMN IF NOT EXISTS first_response_template_id TEXT,
  ADD COLUMN IF NOT EXISTS first_response_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS assigned_admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS follow_up_due_at TIMESTAMPTZ;

ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'triage_review', 'outreach_started', 'care_pathway_defined', 'qualified', 'enrolled', 'closed'));

CREATE INDEX IF NOT EXISTS leads_triage_priority_idx ON leads(triage_priority);
CREATE INDEX IF NOT EXISTS leads_risk_flag_idx ON leads(risk_flag);
CREATE INDEX IF NOT EXISTS leads_follow_up_due_at_idx ON leads(follow_up_due_at);
