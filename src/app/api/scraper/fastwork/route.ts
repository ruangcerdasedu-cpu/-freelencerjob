import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

const FASTWORK_SITEMAP = "https://fastwork.id/sitemap-products-id.xml"
const MAX_PRODUCTS = 50

async function fetchSitemapUrls(): Promise<string[]> {
  const https = await import("https")
  const zlib = await import("zlib")

  return new Promise((resolve, reject) => {
    https.get(FASTWORK_SITEMAP, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
      const gunzip = zlib.createGunzip()
      const stream = res.pipe(gunzip)
      let data = ""
      let aborted = false

      stream.on("data", (chunk: Buffer) => {
        data += chunk.toString()
        // Stop once we have enough URLs
        if (data.length > 500000 && !aborted) {
          aborted = true
          stream.destroy()
          res.destroy()
        }
      })

      stream.on("end", () => {
        const urls: string[] = []
        const regex = /<loc>(https:\/\/fastwork\.id\/[^<]+)<\/loc>/g
        let match
        while ((match = regex.exec(data)) !== null) {
          urls.push(match[1])
        }
        resolve(urls)
      })

      stream.on("error", reject)
    }).on("error", reject)
  })
}

async function fetchProductMeta(url: string): Promise<{ title: string; description: string } | null> {
  const https = await import("https")

  return new Promise((resolve) => {
    https.get(url, { headers: { "User-Agent": "Mozilla/5.0" }, timeout: 10000 }, (res) => {
      let html = ""
      res.on("data", (chunk: Buffer) => {
        html += chunk.toString()
        if (html.length > 50000) res.destroy()
      })
      res.on("end", () => {
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
        const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
        const ogTitleMatch = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
        const title = ogTitleMatch?.[1] || titleMatch?.[1]?.replace(/\s*\|\s*Fastwork.*$/, "") || "Untitled"
        const description = descMatch?.[1] || title
        resolve({ title: title.trim(), description: description.trim() })
      })
      res.on("error", () => resolve(null))
    }).on("error", () => resolve(null))
  })
}

export async function GET() {
  const supabase = createServiceClient()

  try {
    const allUrls = await fetchSitemapUrls()
    const productUrls = allUrls.filter((u) => {
      const path = new URL(u).pathname
      // Skip category/subcategory pages
      if (["/", "/search", "/how", "/faq", "/terms", "/privacy", "/promotion", "/enterprise", "/start-selling"].includes(path)) return false
      if (path.split("/").filter(Boolean).length < 2) return false
      return true
    }).slice(0, MAX_PRODUCTS)

    let synced = 0
    const errors: string[] = []

    for (const url of productUrls) {
      const meta = await fetchProductMeta(url)
      if (!meta) {
        errors.push(`Failed to fetch: ${url}`)
        continue
      }

      const externalId = `fastwork_${Buffer.from(url).toString("base64url").slice(0, 40)}`
      const priceMatch = meta.title.match(/Rp\s?([0-9.]+)/)
      const title = meta.title.replace(/\s*Rp\s?[0-9.]+,?[0-9]*/g, "").trim()

      const { error } = await supabase.from("jobs").upsert(
        {
          external_id: externalId,
          platform: "fastwork",
          locale: "DN",
          title: title || meta.title.substring(0, 200),
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
      await new Promise((r) => setTimeout(r, 500)) // rate limit
    }

    return NextResponse.json({
      success: true,
      synced,
      total: productUrls.length,
      errors: errors.length,
    })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST() {
  return GET()
}
