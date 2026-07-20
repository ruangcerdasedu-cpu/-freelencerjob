import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

const MAX_PRODUCTS = 10

// Fetch sitemap and extract Fastwork product/service URLs (stream, max 300KB)
async function fetchProductUrls(): Promise<string[]> {
  const res = await fetch("https://fastwork.id/sitemap-products-id.xml", {
    headers: { "User-Agent": "Mozilla/5.0", "Accept-Encoding": "gzip" },
    signal: AbortSignal.timeout(20000),
  })

  if (!res.ok) throw new Error(`Sitemap HTTP ${res.status}`)

  const reader = res.body?.getReader()
  if (!reader) throw new Error("No response body")

  const decoder = new TextDecoder()
  let xml = ""
  const maxBytes = 300_000

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    xml += decoder.decode(value, { stream: true })
    if (xml.length >= maxBytes) break
  }
  reader.cancel()

  const urls: string[] = []
  const regex = /<loc>(https:\/\/fastwork\.id[^<]+)<\/loc>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    urls.push(match[1])
  }
  return urls
}

// Extract title + description from a product page's HTML meta tags
async function fetchProductMeta(url: string): Promise<{ title: string; description: string } | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return null

    const html = await res.text()
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)

    const title = ogTitleMatch?.[1] || titleMatch?.[1]?.replace(/\s*\|\s*Fastwork.*$/i, "").trim() || ""
    const description = descMatch?.[1] || title

    return { title: title.trim(), description: description.trim() }
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = createServiceClient()

  try {
    const allUrls = await fetchProductUrls()

    // Filter out category/subcategory pages, keep only actual product/service pages
    const skipPaths = new Set(["/", "/search", "/how", "/faq", "/terms", "/privacy", "/promotion", "/enterprise", "/start-selling", "/sitemaps"])
    const productUrls = allUrls
      .filter((u) => {
        try {
          const path = new URL(u).pathname.replace(/\/$/, "")
          if (skipPaths.has(path)) return false
          const parts = path.split("/").filter(Boolean)
          if (parts.length < 2) return false // need at least category/product
          return true
        } catch {
          return false
        }
      })
      .slice(0, MAX_PRODUCTS)

    let synced = 0
    const errors: string[] = []

    for (const url of productUrls) {
      const meta = await fetchProductMeta(url)
      if (!meta || !meta.title) {
        errors.push(`No meta for: ${url}`)
        continue
      }

      const externalId = `fastwork_${Buffer.from(url).toString("base64url").slice(0, 36)}`
      const priceMatch = meta.title.match(/Rp\s?([0-9.]+)/)
      const title = meta.title.replace(/\s*Rp\s?[0-9.]+,?[0-9]*/g, "").trim() || meta.title.substring(0, 200)

      const { error } = await supabase.from("jobs").upsert(
        {
          external_id: externalId,
          platform: "fastwork",
          locale: "DN",
          title: title.substring(0, 255),
          description: meta.description.substring(0, 5000),
          url,
          budget_min: priceMatch ? parseInt(priceMatch[1].replace(/\./g, "")) : null,
          currency: "IDR",
          skills_required: [],
          posted_at: new Date().toISOString(),
          status: "new",
        },
        { onConflict: "external_id,platform", ignoreDuplicates: true }
      )

      if (!error) synced++
    }

    return NextResponse.json({
      success: true,
      synced,
      total: productUrls.length,
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
