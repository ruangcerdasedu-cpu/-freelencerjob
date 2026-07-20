import { NextRequest, NextResponse } from "next/server"

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

export async function POST(request: NextRequest) {
  const groqKey = process.env.GROQ_API_KEY

  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY not configured" }, { status: 500 })
  }

  const { projectTitle, projectDescription, tasks, userQuestion, chatHistory } = await request.json()

  if (!userQuestion) {
    return NextResponse.json({ error: "userQuestion is required" }, { status: 400 })
  }

  const tasksContext = tasks?.length
    ? tasks.map((t: any) =>
        `Task ${t.order}: ${t.title}\nDescription: ${t.description}\nSub-steps: ${(t.sub_steps || []).join(", ")}\nTools: ${(t.tools || []).map((tl: any) => `${tl.name} (${tl.cost_detail})`).join(", ")}`
      ).join("\n\n")
    : "No tasks generated yet."

  const historyContext = chatHistory?.length
    ? chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n")
    : ""

  const systemPrompt = `You are a friendly AI mentor assistant embedded in a freelance project dashboard. You help beginners understand their project tasks and guide them step by step.

You have full context of the user's project. Answer clearly, simply, and in the same language the user asked in (Indonesian or English).

Context:
Project Title: ${projectTitle || "Untitled"}
Project Description: ${projectDescription || "Not provided"}

Generated Tasks:
${tasksContext}

${historyContext ? `\nChat History:\n${historyContext}` : ""}

Guidelines:
- Answer in a conversational, helpful tone
- If the user says a step is unclear, re-explain it differently
- Suggest free tools whenever possible
- Provide specific prompt templates the user can copy-paste to AI tools
- Keep answers concise but thorough
- If you recommend code or commands, show them`
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userQuestion },
        ],
        temperature: 0.3,
      }),
    })

    const data = await response.json()
    const answer = data.choices?.[0]?.message?.content || "Maaf, saya tidak bisa menjawab saat ini. Silakan coba lagi."

    return NextResponse.json({ answer })
  } catch (error) {
    return NextResponse.json({ error: "Chat failed", details: String(error) }, { status: 500 })
  }
}
