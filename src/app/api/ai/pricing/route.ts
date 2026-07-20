import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are a freelance pricing strategist. Analyze the job and the freelancer's profile to suggest optimal pricing.

Return valid JSON with:
- suggested_rate_min: number (minimum competitive rate in USD)
- suggested_rate_max: number (maximum competitive rate in USD)
- market_average: number (average market rate for this type of work)
- your_skill_value: number (0-100, how much the freelancer's skills add value)
- is_competitive: boolean (whether the freelancer's rate is competitive)
- reasoning: string (explanation of the pricing strategy)
- negotiation_tips: string[] (specific tips for negotiating with this client)
- pricing_strategy: "premium" | "competitive" | "penetration" (recommended approach)
- red_flags: string[] (budget-related concerns)`

export async function POST(request: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
  }

  const { jobTitle, jobDescription, budgetMin, budgetMax, userSkills, userRateMin, userRateMax } = await request.json()

  if (!jobDescription) {
    return NextResponse.json({ error: "jobDescription is required" }, { status: 400 })
  }

  try {
    const userProfile = [
      userSkills?.length ? `Your Skills: ${userSkills.join(", ")}` : "",
      userRateMin ? `Your Usual Rate: $${userRateMin}/hr${userRateMax ? ` - $${userRateMax}/hr` : ""}` : "",
    ].filter(Boolean).join("\n")

    const budgetInfo = budgetMin || budgetMax
      ? `Client Budget: ${budgetMin ? `$${budgetMin}` : ""}${budgetMin && budgetMax ? " - " : ""}${budgetMax ? `$${budgetMax}` : ""}`
      : ""

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
            content: [
              `Job Title: ${jobTitle || "Untitled"}`,
              `Job Description: ${jobDescription}`,
              budgetInfo,
              userProfile,
            ].filter(Boolean).join("\n\n"),
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const result = JSON.parse(data.choices?.[0]?.message?.content || "{}")

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Pricing analysis failed", details: String(error) }, { status: 500 })
  }
}
