-- Client conversion tracking and operational payment state.
ALTER TABLE client_profiles
  ADD COLUMN IF NOT EXISTS invitation_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (invitation_status IN ('pending', 'accepted', 'expired')),
  ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'awaiting_quote'
    CHECK (payment_status IN ('awaiting_quote', 'invoice_sent', 'paid', 'payment_plan', 'on_hold', 'not_applicable'));

CREATE INDEX IF NOT EXISTS client_profiles_invitation_status_idx
  ON client_profiles(invitation_status);
