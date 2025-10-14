import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { CreateWorkshopForm } from "./CreateWorkshopForm"

export default async function CreateWorkshopPage() {
  let user
  let hostProfile

  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      redirect("/auth/login")
    }

    user = authUser

    if (!user) {
      redirect("/auth/login")
    }

    const { data, error: profileError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Profile error:", profileError)
    }

    hostProfile = data

    if (!hostProfile) {
      redirect("/dashboard/host/setup")
    }
  } catch (error) {
    console.error("Auth error:", error)
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create a Workshop</h1>
          <p className="text-muted-foreground">Set up a new workshop session for learners to book</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Workshop Details</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateWorkshopForm hostProfile={hostProfile} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
