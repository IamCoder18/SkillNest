import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { ConfettiOnLoad } from "@/components/ui/confetti"
import { NFTCard } from "@/components/nft-card"
import { getNFTCategoryForWorkshop, getNFTImageForWorkshop } from "@/lib/utils"

// TypeScript interfaces for better type safety
interface Workshop {
  title: string;
  description: string | null;
  session_date: string | null;
  location: string | null;
  skills: string[] | null;
  price: number | null;
}

interface Booking {
  id: string;
  created_at: string;
  workshops: Workshop | null;
  transaction_hash?: string;
  token_metadata_uri?: string;
  host?: {
    display_name: string | null;
    avatar_url: string | null;
    location: string | null;
  } | null;
  // Add other booking properties as needed
}

// Configuration constants
const WORKSHOPS_PER_PAGE = 20

export default async function NFTsPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const searchParamsResolved = await searchParams
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
          skills,
          price
        ),
        host:profiles!host_id(
          display_name,
          avatar_url,
          location
        )
      `)
      .eq("learner_id", user.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })

    learnerBookings = (learnerResult || []).filter((booking: Booking): booking is Booking & { workshops: Workshop } => !!booking.workshops)
  } catch (error) {
    learnerBookings = []
  }

  // Calculate unique categories explored (optimized)
  const exploredCategories = new Set<string>(
    learnerBookings.map((booking: Booking) => getNFTCategoryForWorkshop(booking.workshops))
  )

  // Pagination logic with URL params support
  const totalWorkshops = learnerBookings.length
  const totalPages = Math.ceil(totalWorkshops / WORKSHOPS_PER_PAGE)
  const currentPage = Number(searchParamsResolved?.page) || 1
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
        <h2 className="text-2xl font-bold mb-4">Your Learning Journey Summary</h2>
        <Card className="border-2 mb-8">
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{totalWorkshops}</div>
                <p className="text-lg text-muted-foreground">Total Coins Earned</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">{exploredCategories.size}</div>
                <p className="text-lg text-muted-foreground">Categories Explored</p>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentWorkshops.map((booking) => {
                  const workshop = booking.workshops
                  if (!workshop) return null

                  const nftImage = getNFTImageForWorkshop(workshop)

                  return (
                    <NFTCard
                      key={booking.id}
                      booking={booking}
                      nftImage={nftImage}
                    />
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