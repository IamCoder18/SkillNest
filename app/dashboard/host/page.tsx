import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, DollarSign, Settings, Plus, MapPin, Clock } from "lucide-react"
import BookingCard from "@/components/booking-card"

export default async function HostDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get host profile
  const { data: hostProfile } = await supabase.from("host_profiles").select("*").eq("user_id", user.id).maybeSingle()

  if (!hostProfile) {
    redirect("/dashboard/host/setup")
  }

  const now = new Date()

  // Get all workshop IDs that have bookings
  const { data: bookedWorkshopIds } = await supabase
    .from("bookings")
    .select("workshop_id")
    .not("workshop_id", "is", null)

  const bookedIds = bookedWorkshopIds?.map((b) => b.workshop_id).filter(Boolean) || []

  // Delete past workshops that have no bookings
  if (bookedIds.length > 0) {
    await supabase
      .from("workshops")
      .delete()
      .eq("host_id", hostProfile.id)
      .lt("session_date", now.toISOString())
      .not("id", "in", `(${bookedIds.join(",")})`)
  } else {
    // If no workshops have bookings, delete all past workshops
    await supabase.from("workshops").delete().eq("host_id", hostProfile.id).lt("session_date", now.toISOString())
  }

  const { data: workshops } = await supabase
    .from("workshops")
    .select("*, bookings(*)")
    .eq("host_id", hostProfile.id)
    .order("session_date", { ascending: true })

  // Get all bookings for this host
  const { data: bookings } = await supabase
    .from("bookings")
    .select(
      `
      *,
      workshops!inner(
        title,
        session_date,
        duration_hours,
        location,
        price
      ),
      learner:learner_id (
        display_name,
        avatar_url
      )
    `,
    )
    .eq("host_id", hostProfile.id)
    .order("created_at", { ascending: false })

  const upcomingBookings =
    bookings?.filter((b) => b.status === "confirmed" && new Date((b.workshops as any).session_date) > new Date()) || []
  const inProgressBookings =
    bookings?.filter((b) => b.status === "confirmed" && new Date((b.workshops as any).session_date) <= new Date()) || []
  const completedBookings = bookings?.filter((b) => b.status === "completed") || []

  const activeWorkshops =
    workshops?.filter((w) => {
      const sessionDate = new Date(w.session_date)
      const hasBookings = Array.isArray(w.bookings) && w.bookings.length > 0
      return w.status === "active" && (sessionDate > now || hasBookings)
    }) || []
  const upcomingWorkshops = activeWorkshops?.filter((w) => new Date(w.session_date) > new Date()).slice(0, 5) || []

  const inProgressWorkshops =
    workshops?.filter((w) => {
      const sessionDate = new Date(w.session_date)
      const hasBookings = Array.isArray(w.bookings) && w.bookings.length > 0
      const hasIncompleteBookings = Array.isArray(w.bookings) && w.bookings.some((b: any) => !b.completed_at)
      return w.status === "active" && sessionDate <= now && hasBookings && hasIncompleteBookings
    }) || []

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Host Dashboard</h1>
            <p className="text-muted-foreground">Manage your workshops and bookings</p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="bg-transparent">
              <Link href="/dashboard/host/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/nfts">My NFTs</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/host/create-workshop">
                <Plus className="mr-2 h-4 w-4" />
                Create Workshop
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Sessions</p>
                  <p className="text-3xl font-bold">{hostProfile.total_sessions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Workshops</p>
                  <p className="text-3xl font-bold">{activeWorkshops.length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold">${hostProfile.total_earnings?.toFixed(0) || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {inProgressWorkshops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Workshops In Progress</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {inProgressWorkshops.map((workshop) => {
                const sessionDate = new Date(workshop.session_date)
                const bookingCount = Array.isArray(workshop.bookings) ? workshop.bookings.length : 0
                const confirmedBookings = Array.isArray(workshop.bookings)
                  ? workshop.bookings.filter((b: any) => b.status === "confirmed")
                  : []

                return (
                  <Card key={workshop.id} className="border-2 border-primary/20">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {sessionDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} •{" "}
                          {workshop.duration_hours}h
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm font-semibold text-primary">${workshop.price}</div>
                        {confirmedBookings.length > 0 && (
                          <Button asChild size="sm">
                            <Link href={`/dashboard/host/complete-workshop/${workshop.id}`}>Mark Completed</Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Your Upcoming Workshops</h2>
            <Button asChild variant="outline" size="sm" className="bg-transparent">
              <Link href="/dashboard/host/workshops">View All</Link>
            </Button>
          </div>
          {upcomingWorkshops.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">No upcoming workshops</p>
                <Button asChild>
                  <Link href="/dashboard/host/create-workshop">
                    <Plus className="mr-2 h-4 w-4" />
                    Create a Workshop
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {upcomingWorkshops.map((workshop) => {
                const sessionDate = new Date(workshop.session_date)
                const bookingCount = Array.isArray(workshop.bookings) ? workshop.bookings.length : 0
                return (
                  <Card key={workshop.id} className="border-2">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {sessionDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {sessionDate.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })} •{" "}
                          {workshop.duration_hours}h
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{workshop.location}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="text-sm">
                          <span className="font-semibold">{bookingCount}</span>
                          <span className="text-muted-foreground"> booking(s)</span>
                        </div>
                        <div className="text-sm font-semibold text-primary">${workshop.price}</div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>

        {/* Sessions In Progress */}
        {inProgressBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Sessions In Progress</h2>
            <div className="grid gap-4">
              {inProgressBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isHost={true} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Bookings</h2>
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No upcoming bookings</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} isHost={true} />
              ))}
            </div>
          )}
        </div>

        {/* Completed Sessions */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Sessions</h2>
            <div className="grid gap-4">
              {completedBookings.slice(0, 5).map((booking) => (
                <BookingCard key={booking.id} booking={booking} isHost={true} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
