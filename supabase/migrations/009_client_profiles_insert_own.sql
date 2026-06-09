-- Allow self-signup clients to create their own client_profiles row during onboarding.
CREATE POLICY client_profiles_insert_own ON client_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
