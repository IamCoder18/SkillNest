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

  const { data: profile } = await supabase.from("profiles").select("is_host").eq("id", user.id).maybeSingle()

  // Redirect based on user type
  if (profile?.is_host) {
    redirect("/dashboard/host")
  } else {
    redirect("/dashboard/learner")
  }
}
