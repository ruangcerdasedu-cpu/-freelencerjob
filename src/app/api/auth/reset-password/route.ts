import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await createClient()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/login?reset=true`,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Password reset email sent", email })
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
