import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Calendar, Clock, DollarSign, Wrench, Users } from "lucide-react"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"

export default async function WorkshopDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch workshop with host details
  const { data: workshop } = await supabase
    .from("workshops")
    .select(
      `
      *,
      host_profiles!inner (
        id,
        user_id,
        skills,
        tools,
        total_sessions,
        profiles:user_id (
          display_name,
          location,
          avatar_url,
          bio,
          is_host
        )
      )
    `,
    )
    .eq("id", id)
    .maybeSingle()

  if (!workshop || workshop.status !== "active") {
    notFound()
  }

  // Check if host is still active
  const host = workshop.host_profiles
  const profile = Array.isArray(host.profiles) ? host.profiles[0] : host.profiles
  if (!profile?.is_host) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Check if user already has a booking for this workshop
  let existingBooking = null
  if (user) {
    const { data } = await supabase
      .from("bookings")
      .select("*")
      .eq("workshop_id", id)
      .eq("learner_id", user.id)
      .maybeSingle()
    existingBooking = data
  }

  const sessionDate = new Date(workshop.session_date)

  // Handle booking submission
  async function handleBooking(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const notes = formData.get("notes") as string

    const { error } = await supabase.from("bookings").insert({
      workshop_id: id,
      host_id: host.user_id,
      learner_id: user.id,
      notes: notes || null,
      status: "confirmed",
    })

    if (error) {
      return
    }

    redirect("/dashboard/learner")
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Workshop Header */}
            <Card className="border-2">
              <CardContent className="p-8">
                <h1 className="text-3xl font-bold mb-4">{workshop.title}</h1>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">{workshop.description}</p>

                {/* Skills */}
                <div className="mb-6">
                  <p className="text-sm font-semibold mb-2">Skills You'll Learn</p>
                  <div className="flex flex-wrap gap-2">
                    {workshop.skills?.map((skill: string, idx: number) => (
                      <Badge key={idx} variant="default" className="px-3 py-1">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Tools Provided */}
                {workshop.tools_provided && workshop.tools_provided.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Tools & Equipment Provided
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {workshop.tools_provided.map((tool: string, idx: number) => (
                        <li key={idx} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Session Details */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Date</p>
                    <p className="text-muted-foreground">
                      {sessionDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Time & Duration</p>
                    <p className="text-muted-foreground">
                      {sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} •{" "}
                      {workshop.duration_hours} hour{workshop.duration_hours !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-semibold">Location</p>
                    <p className="text-muted-foreground">{workshop.location}</p>
                  </div>
                </div>
                {workshop.max_participants && (
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-semibold">Max Participants</p>
                      <p className="text-muted-foreground">{workshop.max_participants}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Host Info */}
            <Card className="border-2">
              <CardHeader>
                <CardTitle>Your Host</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">
                      {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">{profile?.display_name || "Unknown Host"}</h3>
                    {profile?.location && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile?.bio && <p className="text-sm text-muted-foreground mb-3">{profile.bio}</p>}
                    <p className="text-sm">
                      <span className="font-semibold">{host.total_sessions || 0}</span> sessions completed
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-6 w-6 text-primary" />
                      <span className="text-3xl font-bold text-primary">${workshop.price}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">Total workshop price</p>
                </CardHeader>
                <CardContent>
                  {!user ? (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground text-center">Please log in to book this workshop</p>
                      <Button asChild className="w-full">
                        <Link href="/auth/login">Log In</Link>
                      </Button>
                    </div>
                  ) : user.id === host.user_id ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      This is your workshop. You cannot book your own workshop.
                    </p>
                  ) : existingBooking ? (
                    <div className="space-y-3">
                      <p className="text-sm text-center font-semibold">You've already booked this workshop!</p>
                      <Button asChild variant="outline" className="w-full bg-transparent">
                        <Link href="/dashboard/learner">View My Bookings</Link>
                      </Button>
                    </div>
                  ) : (
                    <form action={handleBooking} className="space-y-4">
                      <div>
                        <label htmlFor="notes" className="text-sm font-semibold mb-2 block">
                          Notes for Host (Optional)
                        </label>
                        <textarea
                          id="notes"
                          name="notes"
                          rows={4}
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Any questions or special requirements?"
                        />
                      </div>
                      <Button type="submit" className="w-full" size="lg">
                        Book Workshop
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
