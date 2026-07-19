import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

const SYSTEM_PROMPT = `You are a senior AI project mentor. Analyze the given freelance project and produce a detailed breakdown.

Return valid JSON with this structure:
{
  "project_summary": "1-2 sentence summary of the project",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "total_completion_percentage": number (0-100, how feasible this project is with AI assistance),
  "estimated_duration": "string like '1-2 weeks' or '3-4 weeks'",
  "tools_recommended": [
    { "name": "ChatGPT", "use_case": "what to use it for", "url": "https://chat.openai.com" },
    { "name": "Claude", "use_case": "what to use it for", "url": "https://claude.ai" },
    { "name": "Gemini", "use_case": "what to use it for", "url": "https://gemini.google.com" },
    { "name": "Cursor AI", "use_case": "what to use it for", "url": "https://cursor.sh" },
    { "name": "GitHub Copilot", "use_case": "what to use it for", "url": "https://github.com/features/copilot" }
  ],
  "tasks": [
    {
      "order": number,
      "title": "Task name",
      "description": "What this task involves",
      "assignee": "ai" | "human" | "both",
      "completion_percentage": number (0-100, how much of the project this task represents),
      "estimated_hours": number,
      "technical_guide": "Step-by-step instructions, include specific prompts for AI tools if assignee is ai or both",
      "deliverable": "What is produced at the end of this task",
      "ai_tools": [
        { "name": "ChatGPT", "how_to_use": "specific prompt or workflow to use" },
        { "name": "Claude", "how_to_use": "specific prompt or workflow to use" }
      ]
    }
  ],
  "competitive_advantages": [
    { "point": "Unique value proposition", "action": "How to communicate this to the client" }
  ],
  "final_deliverable": "Description of the final output the client will receive"
}

Rules:
- Be specific and practical, not generic
- For each ai_tools entry, give an actual prompt template the user can copy-paste
- competitive_advantages should help the user win against other freelancers (e.g., using AI to deliver faster, offering revision rounds, showing portfolio strategy, communication style)
- completion_percentage across all tasks should sum to ~100
- estimated_hours should be realistic for a freelancer with AI assistance`

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
            content: `Project Title: ${jobTitle || "Untitled"}\n\nProject Description:\n${jobDescription}`,
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
    return NextResponse.json({ error: "Mentor breakdown failed", details: String(error) }, { status: 500 })
  }
}
