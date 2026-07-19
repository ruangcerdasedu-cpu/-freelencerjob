import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"
import { XMLParser } from "fast-xml-parser"

interface RssItem {
  title?: string
  link?: string
  description?: string
  pubDate?: string
  category?: string | string[]
}

const FEEDS = [
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=web+development+content+writing+data+entry",
  },
]

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

export async function GET() {
  const supabase = createServiceClient()
  const results: { platform: string; synced: number; error?: string }[] = []

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        results.push({ platform: feed.name, synced: 0, error: `HTTP ${res.status}` })
        continue
      }

      const xml = await res.text()
      const parsed = parser.parse(xml)
      const channel = parsed?.rss?.channel
      const items: RssItem[] = channel?.item ? (Array.isArray(channel.item) ? channel.item : [channel.item]) : []

      let synced = 0

      for (const item of items) {
        const title = item.title || ""
        const link = item.link || ""
        const description = item.description || ""
        const externalId = link || title
        const categories = item.category
        const skills = Array.isArray(categories) ? categories : categories ? [categories] : []

        const { error } = await supabase.from("jobs").upsert(
          {
            external_id: externalId,
            platform: feed.name,
            title: title || "Untitled Job",
            description: description.replace(/<[^>]*>/g, "").substring(0, 5000),
            url: link,
            skills_required: skills,
            posted_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
            status: "new",
          },
          { onConflict: "external_id,platform", ignoreDuplicates: true }
        )

        if (!error) synced++
      }

      results.push({ platform: feed.name, synced })
    } catch (err) {
      results.push({ platform: feed.name, synced: 0, error: String(err) })
    }
  }

  return NextResponse.json({ results })
}

export async function POST() {
  return GET()
}
