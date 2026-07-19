import { NextResponse } from "next/server"

export async function POST() {
  const apifyToken = process.env.APIFY_TOKEN

  if (!apifyToken) {
    return NextResponse.json({ error: "APIFY_TOKEN not configured" }, { status: 500 })
  }

  const platforms = [
    {
      actorId: "neatrat/upwork-job-scraper",
      name: "upwork",
      input: {
        searchKeyword: "web development content writing data entry",
        maxLimit: 10,
      },
    },
    {
      actorId: "neatrat/upwork-job-scraper",
      name: "freelancer",
      input: {
        searchKeyword: "web development content writing data entry",
        maxLimit: 10,
      },
    },
  ]

  const runs = []

  for (const platform of platforms) {
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
