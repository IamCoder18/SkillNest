import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Calendar, Clock, MapPin, Plus, Users, DollarSign } from "lucide-react"

export default async function WorkshopsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is a host
  const { data: profile } = await supabase.from("profiles").select("is_host").eq("id", user.id).maybeSingle()

  if (!profile?.is_host) {
    redirect("/dashboard/host/setup")
  }

  // Get host profile
  const { data: hostProfile } = await supabase.from("host_profiles").select("*").eq("user_id", user.id).maybeSingle()

  if (!hostProfile) {
    redirect("/dashboard/host/setup")
  }

  const now = new Date()

  // Get all workshop IDs that have bookings
  const { data: bookedWorkshops } = await supabase.from("bookings").select("workshop_id").not("workshop_id", "is", null)

  const bookedWorkshopIds = bookedWorkshops?.map((b) => b.workshop_id).filter(Boolean) || []

  // Delete past workshops that have no bookings
  if (bookedWorkshopIds.length > 0) {
    await supabase
      .from("workshops")
      .delete()
      .eq("host_id", hostProfile.id)
      .lt("session_date", now.toISOString())
      .not("id", "in", `(${bookedWorkshopIds.join(",")})`)
  } else {
    // If no workshops have bookings, delete all past workshops
    await supabase.from("workshops").delete().eq("host_id", hostProfile.id).lt("session_date", now.toISOString())
  }

  // Get all workshops with booking counts
  const { data: workshops } = await supabase
    .from("workshops")
    .select("*, bookings(id, status, completed_at)")
    .eq("host_id", hostProfile.id)
    .order("session_date", { ascending: true })

  const upcomingWorkshops =
    workshops?.filter((workshop) => {
      const sessionDate = new Date(workshop.session_date)
      return workshop.status === "active" && sessionDate > now
    }) || []

  const inProgressWorkshops =
    workshops?.filter((workshop) => {
      const sessionDate = new Date(workshop.session_date)
      const hasBookings = Array.isArray(workshop.bookings) && workshop.bookings.length > 0
      const hasIncompleteBookings =
        Array.isArray(workshop.bookings) && workshop.bookings.some((b: any) => !b.completed_at)
      return workshop.status === "active" && sessionDate <= now && hasBookings && hasIncompleteBookings
    }) || []

  const cancelledWorkshops = workshops?.filter((w) => w.status === "cancelled") || []

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Workshops</h1>
            <p className="text-muted-foreground">Manage all your workshop sessions</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/host/create-workshop">
              <Plus className="mr-2 h-4 w-4" />
              Create Workshop
            </Link>
          </Button>
        </div>

        {/* Upcoming Workshops */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Upcoming Workshops ({upcomingWorkshops.length})</h2>
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          )}
        </div>

        {inProgressWorkshops.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Workshops In Progress ({inProgressWorkshops.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {inProgressWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} inProgress />
              ))}
            </div>
          </div>
        )}

        {/* Cancelled Workshops */}
        {cancelledWorkshops.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Cancelled Workshops ({cancelledWorkshops.length})</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cancelledWorkshops.map((workshop) => (
                <WorkshopCard key={workshop.id} workshop={workshop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function WorkshopCard({ workshop, inProgress = false }: { workshop: any; inProgress?: boolean }) {
  const sessionDate = new Date(workshop.session_date)
  const bookingCount = Array.isArray(workshop.bookings) ? workshop.bookings.length : 0
  const isPast = sessionDate < new Date()

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg line-clamp-2">{workshop.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{workshop.description}</p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1">
          {workshop.skills?.slice(0, 2).map((skill: string, idx: number) => (
            <Badge key={idx} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
          {workshop.skills && workshop.skills.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{workshop.skills.length - 2}
            </Badge>
          )}
        </div>

        {/* Session Details */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className={isPast ? "text-muted-foreground" : ""}>
              {sessionDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            {inProgress && (
              <Badge variant="default" className="text-xs">
                In Progress
              </Badge>
            )}
            {isPast && !inProgress && (
              <Badge variant="outline" className="text-xs">
                Past
              </Badge>
            )}
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
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>
              <span className="font-semibold">{bookingCount}</span>
              <span className="text-muted-foreground">/{workshop.max_participants}</span>
            </span>
          </div>
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="font-semibold text-primary">{workshop.price}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
