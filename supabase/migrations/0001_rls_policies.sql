-- Add unique constraint on email (required for upsert in onAuthStateChange)
ALTER TABLE public.users ADD CONSTRAINT IF NOT EXISTS users_email_key UNIQUE (email);

-- Enable RLS on all public tables
ALTER TABLE public.users   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- ── users ──────────────────────────────────────────────────────────────────
-- Authenticated users can only access their own row
CREATE POLICY "users: select own"
  ON public.users FOR SELECT TO authenticated
  USING (auth.email() = email);

CREATE POLICY "users: insert own"
  ON public.users FOR INSERT TO authenticated
  WITH CHECK (auth.email() = email);

CREATE POLICY "users: update own"
  ON public.users FOR UPDATE TO authenticated
  USING     (auth.email() = email)
  WITH CHECK (auth.email() = email);

-- ── reviews ────────────────────────────────────────────────────────────────
-- Anyone authenticated can read; only authenticated users can insert
CREATE POLICY "reviews: select all"
  ON public.reviews FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "reviews: insert auth"
  ON public.reviews FOR INSERT TO authenticated
  WITH CHECK (true);

-- ── courses ────────────────────────────────────────────────────────────────
-- Anyone authenticated can read; only authenticated users can insert
CREATE POLICY "courses: select all"
  ON public.courses FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "courses: insert auth"
  ON public.courses FOR INSERT TO authenticated
  WITH CHECK (true);

-- Back-fill: courses added before the status field was set on insert
UPDATE public.courses SET status = 'approved' WHERE status IS NULL;
