import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100)

  const { data, error } = await supabase
    .from("chat_history")
    .select("id, title, project_title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { title, project_title, project_description, tasks, messages } = body

  if (!title || !messages) {
    return NextResponse.json({ error: "title and messages are required" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("chat_history")
    .insert({
      user_id: user.id,
      title,
      project_title: project_title || null,
      project_description: project_description || null,
      tasks: tasks || [],
      messages,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
