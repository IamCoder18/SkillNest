import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Wrench, Calendar } from "lucide-react"
import { notFound } from "next/navigation"
import BookingForm from "@/components/booking-form"

export default async function HostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch host profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle()

  if (!profile) {
    notFound()
  }

  // Fetch host details
  const { data: hostProfile } = await supabase.from("host_profiles").select("*").eq("user_id", id).maybeSingle()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Host Header */}
            <Card className="border-2">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl font-bold text-primary">
                      {profile.display_name?.charAt(0).toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{profile.display_name}</h1>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-muted-foreground mb-4">
                        <MapPin className="h-4 w-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.bio && <p className="text-muted-foreground">{profile.bio}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Skills & Tools */}
            {hostProfile && (
              <>
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Skills Offered</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {hostProfile.skills?.map((skill, idx) => (
                        <Badge key={idx} variant="default" className="px-3 py-1">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wrench className="h-5 w-5" />
                      Tools & Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid sm:grid-cols-2 gap-2">
                      {hostProfile.tools?.map((tool, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span>{tool}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {hostProfile.description && (
                  <Card className="border-2">
                    <CardHeader>
                      <CardTitle>About This Workshop</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{hostProfile.description}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Stats */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Experience</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-3xl font-bold text-primary">{hostProfile.total_sessions || 0}</p>
                        <p className="text-sm text-muted-foreground">Sessions Completed</p>
                      </div>
                      {hostProfile.hourly_rate && (
                        <div>
                          <p className="text-3xl font-bold text-primary">${hostProfile.hourly_rate}</p>
                          <p className="text-sm text-muted-foreground">Per Hour</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Book a Session
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {user ? (
                    user.id === id ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        This is your profile. You cannot book a session with yourself.
                      </p>
                    ) : (
                      <BookingForm hostId={id} hostSkills={hostProfile?.skills || []} />
                    )
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-4">Please log in to book a session</p>
                      <a
                        href="/auth/login"
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                      >
                        Log In
                      </a>
                    </div>
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
