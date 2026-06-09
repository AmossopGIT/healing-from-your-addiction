-- Production deploy bundle: verify migrations 006–009 and promote Gerald admin.
-- Run in Supabase Dashboard → SQL Editor → New query → Run.
-- Project: yjgxzzmljyksqhcmhsty (Healing From Your Addiction)

-- ---------------------------------------------------------------------------
-- 1) VERIFY migration 006 (handle_new_user search_path + onboarding_completed_at)
-- ---------------------------------------------------------------------------
-- Expect: prosrc contains "search_path = public" and column onboarding_completed_at exists.
SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) LIKE '%search_path = public%' AS has_search_path_fix
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'handle_new_user';

SELECT column_name
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'client_profiles'
  AND column_name = 'onboarding_completed_at';

-- ---------------------------------------------------------------------------
-- 2) VERIFY migration 007 (is_admin helper + grants)
-- ---------------------------------------------------------------------------
SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) LIKE '%search_path = public%' AS has_search_path_fix
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('is_admin', 'get_my_client_profile_id');

-- ---------------------------------------------------------------------------
-- 3) APPLY migration 009 (client self-signup INSERT policy) — idempotent
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'client_profiles'
      AND policyname = 'client_profiles_insert_own'
  ) THEN
    CREATE POLICY client_profiles_insert_own ON public.client_profiles
      FOR INSERT WITH CHECK (user_id = auth.uid());
    RAISE NOTICE 'Created policy client_profiles_insert_own';
  ELSE
    RAISE NOTICE 'Policy client_profiles_insert_own already exists';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4) PROMOTE Gerald admin — healingfromyouraddiction@geraldcrawford.co.za
--    Create the auth user first if missing (Authentication → Users → Add user),
--    with App Metadata: {"role": "admin"}
-- ---------------------------------------------------------------------------
UPDATE auth.users
SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
WHERE lower(email) = lower('healingfromyouraddiction@geraldcrawford.co.za');

UPDATE public.profiles
SET role = 'admin', full_name = COALESCE(full_name, 'Gerald Crawford')
WHERE id IN (
  SELECT id FROM auth.users WHERE lower(email) = lower('healingfromyouraddiction@geraldcrawford.co.za')
);

-- Confirm admin profile
SELECT u.email, p.role, p.full_name
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE lower(u.email) = lower('healingfromyouraddiction@geraldcrawford.co.za');
