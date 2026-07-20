import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/client"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = createServiceClient()

    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    if (listError) {
      return NextResponse.json({ error: listError.message }, { status: 500 })
    }

    const user = users.users.find((u) => u.email === email)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (user.email_confirmed_at) {
      return NextResponse.json({ message: "Email already confirmed", email })
    }

    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true,
    })

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Email confirmed successfully", email })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
