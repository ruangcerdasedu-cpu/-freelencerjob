import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/client"
import PortfolioClient from "./client"

export default async function PortfolioPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("portfolio_slug", slug)
    .eq("portfolio_enabled", true)
    .single()

  if (!profile) notFound()

  const { data: userJobs } = await supabase
    .from("user_jobs")
    .select("*, job:jobs(*)")
    .eq("user_id", profile.id)
    .in("status", ["completed", "paid"])
    .order("created_at", { ascending: false })

  const projects = (userJobs || []).map((uj: any) => ({
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
  }))

  return <PortfolioClient profile={profile} projects={projects} />
}
