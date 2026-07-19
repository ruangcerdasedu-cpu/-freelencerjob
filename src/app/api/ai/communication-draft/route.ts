import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are an AI communication assistant for freelancers. 
Generate professional message drafts based on the context provided.

Return a JSON object with:
- subject: string
- body: string (formatted message)
- tone: "professional" | "friendly" | "assertive"
- key_points: string[]`

export async function POST(request: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
  }

  const { draftType, jobTitle, clientMessage, context } = await request.json()

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
            content: `Type: ${draftType || "proposal"}\nJob: ${jobTitle || "Untitled"}\nClient: ${clientMessage || "N/A"}\nContext: ${context || "N/A"}`,
          },
        ],
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const draft = JSON.parse(data.choices?.[0]?.message?.content || "{}")

    return NextResponse.json(draft)
  } catch (error) {
    return NextResponse.json({ error: "Draft generation failed", details: String(error) }, { status: 500 })
  }
}
