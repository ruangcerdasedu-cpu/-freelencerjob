import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { accessToken, refreshToken } = await req.json()

    if (!accessToken) {
      return NextResponse.json({ error: "accessToken required" }, { status: 400 })
    }

    const supabase = await createClient()

    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || "",
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
