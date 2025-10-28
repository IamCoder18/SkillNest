import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  console.log("[DEBUG] API /become-host: Starting POST request")

  const supabase = await createClient()
  console.log("[DEBUG] API /become-host: Created Supabase client")

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  console.log("[DEBUG] API /become-host: getUser result", { user: user ? { id: user.id, email: user.email } : null, error: userError })

  if (!user) {
    console.log("[DEBUG] API /become-host: No user found, returning 401")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  console.log("[DEBUG] API /become-host: User authenticated, checking host profile")

  // Check if user already has a host profile
  const { data: hostProfile, error: hostProfileError } = await supabase
    .from("host_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()
  console.log("[DEBUG] API /become-host: Host profile query result", { hostProfile, error: hostProfileError })

  if (hostProfile) {
    console.log("[DEBUG] API /become-host: Host profile exists, updating is_host to true")
    // If host profile exists, just set is_host to true
    const { error } = await supabase
      .from("profiles")
      .update({ is_host: true })
      .eq("id", user.id)

    if (error) {
      console.log("[DEBUG] API /become-host: Error updating profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("[DEBUG] API /become-host: Profile updated successfully, redirecting to /dashboard/host")
    return NextResponse.json({ success: true, redirect: "/dashboard/host" })
  } else {
    console.log("[DEBUG] API /become-host: No host profile, redirecting to setup")
    // If no host profile, redirect to setup
    return NextResponse.json({ success: true, redirect: "/dashboard/host/setup" })
  }
}