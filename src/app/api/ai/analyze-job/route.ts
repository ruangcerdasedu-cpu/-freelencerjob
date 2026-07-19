import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are an AI job analyzer for a freelance platform. Analyze the job description and return a JSON object with:
- compatibility_score: number 0-100 (how suitable this job is for AI-assisted work)
- risk_level: "low" | "medium" | "high" (risk of the job being problematic)
- required_skills: string[] (skills needed)
- estimated_hours: number (estimated hours to complete)
- reasoning: string (brief explanation)
- red_flags: string[] (potential issues like unclear scope, unrealistic budget)`

export async function POST(request: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
  }

  const { jobId, title, description } = await request.json()

  if (!description) {
    return NextResponse.json({ error: "description is required" }, { status: 400 })
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
            content: `Title: ${title || "Untitled"}\n\nDescription:\n${description}`,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const analysis = JSON.parse(data.choices?.[0]?.message?.content || "{}")

    if (jobId) {
      const supabase = (await import("@/lib/supabase/client")).createServiceClient()
      await supabase.from("jobs").update({
        ai_compatibility_score: analysis.compatibility_score,
        ai_risk_level: analysis.risk_level,
        ai_analysis: analysis,
      }).eq("id", jobId)
    }

    return NextResponse.json(analysis)
  } catch (error) {
    return NextResponse.json({ error: "Analysis failed", details: String(error) }, { status: 500 })
  }
}
