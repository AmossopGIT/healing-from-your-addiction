-- Mock cannabis client for admin dashboard UI work.
-- User must already exist in auth.users (default: amossop884@gmail.com).
-- Run in Supabase SQL Editor with service-role privileges.

DO $$
DECLARE
  v_user_id UUID;
  v_client_profile_id UUID;
  v_enrollment_id UUID;
  v_template_id UUID := 'f7115b62-ebd7-4627-9715-7fde6df2d544';
  v_admin_id UUID := 'c5317de2-f05e-4d7e-a9ee-8374f59cb770';
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'amossop884@gmail.com'
  LIMIT 1;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User amossop884@gmail.com not found in auth.users';
  END IF;

  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) - 'role'
  WHERE id = v_user_id;

  UPDATE public.profiles
  SET role = 'client',
      full_name = 'Alex Moss (Cannabis mock)',
      phone = '+27 82 555 0101'
  WHERE id = v_user_id;

  INSERT INTO public.client_profiles (
    user_id,
    addiction_slug,
    preferred_contact_method,
    emergency_contact,
    consent_signed_at,
    onboarding_completed_at
  )
  VALUES (
    v_user_id,
    'cannabis',
    'email',
    'Sam Moss — +27 82 555 0199',
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '13 days'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    addiction_slug = EXCLUDED.addiction_slug,
    preferred_contact_method = EXCLUDED.preferred_contact_method,
    emergency_contact = EXCLUDED.emergency_contact,
    consent_signed_at = EXCLUDED.consent_signed_at,
    onboarding_completed_at = EXCLUDED.onboarding_completed_at
  RETURNING id INTO v_client_profile_id;

  SELECT e.id INTO v_enrollment_id
  FROM public.enrollments e
  WHERE e.client_profile_id = v_client_profile_id
    AND e.template_id = v_template_id
  LIMIT 1;

  IF v_enrollment_id IS NULL THEN
    INSERT INTO public.enrollments (
      client_profile_id,
      template_id,
      status,
      start_date,
      current_session_number,
      admin_id
    )
    VALUES (
      v_client_profile_id,
      v_template_id,
      'active',
      (CURRENT_DATE - INTERVAL '10 days')::date,
      3,
      v_admin_id
    )
    RETURNING id INTO v_enrollment_id;
  END IF;

  INSERT INTO public.session_progress (
    enrollment_id,
    session_id,
    status,
    completed_at,
    unlocked_at,
    client_notes
  )
  SELECT
    v_enrollment_id,
    ps.id,
    CASE
      WHEN ps.sort_order <= 1 THEN 'completed'
      WHEN ps.sort_order = 2 THEN 'in_progress'
      WHEN ps.sort_order = 3 THEN 'available'
      ELSE 'locked'
    END,
    CASE
      WHEN ps.sort_order <= 1 THEN NOW() - INTERVAL '7 days' + (ps.sort_order || ' days')::interval
      ELSE NULL
    END,
    CASE
      WHEN ps.sort_order <= 3 THEN NOW() - INTERVAL '10 days' + (ps.sort_order || ' days')::interval
      ELSE NULL
    END,
    CASE
      WHEN ps.sort_order = 2 THEN 'Finding it easier to pause before reaching for cannabis in the evenings.'
      ELSE NULL
    END
  FROM public.programme_sessions ps
  WHERE ps.template_id = v_template_id
  ON CONFLICT DO NOTHING;

  IF NOT EXISTS (
    SELECT 1 FROM public.client_messages WHERE client_profile_id = v_client_profile_id
  ) THEN
    INSERT INTO public.client_messages (client_profile_id, author_id, body, created_at)
    VALUES
      (v_client_profile_id, v_admin_id, 'Welcome to your cannabis recovery programme. Session one is ready whenever you feel settled to begin.', NOW() - INTERVAL '12 days'),
      (v_client_profile_id, v_user_id, 'Thank you. I completed the intake questions and I am ready for the first hypnotherapy session.', NOW() - INTERVAL '8 days');
  END IF;
END $$;
