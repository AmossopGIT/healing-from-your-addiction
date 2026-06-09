-- Prevent authenticated users from escalating profiles.role to admin.
-- Service-role clients (admin invite, SQL editor, triggers) may still change role.

CREATE OR REPLACE FUNCTION public.prevent_profile_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.role IS DISTINCT FROM OLD.role THEN
    IF COALESCE(auth.role(), '') IS DISTINCT FROM 'service_role' THEN
      RAISE EXCEPTION 'profiles.role cannot be changed by authenticated users';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_role ON public.profiles;

CREATE TRIGGER profiles_protect_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_profile_role_change();
