import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || "" },
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ user: { id: data.user?.id, email: data.user?.email } })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
