-- Add status column to courses if it does not already exist
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

-- Approve any existing rows that were inserted without a status value
UPDATE public.courses SET status = 'approved' WHERE status IS NULL;
