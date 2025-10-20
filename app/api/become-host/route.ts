import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Check if user already has a host profile
  const { data: hostProfile } = await supabase
    .from("host_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (hostProfile) {
    // If host profile exists, just set is_host to true
    const { error } = await supabase
      .from("profiles")
      .update({ is_host: true })
      .eq("id", user.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, redirect: "/dashboard/host" })
  } else {
    // If no host profile, redirect to setup
    return NextResponse.json({ success: true, redirect: "/dashboard/host/setup" })
  }
}