export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  role: "freelancer" | "admin"
  skills: string[]
  preferred_platforms: string[]
  hourly_rate_min: number | null
  hourly_rate_max: number | null
  timezone: string
  portfolio_enabled: boolean
  portfolio_slug: string | null
  created_at: string
  updated_at: string
}

export interface UserApiKey {
  id: string
  user_id: string
  provider: "openai" | "anthropic"
  encrypted_key: string
  is_active: boolean
  created_at: string
}

export interface Job {
  id: string
  external_id: string
  platform: "upwork" | "freelancer" | "fiverr"
  title: string
  description: string
  budget_min: number | null
  budget_max: number | null
  currency: string
  job_type: "fixed" | "hourly" | null
  skills_required: string[]
  client_country: string | null
  client_rating: number | null
  client_hires: number | null
  url: string
  posted_at: string | null
  scraped_at: string
  ai_compatibility_score: number | null
  ai_risk_level: "low" | "medium" | "high" | null
  ai_analysis: Json | null
  status: "new" | "saved" | "applied" | "rejected"
  created_at: string
}

export interface UserJob {
  id: string
  user_id: string
  job_id: string
  job?: Job
  status: "saved" | "applied" | "interview" | "in_progress" | "completed" | "paid" | "rejected"
  notes: string | null
  applied_at: string | null
  created_at: string
}

export interface MentorTask {
  id: string
  user_job_id: string
  task_order: number
  title: string
  description: string | null
  technical_guide: string | null
  estimated_hours: number | null
  status: "pending" | "in_progress" | "review" | "done"
  deliverable_url: string | null
  ai_feedback: string | null
  created_at: string
  completed_at: string | null
}

export interface CommunicationDraft {
  id: string
  user_job_id: string
  type: "cover_letter" | "proposal" | "negotiation" | "follow_up" | "revision"
  context: string | null
  draft_content: string
  tone: "professional" | "friendly" | "assertive"
  language: string
  is_sent: boolean
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: "new_job" | "job_update" | "deadline" | "payment"
  title: string
  message: string
  job_id: string | null
  is_read: boolean
  sent_via_telegram: boolean
  created_at: string
}
