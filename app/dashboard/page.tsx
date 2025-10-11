import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: hostProfile } = await supabase.from("host_profiles").select("*").eq("user_id", user.id).maybeSingle()

  // Redirect based on user type
  if (hostProfile) {
    redirect("/dashboard/host")
  } else {
    redirect("/dashboard/learner")
  }
}
