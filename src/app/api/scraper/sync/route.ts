import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const runId = searchParams.get("runId")
  const platform = searchParams.get("platform")

  if (!runId || !platform) {
    return NextResponse.json({ error: "runId and platform are required" }, { status: 400 })
  }

  const apifyToken = process.env.APIFY_TOKEN
  if (!apifyToken) {
    return NextResponse.json({ error: "APIFY_TOKEN not configured" }, { status: 500 })
  }

  try {
    const runRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`
    )
    if (!runRes.ok) {
      return NextResponse.json({ error: "Failed to fetch Apify run" }, { status: runRes.status })
    }
    const runData = await runRes.json()
    const datasetId = runData.data?.defaultDatasetId
    if (!datasetId) {
      return NextResponse.json({ error: "No dataset ID found for this run" }, { status: 404 })
    }

    const itemsRes = await fetch(
      `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
    )
    if (!itemsRes.ok) {
      return NextResponse.json({ error: "Failed to fetch Apify dataset items" }, { status: itemsRes.status })
    }

    const items: Record<string, unknown>[] = await itemsRes.json()
    const supabase = createServiceClient()
    let synced = 0

    for (const item of items) {
      const title = String(item.title || item.name || "")
      const description = String(item.description || "")
      const url = String(item.url || item.jobUrl || "")
      const externalId = String(item.externalId || item.jobId || item.id || url)
      const budgetRaw = item.budget || item.price || item.rate
      let budgetMin: number | null = null
      let budgetMax: number | null = null
      if (typeof budgetRaw === "string") {
        const nums = budgetRaw.replace(/[^0-9.-]/g, " ").match(/\d+(\.\d+)?/g)
        if (nums) {
          const vals = nums.map(Number)
          budgetMin = Math.min(...vals)
          budgetMax = Math.max(...vals)
        }
      } else if (typeof budgetRaw === "number") {
        budgetMin = budgetRaw
        budgetMax = budgetRaw
      }
      const currency = String(item.currency || "USD")
      const skillsRaw = item.skills || item.requiredSkills || []
      const skills: string[] = Array.isArray(skillsRaw) ? skillsRaw.map(String) : typeof skillsRaw === "string" ? skillsRaw.split(",").map(s => s.trim()) : []
      const clientRaw = item.client as Record<string, unknown> | undefined
      const clientCountry = String(item.clientCountry || item.country || clientRaw?.country || "")
      const clientRating = item.clientRating || item.rating || clientRaw?.rating || null
      const clientHires = item.clientHires || item.hires || clientRaw?.totalHires || null
      const postedAt = String(item.postedAt || item.datePublished || item.publishedDate || "")

      const { error } = await supabase.from("jobs").upsert(
        {
          external_id: externalId,
          platform: platform as string,
          title: title || "Untitled Job",
          description,
          url,
          budget_min: budgetMin,
          budget_max: budgetMax,
          currency,
          skills_required: skills,
          client_country: clientCountry || null,
          client_rating: clientRating ? Number(clientRating) : null,
          client_hires: clientHires ? Number(clientHires) : null,
          posted_at: postedAt || null,
          status: "new",
        },
        { onConflict: "external_id,platform" }
      )

      if (!error) synced++
    }

    return NextResponse.json({ synced, total: items.length })
  } catch {
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
