import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, url, budget_min, budget_max, currency, skills, client_country, locale } = body

    if (!title || !description) {
      return NextResponse.json({ error: "title and description are required" }, { status: 400 })
    }

    const supabase = createServiceClient()
    const externalId = `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        external_id: externalId,
        platform: "freelancer",
        locale: locale || "LN",
        title,
        description,
        url: url || "",
        budget_min: budget_min ? parseInt(budget_min) : null,
        budget_max: budget_max ? parseInt(budget_max) : null,
        currency: currency || "USD",
        job_type: null,
        skills_required: skills ? skills.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
        client_country: client_country || null,
        posted_at: new Date().toISOString(),
        status: "new",
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ job: data }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create job"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
