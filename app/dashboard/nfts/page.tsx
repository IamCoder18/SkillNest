import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Wrench,
  Car,
  Hammer,
  Palette,
  Cpu,
  Home,
  ArrowLeft
} from "lucide-react"

const NFT_CATEGORIES = [
  {
    name: "Woodworking",
    icon: Wrench,
    color: "bg-amber-100 text-amber-800",
    iconColor: "text-amber-600"
  },
  {
    name: "Auto Skills",
    icon: Car,
    color: "bg-blue-100 text-blue-800",
    iconColor: "text-blue-600"
  },
  {
    name: "Metalwork",
    icon: Hammer,
    color: "bg-gray-100 text-gray-800",
    iconColor: "text-gray-600"
  },
  {
    name: "Crafts & Textiles",
    icon: Palette,
    color: "bg-pink-100 text-pink-800",
    iconColor: "text-pink-600"
  },
  {
    name: "Digital Fabrication",
    icon: Cpu,
    color: "bg-purple-100 text-purple-800",
    iconColor: "text-purple-600"
  },
  {
    name: "Home Repairs",
    icon: Home,
    color: "bg-green-100 text-green-800",
    iconColor: "text-green-600"
  }
]

export default async function NFTsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get completed bookings with workshop data for the current user (both as learner and host)
  const { data: learnerBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      workshops!inner(
        title,
        skills
      )
    `)
    .eq("learner_id", user.id)
    .eq("status", "completed")

  const { data: hostBookings } = await supabase
    .from("bookings")
    .select(`
      *,
      workshops!inner(
        title,
        skills
      )
    `)
    .eq("host_id", user.id)
    .eq("status", "completed")

  // Combine all completed bookings
  const allBookings = [...(learnerBookings || []), ...(hostBookings || [])]

  // Count sessions per category
  const categoryCounts = NFT_CATEGORIES.map(category => {
    const count = allBookings.filter(booking => {
      const workshop = booking.workshops as any
      return workshop?.skills?.includes(category.name)
    }).length

    return {
      ...category,
      count
    }
  })

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/learner">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </div>
            <h1 className="text-4xl font-bold mb-2">Your NFTs</h1>
            <p className="text-muted-foreground">Your skill achievements and completed sessions</p>
          </div>
        </div>

        {/* NFT Categories Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryCounts.map((category) => {
            const IconComponent = category.icon
            return (
              <Card key={category.name} className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <IconComponent className={`h-6 w-6 ${category.iconColor}`} />
                      </div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {category.count}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        sessions
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.count > 0
                      ? `You've completed ${category.count} session${category.count > 1 ? 's' : ''} in ${category.name}`
                      : `No sessions completed in ${category.name} yet`
                    }
                  </p>
                  {category.count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        NFT Achievement Unlocked
                      </span>
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">★</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Your Learning Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {allBookings.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">
                    {categoryCounts.filter(c => c.count > 0).length}
                  </div>
                  <div className="text-sm text-muted-foreground">Categories Explored</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {categoryCounts.reduce((acc, c) => acc + c.count, 0)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Category Sessions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}