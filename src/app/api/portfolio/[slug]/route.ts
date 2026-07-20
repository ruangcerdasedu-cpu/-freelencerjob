import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"
import type { Profile, UserJob, Job } from "@/types/database"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("portfolio_slug", slug)
      .eq("portfolio_enabled", true)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: "Portfolio not found" }, { status: 404 })
    }

    const { data: userJobs, error: jobsError } = await supabase
      .from("user_jobs")
      .select("*, job:jobs(*)")
      .eq("user_id", profile.id)
      .in("status", ["completed", "paid"])
      .order("created_at", { ascending: false })

    if (jobsError) {
      return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
    }

    return NextResponse.json({
      profile: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        skills: profile.skills,
        hourly_rate_min: profile.hourly_rate_min,
        hourly_rate_max: profile.hourly_rate_max,
        timezone: profile.timezone,
      },
      projects: (userJobs || []).map((uj: UserJob & { job: Job }) => ({
        id: uj.id,
        title: uj.job?.title || "Untitled Project",
        description: uj.job?.description || "",
        platform: uj.job?.platform || "upwork",
        budget_min: uj.job?.budget_min,
        budget_max: uj.job?.budget_max,
        currency: uj.job?.currency || "USD",
        skills_required: uj.job?.skills_required || [],
        client_country: uj.job?.client_country,
        status: uj.status,
        url: uj.job?.url,
        applied_at: uj.applied_at,
        created_at: uj.created_at,
      })),
    })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
