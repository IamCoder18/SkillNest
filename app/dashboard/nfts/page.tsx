import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ConfettiOnLoad } from "@/components/ui/confetti"

// TypeScript interfaces for better type safety
interface Workshop {
  title: string;
  description: string | null;
  session_date: string | null;
  location: string | null;
  skills: string[] | null;
}

interface Booking {
  id: string;
  created_at: string;
  workshops: Workshop | null;
  // Add other booking properties as needed
}

// NFT Images Configuration
const NFT_IMAGES: { [key: string]: string } = {
  "woodworking": "/WoodworkingNFT.avif",
  "auto-skills": "/AutoSkillsNFT.avif",
  "metalwork": "/MetalworkNFT.avif",
  "crafts-textiles": "/CraftsTextilesNFT.avif",
  "digital-fabrication": "/DigitalFabricationNFT.avif",
  "home-repairs": "/HomeRepairsNFT.avif",
  "other": "/OtherNFT.avif"
}

// Configuration constants
const WORKSHOPS_PER_PAGE = 20

export default async function NFTsPage({ searchParams }: { searchParams?: { page?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Fetch completed bookings as learner only (workshops user has taken)
  let learnerBookings: Booking[] = []

  try {
    const { data: learnerResult } = await supabase
      .from("bookings")
      .select(`
        *,
        workshops(
          title,
          description,
          session_date,
          location,
          skills
        )
      `)
      .eq("learner_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    learnerBookings = (learnerResult || []).filter((booking: Booking): booking is Booking & { workshops: Workshop } => !!booking.workshops)
  } catch (error) {
    learnerBookings = []
  }

  // Data-driven skill category mapping for better maintainability
  const SKILL_CATEGORY_MAP: Record<string, string[]> = {
    "digital-fabrication": ["3d printing", "3d print", "cnc", "laser", "cad", "digital fabrication"],
    "crafts-textiles": ["craft", "textile", "sewing", "knitting", "fabric"],
    "woodworking": ["wood", "carpentry", "cabinet"],
    "auto-skills": ["auto", "car", "vehicle", "mechanic"],
    "metalwork": ["metal", "welding", "steel", "aluminum"],
    "home-repairs": ["home", "repair", "plumbing", "electrical", "maintenance"],
  }

  // Helper function to get NFT category for a workshop based on skills
  const getNFTCategoryForWorkshop = (workshop: Workshop | null): string => {
    const skills = workshop?.skills || []

    if (skills.length === 0) {
      return "other"
    }

    for (const skill of skills) {
      const skillLower = skill?.toLowerCase() || ''
      for (const category in SKILL_CATEGORY_MAP) {
        if (SKILL_CATEGORY_MAP[category].some(keyword => skillLower.includes(keyword))) {
          return category
        }
      }
    }

    return "other"
  }

  // Helper function to get NFT image for a workshop based on skills
  const getNFTImageForWorkshop = (workshop: Workshop | null): string => {
    const category = getNFTCategoryForWorkshop(workshop)
    return NFT_IMAGES[category as keyof typeof NFT_IMAGES] || NFT_IMAGES["other"]
  }

  // Calculate unique categories explored (optimized)
  const exploredCategories = new Set<string>(
    learnerBookings.map((booking: Booking) => getNFTCategoryForWorkshop(booking.workshops))
  )

  // Pagination logic with URL params support
  const totalWorkshops = learnerBookings.length
  const totalPages = Math.ceil(totalWorkshops / WORKSHOPS_PER_PAGE)
  const currentPage = Number(searchParams?.page) || 1
  const startIndex = (currentPage - 1) * WORKSHOPS_PER_PAGE
  const endIndex = startIndex + WORKSHOPS_PER_PAGE
  const currentWorkshops = learnerBookings.slice(startIndex, endIndex)

  return (
    <div className="min-h-screen bg-background pt-24">
      <ConfettiOnLoad />
      <div className="container mx-auto px-4 py-4 max-w-7xl">
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

        {/* Summary Section */}
        <Card className="border-2 mb-8">
          <CardHeader>
            <CardTitle>Your Learning Journey Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{totalWorkshops}</div>
                <p className="text-muted-foreground">Total Coins Earned</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary mb-2">{exploredCategories.size}</div>
                <p className="text-muted-foreground">Categories Explored</p>
              </div>
            </div>
            {totalWorkshops === 0 && (
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

        {/* NFT Workshop List */}
        {totalWorkshops > 0 && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Your Completed Workshops</h2>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mb-6">
                  <p className="text-sm text-muted-foreground">
                    Showing {Math.min(WORKSHOPS_PER_PAGE, totalWorkshops)} of {totalWorkshops} workshops
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <span className="text-sm px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {currentWorkshops.map((booking) => {
                  const workshop = booking.workshops
                  if (!workshop) return null

                  const sessionDate = workshop.session_date ? new Date(workshop.session_date) : null
                  const isValidDate = sessionDate && !isNaN(sessionDate.getTime())
                  const nftImage = getNFTImageForWorkshop(workshop)

                  return (
                    <Card key={booking.id} className="border-2 hover:shadow-lg transition-shadow">
                      <CardContent>
                        <div className="flex items-center gap-6">
                          <div className="w-[215px] h-[215px] rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={nftImage}
                              alt="NFT Badge"
                              width={215}
                              height={215}
                              className="w-full h-full object-cover" 
                            />
                          </div>

                          {/* Workshop Details */}
                          <div className="flex-1 min-w-0 ml-4">
                            <h3 className="font-semibold text-lg mb-2 line-clamp-2">{workshop.title}</h3>

                            <div className="space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>{isValidDate ? sessionDate.toLocaleDateString() : "Date TBD"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span>{isValidDate ? sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Time TBD"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span className="truncate">{workshop.location || "Location TBD"}</span>
                              </div>
                            </div>

                            <p className="text-sm text-muted-foreground mt-2">
                              <span className="font-medium">Skills:</span> {workshop.skills?.join(", ") || "N/A"}
                            </p>

                            {workshop.description && (
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                                <span className="font-medium">Description:</span> {workshop.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}