-- The live courses/reviews SELECT + INSERT policies had been granted to the
-- `anon` role only. Logged-in users hit these tables as the `authenticated`
-- role, which no policy covered, so RLS silently returned zero rows — the
-- /nus and /ntu course lists rendered empty. Grant read to both roles and
-- restrict insert to authenticated users.

DROP POLICY IF EXISTS "Allow all to view" ON public.courses;
DROP POLICY IF EXISTS "everyone can insert" ON public.courses;
CREATE POLICY "courses_select_all" ON public.courses FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "courses_insert_auth" ON public.courses FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon select" ON public.reviews;
DROP POLICY IF EXISTS "anon insert" ON public.reviews;
CREATE POLICY "reviews_select_all" ON public.reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_insert_auth" ON public.reviews FOR INSERT TO authenticated WITH CHECK (true);
