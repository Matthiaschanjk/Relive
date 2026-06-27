-- Moderation queue for reviews and courses.
--
-- Both tables now default to status='pending'; nothing is shown on the site
-- until an admin approves it from the in-app /admin page. This replaces the
-- ad-hoc "edit rows in the dashboard" workflow.
--
-- Reviews were previously un-submittable from the app: the INSERT policy
-- required `reviewer_email = auth.email()` but the client never sent the
-- column and relied on its `auth.email()` default — fragile. A BEFORE INSERT
-- trigger now stamps reviewer_email (and forces pending) server-side, so the
-- policy no longer depends on the client.

-- ── reviews: status column ──────────────────────────────────────────────────
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'pending';

-- Existing reviews are already live — keep them visible.
UPDATE public.reviews SET status = 'approved' WHERE status = 'pending';

-- Stamp author + force pending on every client insert (admins update later).
CREATE OR REPLACE FUNCTION public.reviews_set_meta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.reviewer_email := auth.email();
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reviews_set_meta_trg ON public.reviews;
CREATE TRIGGER reviews_set_meta_trg
  BEFORE INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.reviews_set_meta();

-- Author integrity is guaranteed by the trigger; the unique index
-- reviews_unique_per_user_course still enforces one review per user/course.
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_insert_auth"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (status = 'pending');

-- ── courses: force pending on insert ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.courses_set_pending()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.status := 'pending';
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS courses_set_pending_trg ON public.courses;
CREATE TRIGGER courses_set_pending_trg
  BEFORE INSERT ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.courses_set_pending();

DROP POLICY IF EXISTS "courses_insert_auth" ON public.courses;
CREATE POLICY "courses_insert_auth"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (status = 'pending');

-- ── admin role ──────────────────────────────────────────────────────────────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

UPDATE public.users SET is_admin = true WHERE email = 'matthiaschanjiakai@gmail.com';

-- SECURITY DEFINER so the lookup bypasses RLS on public.users (and can't recurse
-- into the policies that call it). Keyed by email — public.users.id is its own
-- bigint, not auth.uid().
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users WHERE email = auth.email() AND is_admin
  );
$$;

-- Replace the internal-role-only update policy with one usable by the admin user.
DROP POLICY IF EXISTS "Admins can update status" ON public.courses;

DROP POLICY IF EXISTS "courses_admin_update" ON public.courses;
CREATE POLICY "courses_admin_update"
  ON public.courses FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_admin_update" ON public.reviews;
CREATE POLICY "reviews_admin_update"
  ON public.reviews FOR UPDATE TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());
