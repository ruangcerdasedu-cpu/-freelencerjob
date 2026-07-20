import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

const MAX_PRODUCTS = 10

// Fetch sitemap and extract job URLs from Fastwork Job Board
async function fetchJobUrls(): Promise<string[]> {
  const res = await fetch("https://jobboard.fastwork.id/sitemap-jobs.xml", {
    headers: { "User-Agent": "Mozilla/5.0" },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Sitemap HTTP ${res.status}`)

  const xml = await res.text()
  const urls: string[] = []
  const regex = /<loc>(https:\/\/jobboard\.fastwork\.id[^<]+)<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// Fetch a job detail page and extract data from __NEXT_DATA__ JSON
async function fetchJobDetail(url: string): Promise<{
  title: string
  description: string
  budget: number | null
  skills: string[]
  postedAt: string
  status: string
  category: string
} | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(10000),
    })
    if (!res.ok) return null

    const html = await res.text()

    // Extract __NEXT_DATA__ JSON
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
    if (!match) return null

    const json = JSON.parse(match[1])
    const jobQuery = json?.props?.pageProps?.dehydratedState?.queries?.find(
      (q: any) => q.queryKey?.[0] === "JOB"
    )
    const data = jobQuery?.state?.data?.data
    if (!data) return null

    const budget = parseInt(data.budget) || null
    const category = data.tag?.name || ""
    const status = data.status === "open" ? "new" : "closed"

    return {
      title: data.title || "",
      description: data.description || "",
      budget: budget,
      skills: category ? [category] : [],
      postedAt: data.inserted_at || new Date().toISOString(),
      status: status,
      category: category,
    }
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = createServiceClient()
  const results: { url: string; title: string; status: string }[] = []
  const errors: string[] = []

  try {
    const allUrls = await fetchJobUrls()
    const urls = allUrls.slice(0, MAX_PRODUCTS)

    for (const url of urls) {
      const detail = await fetchJobDetail(url)
      if (!detail) {
        errors.push(`No data: ${url}`)
        continue
      }

      const jobId = url.split("/").pop() || url
      const externalId = `fastwork_${jobId}`

      const { error } = await supabase.from("jobs").upsert(
        {
          external_id: externalId,
          platform: "fastwork",
          locale: "DN",
          title: detail.title.substring(0, 255),
          description: detail.description.substring(0, 5000),
          url,
          budget_min: detail.budget,
          currency: "IDR",
          skills_required: detail.skills,
          posted_at: detail.postedAt,
          status: detail.status,
        },
        { onConflict: "external_id,platform", ignoreDuplicates: true }
      )

      if (!error) {
        results.push({ url, title: detail.title, status: detail.status })
      }
    }

    return NextResponse.json({
      success: true,
      synced: results.length,
      total: urls.length,
      errors: errors.length,
      errorDetails: errors.slice(0, 5),
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}