import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar, Clock, MapPin, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CompleteWorkshopFormClient } from "@/components/complete-workshop-form-client"

export default async function CompleteWorkshopPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get workshop details
  const { data: workshop, error: workshopError } = await supabase
    .from("workshops")
    .select(
      `
      *,
      host_profiles!host_id(user_id),
      bookings!workshop_id(
        id,
        status,
        learner:learner_id(display_name, avatar_url, wallet_address, wallet_opted_out)
      )
    `,
    )
    .eq("id", params.id)
    .single()

  if (!workshop) {
    redirect("/dashboard/host")
  }

  if (workshop.host_profiles.user_id !== user.id) {
    redirect("/dashboard/host")
  }

  const confirmedBookings = workshop.bookings?.filter((b: any) => b.status === "confirmed") || []

  async function completeWorkshop(formData: FormData, workshopId: string) {
    "use server"
    const supabase = await createClient()

    const bookingIds = formData.getAll("bookingId")
    const participated = formData.getAll("participated")
    const learnerShowedUp = formData.getAll("learnerShowedUp")
    const usedTools = formData.getAll("usedTools")
    const feedback = formData.get("feedback") as string

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Get workshop details and confirmed bookings inside the server action
    const { data: workshopData } = await supabase
      .from("workshops")
      .select(
        `
        *,
        host_profiles!host_id(user_id),
        bookings!workshop_id(
          id,
          status,
          learner:learner_id(display_name, avatar_url, wallet_address, wallet_opted_out)
        )
      `,
      )
      .eq("id", workshopId)
      .single()

    if (!workshopData) {
      throw new Error('Workshop not found')
    }

    if (workshopData.host_profiles.user_id !== user.id) {
      throw new Error('Unauthorized: You are not the host of this workshop')
    }

    const confirmedBookings = workshopData.bookings.filter((b: any) => b.status === "confirmed")

    // Get participated bookings with learner details
    const participatedBookings = confirmedBookings.filter((booking: any) =>
      participated.includes(booking.id.toString())
    )

    // Create separate workshop data for each participated learner
    const workshopDataArray = participatedBookings.map((booking: any) => ({
      learner_id: booking.learner_id,
      learner_name: booking.learner.display_name || "Anonymous",
      host_id: user.id,
      host_name: user.user_metadata?.display_name || user.email || "Anonymous",
      workshop_name: workshopData.title,
      workshop_id: booking.id,
      workshop_description: workshopData.description,
      tools_used: workshopData.tools_provided,
      skills_learned: workshopData.skills,
      session_duration: workshopData.duration_hours,
      session_start_date_time: workshopData.session_date,
      wallet_address: booking.learner.wallet_address
    }))

    // Filter eligible learners for token minting
    const eligibleLearners = workshopDataArray.filter((data: any) => {
      const booking = participatedBookings.find((b: any) => b.id === data.workshop_id)
      return data.wallet_address && !booking?.learner?.wallet_opted_out
    })

    // Call API route to mint tokens for eligible learners
    if (eligibleLearners.length > 0) {
      try {
        const headersList = await headers()
        const host = headersList.get('host') || 'localhost:3000'

        const mintPromises = eligibleLearners.map(async (learnerData: any) => {
          const httpsUrl = `https://${host}/api/proof-of-skill`
          const httpUrl = `http://${host}/api/proof-of-skill`

          let response

          try {
            // Try HTTPS first
            response = await fetch(httpsUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(learnerData),
            })
          } catch (httpsError) {
            // If HTTPS fails, try HTTP
            response = await fetch(httpUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(learnerData),
            })
          }

          if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Token minting failed: ${response.statusText} - ${errorText}`)
          }

          const result = await response.json()

          // Update database with token data from API response
          const supabase = await createClient()
          const { error: dbError } = await supabase
            .from('bookings')
            .update({
              transaction_hash: result.transaction.hash,
              token_metadata_uri: result.ipfs.url
            })
            .eq('id', learnerData.workshop_id)

          if (dbError) {
            throw new Error(`Failed to store token data in database: ${dbError.message}`)
          }
          return result
        })

        await Promise.all(mintPromises)
      } catch (error) {
        throw new Error(`Failed to mint Proof of Skill tokens: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Update booking statuses
    for (let i = 0; i < bookingIds.length; i++) {
      const bookingId = bookingIds[i]
      const showedUp = learnerShowedUp.includes(bookingId.toString())
      const tools = usedTools.includes(bookingId.toString())

      await supabase
        .from("bookings")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          learner_showed_up: showedUp,
          learner_used_tools: tools,
          host_feedback: feedback || null,
        })
        .eq("id", bookingId)
    }

    redirect("/dashboard/host")
  }

  const sessionDate = new Date(workshop.session_date)


  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/host">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">Complete Workshop</CardTitle>
            <p className="text-muted-foreground">Mark this workshop as completed and provide feedback</p>
          </CardHeader>
          <CardContent>
            {/* Workshop Details */}
            <div className="mb-6 p-4 bg-muted/50 rounded-lg space-y-2">
              <h3 className="font-semibold text-lg">{workshop.title}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {sessionDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  {sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} •{" "}
                  {workshop.duration_hours}h
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{workshop.location}</span>
              </div>
            </div>

            <CompleteWorkshopFormClient
              confirmedBookings={confirmedBookings}
              onSubmit={completeWorkshop}
              workshopId={params.id}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
