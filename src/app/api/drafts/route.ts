import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const searchParams = request.nextUrl.searchParams
  const type = searchParams.get("type")

  let query = supabase
    .from("communication_drafts")
    .select("*, user_job:user_jobs!inner(job:jobs(*))")
    .eq("user_job.user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  if (type) query = query.eq("type", type)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await request.json()
  const { jobId, type, draft_content, tone, context, language } = body

  if (!draft_content) {
    return NextResponse.json({ error: "draft_content is required" }, { status: 400 })
  }

  let userJobId = body.user_job_id

  if (jobId && !userJobId) {
    const { data: uj } = await supabase
      .from("user_jobs")
      .upsert({ user_id: user.id, job_id: jobId, status: "saved" }, { onConflict: "user_id, job_id" })
      .select()
      .single()

    if (uj) userJobId = uj.id
  }

  const { data, error } = await supabase
    .from("communication_drafts")
    .insert({
      user_job_id: userJobId || null,
      type: type || "proposal",
      draft_content,
      tone: tone || "professional",
      context: context || null,
      language: language || "en",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const id = request.nextUrl.searchParams.get("id")
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 })

  const { error } = await supabase
    .from("communication_drafts")
    .delete()
    .eq("id", id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
