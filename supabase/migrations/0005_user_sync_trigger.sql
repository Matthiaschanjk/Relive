-- Maintain public.users from auth.users with a trigger, replacing the
-- client-side upsert that used to live in AuthContext.jsx. The client write
-- could fail silently under RLS or be skipped entirely (it never ran for
-- pre-migration accounts), which left returning users without a row.
--
-- The school-domain mapping below mirrors src/schoolVerify.js — keep the two
-- in sync when adding domains.

-- Migration 0001 tried `ADD CONSTRAINT IF NOT EXISTS users_email_key` — that
-- is not valid Postgres syntax, so the constraint never existed in production
-- (and every client-side upsert with onConflict:'email' silently failed).
-- The trigger's ON CONFLICT below requires it.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'users_email_key' AND conrelid = 'public.users'::regclass
  ) THEN
    ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.school_for_email(p_email text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE lower(split_part(p_email, '@', 2))
    WHEN 'u.nus.edu.sg'           THEN 'NUS'
    WHEN 'nus.edu.sg'             THEN 'NUS'
    WHEN 'comp.nus.edu.sg'        THEN 'NUS'
    WHEN 'u.yale-nus.edu.sg'      THEN 'NUS'
    WHEN 'e.ntu.edu.sg'           THEN 'NTU'
    WHEN 'ntu.edu.sg'             THEN 'NTU'
    WHEN 'student.ntu.edu.sg'     THEN 'NTU'
    WHEN 'nie.edu.sg'             THEN 'NTU'
    WHEN 'smu.edu.sg'             THEN 'SMU'
    WHEN 'sis.smu.edu.sg'         THEN 'SMU'
    WHEN 'accountancy.smu.edu.sg' THEN 'SMU'
    WHEN 'business.smu.edu.sg'    THEN 'SMU'
    WHEN 'economics.smu.edu.sg'   THEN 'SMU'
    WHEN 'law.smu.edu.sg'         THEN 'SMU'
    WHEN 'socsc.smu.edu.sg'       THEN 'SMU'
    WHEN 'mymail.sutd.edu.sg'     THEN 'SUTD'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.handle_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school text := public.school_for_email(NEW.email);
BEGIN
  INSERT INTO public.users (email, name, verified, school, sign_in_by)
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.email),
    v_school IS NOT NULL,
    v_school,
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email')
  )
  ON CONFLICT (email) DO UPDATE SET
    name       = EXCLUDED.name,
    verified   = EXCLUDED.verified,
    school     = EXCLUDED.school,
    sign_in_by = EXCLUDED.sign_in_by;
  RETURN NEW;
END;
$$;

-- Only confirmed users get a public.users row — failed/abandoned OTP attempts
-- leave unconfirmed auth.users rows behind, and those must not pollute the
-- app table. No column list on UPDATE: confirmation may update only
-- email_confirmed_at, and the upsert is idempotent anyway.
DROP TRIGGER IF EXISTS on_auth_user_upsert ON auth.users;
CREATE TRIGGER on_auth_user_upsert
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  WHEN (NEW.email IS NOT NULL AND NEW.email_confirmed_at IS NOT NULL)
  EXECUTE FUNCTION public.handle_auth_user();

-- Backfill rows for auth users created before this trigger existed
-- (fixes returning users who had no public.users row).
INSERT INTO public.users (email, name, verified, school, sign_in_by)
SELECT
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', u.email),
  public.school_for_email(u.email) IS NOT NULL,
  public.school_for_email(u.email),
  COALESCE(u.raw_app_meta_data->>'provider', 'email')
FROM auth.users u
WHERE u.email IS NOT NULL AND u.email_confirmed_at IS NOT NULL
ON CONFLICT (email) DO NOTHING;
