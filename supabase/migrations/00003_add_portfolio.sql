ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS portfolio_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS portfolio_slug TEXT UNIQUE DEFAULT NULL;

-- Create a unique index on portfolio_slug for fast lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_portfolio_slug ON profiles(portfolio_slug) WHERE portfolio_slug IS NOT NULL;
