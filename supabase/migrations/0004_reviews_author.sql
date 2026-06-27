-- Reviews were fully anonymous and any authenticated user could insert
-- unlimited rows. Attribute each review to its author (defaulted from the JWT,
-- so it cannot be spoofed from the client), cap one review per user per course,
-- and enforce authorship in RLS.

ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS reviewer_email text DEFAULT auth.email();

-- One review per user per course (legacy rows with no author are exempt).
CREATE UNIQUE INDEX IF NOT EXISTS reviews_unique_per_user_course
  ON public.reviews (school, course, reviewer_email)
  WHERE reviewer_email IS NOT NULL;

-- A user may only insert reviews attributed to their own verified email.
DROP POLICY IF EXISTS "reviews_insert_auth" ON public.reviews;
CREATE POLICY "reviews_insert_auth" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (reviewer_email = auth.email());
