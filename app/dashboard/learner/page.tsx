import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, CheckCircle } from "lucide-react"

export default async function LearnerDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

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
        price,
        skills
      ),
      host:profiles!host_id(
        display_name,
        avatar_url,
        location
      )
    `,
    )
    .eq("learner_id", user.id)
    .order("created_at", { ascending: false })

  const upcomingBookings =
    bookings?.filter((b) => b.status === "confirmed" && new Date((b.workshops as any).session_date) > new Date()) || []
  const inProgressBookings =
    bookings?.filter((b) => b.status === "confirmed" && new Date((b.workshops as any).session_date) <= new Date()) || []
  const completedBookings = bookings?.filter((b) => b.status === "completed") || []

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Learning Journey</h1>
            <p className="text-muted-foreground">Track your bookings and sessions</p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/browse">Find More Workshops</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/host/setup">Become a Host</Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          <Card className="border-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Upcoming</p>
                  <p className="text-3xl font-bold">{upcomingBookings.length}</p>
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
                  <p className="text-sm text-muted-foreground mb-1">Completed</p>
                  <p className="text-3xl font-bold">{completedBookings.length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* No Bookings State */}
        {bookings?.length === 0 && (
          <Card className="border-2">
            <CardContent className="py-16 text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">Start your learning journey by booking your first workshop</p>
                <Button asChild size="lg">
                  <Link href="/browse">Browse Workshops</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sessions In Progress */}
        {inProgressBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Sessions In Progress</h2>
            <div className="grid gap-4">
              {inProgressBookings.map((booking) => (
                <LearnerBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Upcoming Sessions</h2>
            <div className="grid gap-4">
              {upcomingBookings.map((booking) => (
                <LearnerBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Sessions */}
        {completedBookings.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Completed Sessions</h2>
            <div className="grid gap-4">
              {completedBookings.slice(0, 5).map((booking) => (
                <LearnerBookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LearnerBookingCard({ booking }: { booking: any }) {
  const workshop = booking.workshops
  const sessionDate = new Date(workshop.session_date)
  const host = booking.host

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            {/* Workshop Title */}
            <h3 className="font-semibold text-lg">{workshop.title}</h3>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">{host?.display_name?.charAt(0).toUpperCase() || "?"}</span>
              </div>
              <div>
                <p className="font-semibold">{host?.display_name || "Unknown Host"}</p>
                {host?.location && <p className="text-sm text-muted-foreground">{host.location}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDate.toLocaleDateString()}</span>
                <span className="text-muted-foreground">at</span>
                <span>{sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">Skills:</span> {workshop.skills?.join(", ") || "N/A"}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Location:</span> {workshop.location}
              </p>
              {booking.notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Your notes:</span> {booking.notes}
                </p>
              )}
            </div>

            <div>
              {booking.status !== "confirmed" && (
                <Badge
                  variant={
                    booking.status === "completed"
                      ? "outline"
                      : "destructive"
                  }
                >
                  {booking.status.toLowerCase().replace(/\b\w+/g, (w: string, i: number) => /^(a|an|and|as|at|but|by|for|from|in|nor|of|on|or|so|the|to|up|yet)$/.test(w) && i ? w : w[0].toUpperCase() + w.slice(1))}
                </Badge>
              )}
            </div>
          </div>

          <div className="text-right space-y-2">
            <div className="text-lg font-bold text-primary">${workshop.price}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
