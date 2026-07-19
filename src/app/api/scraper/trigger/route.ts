import { NextResponse } from "next/server"

const ACTORS: { actorId: string; name: string; input: Record<string, unknown> }[] = [
  {
    actorId: "drobnikj/jobs-scraper",
    name: "upwork",
    input: {
      keywords: "web development content writing data entry",
      maxItems: 10,
    },
  },
  {
    actorId: "drobnikj/jobs-scraper",
    name: "freelancer",
    input: {
      keywords: "web development content writing data entry",
      maxItems: 10,
    },
  },
]

export async function POST() {
  const apifyToken = process.env.APIFY_TOKEN

  if (!apifyToken) {
    return NextResponse.json({ error: "APIFY_TOKEN not configured" }, { status: 500 })
  }

  const runs = []

  for (const platform of ACTORS) {
    try {
      const actorUrlName = platform.actorId.replace("/", "~")
      const response = await fetch(
        `https://api.apify.com/v2/acts/${actorUrlName}/runs?token=${apifyToken}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(platform.input),
        }
      )

      const data = await response.json()
      runs.push({
        platform: platform.name,
        actorId: platform.actorId,
        runId: data.data?.id || null,
        status: data.data?.status || "unknown",
      })
    } catch (err) {
      runs.push({
        platform: platform.name,
        actorId: platform.actorId,
        error: String(err),
      })
    }
  }

  return NextResponse.json({ runs })
}
