-- Add fastwork to platform constraint
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_platform_check;
ALTER TABLE jobs ADD CONSTRAINT jobs_platform_check CHECK (platform IN ('upwork', 'freelancer', 'fiverr', 'fastwork'));
