-- Add locale column to jobs (LN = Luar Negeri, DN = Dalam Negeri)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'LN' CHECK (locale IN ('LN', 'DN'));

CREATE INDEX IF NOT EXISTS idx_jobs_locale ON jobs(locale);
