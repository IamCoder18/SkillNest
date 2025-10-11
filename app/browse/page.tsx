import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Search, MapPin, Calendar, Clock } from "lucide-react"

const skillCategories = [
  "All",
  "Woodworking",
  "Auto Skills",
  "Metalwork",
  "Crafts",
  "Digital Fabrication",
  "Home Repairs",
  "Other",
]

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ skill?: string; search?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("workshops")
    .select(
      `
      *,
      host_profiles!inner (
        id,
        user_id,
        skills,
        tools,
        profiles:user_id (
          display_name,
          location,
          avatar_url
        )
      )
    `,
    )
    .eq("status", "active")
    .gte("session_date", new Date().toISOString())
    .order("session_date", { ascending: true })

  if (params.skill && params.skill !== "All") {
    if (params.skill === "Other") {
      // Show workshops with custom skills (not in predefined list)
      const predefinedSkills = [
        "Woodworking",
        "Auto Skills",
        "Metalwork",
        "Crafts",
        "Digital Fabrication",
        "Home Repairs",
      ]
      // This is a bit tricky - we'll need to filter client-side or use a more complex query
      // For now, we'll just show all workshops and filter in the display
    } else {
      query = query.contains("skills", [params.skill])
    }
  }

  if (params.search) {
    // Search in title, description, and skills array
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%,skills.cs.{${params.search}}`)
  }

  const { data: workshops, error } = await query

  let filteredWorkshops = workshops
  if (params.skill === "Other" && workshops) {
    const predefinedSkills = [
      "Woodworking",
      "Auto Skills",
      "Metalwork",
      "Crafts",
      "Digital Fabrication",
      "Home Repairs",
    ]
    filteredWorkshops = workshops.filter((w) => w.skills?.some((skill: string) => !predefinedSkills.includes(skill)))
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a Workshop</h1>
          <p className="text-muted-foreground">Browse upcoming workshops and learn new skills</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <form action="/browse" method="get" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                name="search"
                placeholder="Search by title, description, or skills..."
                className="pl-10"
                defaultValue={params.search}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {skillCategories.map((category) => (
            <Link key={category} href={`/browse?skill=${category}`}>
              <Badge
                variant={params.skill === category || (!params.skill && category === "All") ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/90 px-4 py-2"
              >
                {category}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Workshop List */}
        {error && <p className="text-red-500">Error loading workshops: {error.message}</p>}

        {filteredWorkshops && filteredWorkshops.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No workshops found. Check back soon or become a host!</p>
              <Button asChild className="mt-4">
                <Link href="/dashboard/host/setup">Become a Host</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredWorkshops?.map((workshop) => {
            const host = workshop.host_profiles
            const profile = Array.isArray(host.profiles) ? host.profiles[0] : host.profiles
            const sessionDate = new Date(workshop.session_date)

            return (
              <Card key={workshop.id} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl mb-2 line-clamp-2">{workshop.title}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {profile?.display_name?.charAt(0).toUpperCase() || "?"}
                      </span>
                    </div>
                    <span>{profile?.display_name || "Unknown Host"}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3">{workshop.description}</p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1">
                    {workshop.skills?.slice(0, 3).map((skill: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {workshop.skills && workshop.skills.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{workshop.skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Session Details */}
                  <div className="space-y-2 pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {sessionDate.toLocaleDateString("en-US", {
                          weekday: "short",
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
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <span className="text-xl font-bold text-primary">${workshop.price}</span>
                    </div>
                    <Button asChild>
                      <Link href={`/workshop/${workshop.id}`}>Book Now</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
