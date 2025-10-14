import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import Link from "next/link"
import { ArrowLeft, Wrench, Car, Hammer, Palette, Cpu, Home, MoreHorizontal, ChevronDown, Calendar, MapPin, Clock } from "lucide-react"

// NFT Categories Configuration
const NFT_CATEGORIES = [
  {
    id: "woodworking",
    name: "Woodworking",
    icon: Wrench,
    color: "bg-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    textColor: "text-amber-700"
  },
  {
    id: "auto-skills",
    name: "Auto Skills",
    icon: Car,
    color: "bg-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    textColor: "text-blue-700"
  },
  {
    id: "metalwork",
    name: "Metalwork",
    icon: Hammer,
    color: "bg-gray-500",
    bgColor: "bg-gray-50",
    borderColor: "border-gray-200",
    textColor: "text-gray-700"
  },
  {
    id: "crafts-textiles",
    name: "Crafts & Textiles",
    icon: Palette,
    color: "bg-pink-500",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-200",
    textColor: "text-pink-700"
  },
  {
    id: "digital-fabrication",
    name: "Digital Fabrication",
    icon: Cpu,
    color: "bg-purple-500",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    textColor: "text-purple-700"
  },
  {
    id: "home-repairs",
    name: "Home Repairs",
    icon: Home,
    color: "bg-green-500",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    textColor: "text-green-700"
  },
  {
    id: "other",
    name: "Other",
    icon: MoreHorizontal,
    color: "bg-orange-500",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
    textColor: "text-orange-700"
  }
] as const

export default async function NFTsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch completed bookings as learner only (workshops user has taken)
  let learnerBookings = []

  try {
    const { data: learnerResult } = await supabase
      .from("bookings")
      .select(`
        *,
        workshops(
          title,
          session_date,
          location,
          skills
        )
      `)
      .eq("learner_id", user.id)
      .eq("status", "completed")

    learnerBookings = (learnerResult || []).filter(booking => booking.workshops)
  } catch (error) {
    console.error("Error fetching NFT data:", error)
    // Continue with empty arrays - the UI will show zeros
  }

  // Use only learner sessions (workshops user has completed as a learner)
  const allSessions = learnerBookings

  // Helper function to categorize a single workshop
  const categorizeWorkshop = (workshop: any): string => {
    const skills = workshop?.skills || []

    if (!skills || skills.length === 0) {
      return 'other'
    }

    // Check each skill against categories in order of specificity
    for (const skill of skills) {
      const skillLower = skill?.toLowerCase() || ''

      // Digital Fabrication (most specific for 3D printing)
      if (skillLower.includes('3d printing') || skillLower.includes('3d print') ||
          skillLower.includes('cnc') || skillLower.includes('laser') ||
          skillLower.includes('cad') || skillLower.includes('digital fabrication')) {
        return 'digital-fabrication'
      }

      // Crafts & Textiles
      if (skillLower.includes('craft') || skillLower.includes('textile') ||
          skillLower.includes('sewing') || skillLower.includes('knitting') ||
          skillLower.includes('fabric')) {
        return 'crafts-textiles'
      }

      // Woodworking
      if (skillLower.includes('wood') || skillLower.includes('carpentry') ||
          skillLower.includes('cabinet')) {
        return 'woodworking'
      }

      // Auto Skills
      if (skillLower.includes('auto') || skillLower.includes('car') ||
          skillLower.includes('vehicle') || skillLower.includes('mechanic')) {
        return 'auto-skills'
      }

      // Metalwork
      if (skillLower.includes('metal') || skillLower.includes('welding') ||
          skillLower.includes('steel') || skillLower.includes('aluminum')) {
        return 'metalwork'
      }

      // Home Repairs
      if (skillLower.includes('home') || skillLower.includes('repair') ||
          skillLower.includes('plumbing') || skillLower.includes('electrical') ||
          skillLower.includes('maintenance')) {
        return 'home-repairs'
      }
    }

    // If no specific category matches, put in "other"
    return 'other'
  }

  // Group sessions by category (mutually exclusive)
  const categoryMap = new Map()

  // Initialize all categories
  NFT_CATEGORIES.forEach(category => {
    categoryMap.set(category.id, {
      ...category,
      sessions: [],
      count: 0
    })
  })

  // Assign each session to exactly one category
  allSessions.forEach(session => {
    const workshop = session.workshops as any
    const categoryId = categorizeWorkshop(workshop)

    const categoryData = categoryMap.get(categoryId)
    if (categoryData) {
      categoryData.sessions.push(session)
      categoryData.count++
    }
  })

  // Convert map to array
  const categoryData = Array.from(categoryMap.values())

  // Calculate summary statistics
  const totalSessions = allSessions.length
  const categoriesExplored = categoryData.filter(cat => cat.count > 0).length

  // Show all categories (with different treatment for those with/without sessions)
  const categoriesWithSessions = categoryData.filter(cat => cat.count > 0)
  const categoriesWithoutSessions = categoryData.filter(cat => cat.count === 0)


  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My NFT Collection</h1>
            <p className="text-muted-foreground">Your skill-based achievements and milestones</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/learner">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Summary Section - Moved above categories */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle>Your Learning Journey Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalSessions}</div>
                <p className="text-muted-foreground">Total Sessions Completed</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{categoriesExplored}</div>
                <p className="text-muted-foreground">Categories Explored</p>
              </div>
            </div>
            {totalSessions === 0 && (
              <div className="mt-6 text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Complete your first workshop session to start earning NFTs!
                </p>
                <Button asChild>
                  <Link href="/browse">Browse Workshops</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* NFT Categories List */}
        <div className="space-y-4">
          {/* Categories with sessions - collapsible */}
          {categoriesWithSessions.map((category) => {
            const IconComponent = category.icon
            return (
              <Collapsible key={category.id}>
                <Card className={`border-2 ${category.borderColor} hover:shadow-lg transition-shadow`}>
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-6 cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-16 h-16 ${category.bgColor} rounded-full flex items-center justify-center`}>
                            <IconComponent className={`h-8 w-8 ${category.textColor}`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-xl">{category.name}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className={`text-3xl font-bold ${category.textColor}`}>
                              {category.count}
                            </div>
                            <p className="text-sm text-muted-foreground">sessions</p>
                          </div>
                          <ChevronDown className={`h-5 w-5 ${category.textColor}`} />
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 border-t">
                      <div className="space-y-4 mt-4">
                        {category.sessions.map((session: any) => {
                          const workshop = session.workshops as any
                          const sessionDate = workshop.session_date ? new Date(workshop.session_date) : null
                          const isValidDate = sessionDate && !isNaN(sessionDate.getTime())

                          return (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-semibold">{workshop.title}</h4>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{isValidDate ? sessionDate.toLocaleDateString() : "Date TBD"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{isValidDate ? sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time TBD"}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    <span>{workshop.location || "Location TBD"}</span>
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                  Skills: {workshop.skills?.join(", ") || "N/A"}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            )
          })}

          {/* Categories without sessions - thinner, non-collapsible */}
          {categoriesWithoutSessions.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.id} className={`border-2 ${category.borderColor} opacity-75`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 ${category.bgColor} rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-6 w-6 ${category.textColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${category.textColor}`}>
                        {category.count}
                      </div>
                      <p className="text-sm text-muted-foreground">sessions</p>
                    </div>
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