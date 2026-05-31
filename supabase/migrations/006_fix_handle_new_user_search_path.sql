-- Fix auth signup: handle_new_user must resolve public.profiles when fired from auth.users
ALTER TABLE public.client_profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

UPDATE public.client_profiles
SET onboarding_completed_at = COALESCE(onboarding_completed_at, created_at)
WHERE onboarding_completed_at IS NULL;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, full_name)
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
$$;
