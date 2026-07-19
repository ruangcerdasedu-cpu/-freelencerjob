import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are an AI project mentor. Break down the following job/project into micro-tasks.
Return a JSON object with:
- tasks: array of { order: number, title: string, description: string, technical_guide: string, estimated_hours: number }
- total_estimated_hours: number
- difficulty: "beginner" | "intermediate" | "advanced"
- tools_needed: string[]`

export async function POST(request: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
  }

  const { jobTitle, jobDescription } = await request.json()

  if (!jobDescription) {
    return NextResponse.json({ error: "jobDescription is required" }, { status: 400 })
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${groqKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          {
            role: "user",
            content: `Project: ${jobTitle || "Untitled"}\n\nDescription:\n${jobDescription}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const tasks = JSON.parse(data.choices?.[0]?.message?.content || "{}")

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: "Mentor breakdown failed", details: String(error) }, { status: 500 })
  }
}
