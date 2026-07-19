-- ============================================================
-- FreelencerJob - Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'freelancer' CHECK (role IN ('freelancer', 'admin')),
  skills TEXT[] DEFAULT '{}',
  preferred_platforms TEXT[] DEFAULT '{}',
  hourly_rate_min INTEGER,
  hourly_rate_max INTEGER,
  timezone TEXT DEFAULT 'Asia/Jakarta',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USER API KEYS (encrypted storage)
CREATE TABLE IF NOT EXISTS user_api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('openai', 'anthropic')),
  encrypted_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOBS (from scraper)
CREATE TABLE IF NOT EXISTS jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  external_id TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('upwork', 'freelancer', 'fiverr')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  budget_min INTEGER,
  budget_max INTEGER,
  currency TEXT DEFAULT 'USD',
  job_type TEXT CHECK (job_type IN ('fixed', 'hourly')),
  skills_required TEXT[] DEFAULT '{}',
  client_country TEXT,
  client_rating NUMERIC,
  client_hires INTEGER,
  url TEXT NOT NULL,
  posted_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  ai_compatibility_score INTEGER CHECK (ai_compatibility_score >= 0 AND ai_compatibility_score <= 100),
  ai_risk_level TEXT CHECK (ai_risk_level IN ('low', 'medium', 'high')),
  ai_analysis JSONB,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'saved', 'applied', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(external_id, platform)
);

-- 4. USER JOBS (track user progress per job)
CREATE TABLE IF NOT EXISTS user_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'saved' CHECK (status IN ('saved', 'applied', 'interview', 'in_progress', 'completed', 'paid', 'rejected')),
  notes TEXT,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, job_id)
);

-- 5. MENTOR TASKS (micro-tasks breakdown)
CREATE TABLE IF NOT EXISTS mentor_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_job_id UUID REFERENCES user_jobs(id) ON DELETE CASCADE NOT NULL,
  task_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  technical_guide TEXT,
  estimated_hours NUMERIC,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'done')),
  deliverable_url TEXT,
  ai_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 6. COMMUNICATION DRAFTS
CREATE TABLE IF NOT EXISTS communication_drafts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_job_id UUID REFERENCES user_jobs(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('cover_letter', 'proposal', 'negotiation', 'follow_up', 'revision')),
  context TEXT,
  draft_content TEXT NOT NULL,
  tone TEXT DEFAULT 'professional' CHECK (tone IN ('professional', 'friendly', 'assertive')),
  language TEXT DEFAULT 'en',
  is_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('new_job', 'job_update', 'deadline', 'payment')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id),
  is_read BOOLEAN DEFAULT false,
  sent_via_telegram BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_jobs_platform ON jobs(platform);
CREATE INDEX IF NOT EXISTS idx_jobs_ai_score ON jobs(ai_compatibility_score);
CREATE INDEX IF NOT EXISTS idx_jobs_ai_risk ON jobs(ai_risk_level);
CREATE INDEX IF NOT EXISTS idx_jobs_posted_at ON jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_jobs_user_id ON user_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_jobs_status ON user_jobs(status);
CREATE INDEX IF NOT EXISTS idx_mentor_tasks_user_job ON mentor_tasks(user_job_id);
CREATE INDEX IF NOT EXISTS idx_communication_drafts_user_job ON communication_drafts(user_job_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
CREATE POLICY "Admin can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- API Keys
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own API keys" ON user_api_keys;
CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own API keys" ON user_api_keys;
CREATE POLICY "Users can manage own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- Jobs (readable by authenticated users for MVP)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can view jobs" ON jobs;
CREATE POLICY "Authenticated users can view jobs" ON jobs
  FOR SELECT USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Service role can manage jobs" ON jobs;
CREATE POLICY "Service role can manage jobs" ON jobs
  FOR ALL USING (auth.role() = 'service_role');

-- User Jobs
ALTER TABLE user_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own user_jobs" ON user_jobs;
CREATE POLICY "Users can view own user_jobs" ON user_jobs
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can manage own user_jobs" ON user_jobs;
CREATE POLICY "Users can manage own user_jobs" ON user_jobs
  FOR ALL USING (auth.uid() = user_id);

-- Mentor Tasks
ALTER TABLE mentor_tasks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own mentor tasks" ON mentor_tasks;
CREATE POLICY "Users can view own mentor tasks" ON mentor_tasks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_jobs WHERE id = mentor_tasks.user_job_id AND user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can manage own mentor tasks" ON mentor_tasks;
CREATE POLICY "Users can manage own mentor tasks" ON mentor_tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_jobs WHERE id = mentor_tasks.user_job_id AND user_id = auth.uid())
  );

-- Communication Drafts
ALTER TABLE communication_drafts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own drafts" ON communication_drafts;
CREATE POLICY "Users can view own drafts" ON communication_drafts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_jobs WHERE id = communication_drafts.user_job_id AND user_id = auth.uid())
  );
DROP POLICY IF EXISTS "Users can manage own drafts" ON communication_drafts;
CREATE POLICY "Users can manage own drafts" ON communication_drafts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_jobs WHERE id = communication_drafts.user_job_id AND user_id = auth.uid())
  );

-- Notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- AUTO UPDATE TIMESTAMPS
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- AUTO-CREATE PROFILE ON USER SIGNUP
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, skills, preferred_platforms, timezone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    '{}',
    '{}',
    'Asia/Jakarta'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
