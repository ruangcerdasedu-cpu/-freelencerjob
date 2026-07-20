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

interface FeedEntry {
  name: string
  url: string
  locale: "LN" | "DN"
}

const FEEDS: FeedEntry[] = [
  // === LUAR NEGERI (International) ===
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=web+development+react+nodejs+nextjs+typescript+python",
    locale: "LN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=data+entry+excel+virtual+assistant+admin",
    locale: "LN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=graphic+design+logo+photoshop+illustrator+figma+ui+ux",
    locale: "LN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=content+writing+copywriting+blog+seo+article",
    locale: "LN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=mobile+app+flutter+react+native+swift+kotlin+android",
    locale: "LN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=wordpress+laravel+php+shopify+woocommerce+ecommerce",
    locale: "LN",
  },
  // === DALAM NEGERI (Indonesia) ===
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=desain+grafis+logo+branding+illustrator+photoshop+figma",
    locale: "DN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=pembuatan+website+wordpress+laravel+php+html+css",
    locale: "DN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=data+entry+excel+admin+virtual+asisten+indonesia",
    locale: "DN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=penulisan+konten+artikel+copywriting+seo+blog+indonesia",
    locale: "DN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=aplikasi+mobile+flutter+android+kotlin+indonesia",
    locale: "DN",
  },
  {
    name: "freelancer",
    url: "https://www.freelancer.com/rss.xml?keyword=video+editing+animasi+3d+blender+after+effects+premiere+indonesia",
    locale: "DN",
  },
]

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
})

export async function GET() {
  const supabase = createServiceClient()
  const results: { platform: string; synced: number; total: number; error?: string }[] = []
  const seen = new Set<string>()

  for (const feed of FEEDS) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(15000),
      })

      if (!res.ok) {
        results.push({ platform: feed.name, synced: 0, total: 0, error: `HTTP ${res.status}` })
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
        if (seen.has(externalId)) continue
        seen.add(externalId)

        const categories = item.category
        const skills = Array.isArray(categories) ? categories : categories ? [categories] : []

        const { error } = await supabase.from("jobs").upsert(
          {
            external_id: externalId,
            platform: feed.name,
            locale: feed.locale,
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

      results.push({ platform: feed.name, synced, total: items.length })
    } catch (err) {
      results.push({ platform: feed.name, synced: 0, total: 0, error: String(err) })
    }
  }

  return NextResponse.json({ results })
}

export async function POST() {
  return GET()
}
