"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, X, Eye } from "lucide-react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface BookingCardProps {
  booking: any
  isHost: boolean
}

export default function BookingCard({ booking, isHost }: BookingCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showedUp, setShowedUp] = useState(false)
  const [usedTools, setUsedTools] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewLearnerOpen, setIsViewLearnerOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const sessionDate = new Date(booking.session_date)
  const isPast = sessionDate < new Date()
  const learner = Array.isArray(booking.learner) ? booking.learner[0] : booking.learner

  const handleStatusUpdate = async (newStatus: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", booking.id)

      if (error) throw error
      router.refresh()
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleComplete = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          status: "completed",
          learner_showed_up: showedUp,
          learner_used_tools: usedTools,
          host_feedback: feedback,
        })
        .eq("id", booking.id)

      if (error) throw error

      // Update host stats
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        // Check if user is still a host
        const { data: profile } = await supabase.from("profiles").select("is_host").eq("id", user.id).maybeSingle()

        if (profile?.is_host) {
          const { data: hostProfile } = await supabase
            .from("host_profiles")
            .select("total_sessions, hourly_rate")
            .eq("user_id", user.id)
            .single()

          if (hostProfile) {
            await supabase
              .from("host_profiles")
              .update({
                total_sessions: (hostProfile.total_sessions || 0) + 1,
              })
              .eq("user_id", user.id)
          }
        }
      }

      setIsDialogOpen(false)
      router.refresh()
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-2">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{learner?.display_name || "Unknown User"}</p>
                <Badge variant={booking.status === "pending" ? "secondary" : "default"} className="text-xs">
                  {booking.status}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{sessionDate.toLocaleDateString()}</span>
                <Clock className="h-4 w-4 text-muted-foreground ml-2" />
                <span>{sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <p className="text-sm">
                <span className="font-semibold">Skill:</span> {booking.skill}
              </p>
              {booking.notes && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold">Notes:</span> {booking.notes}
                </p>
              )}
            </div>
          </div>

          {isHost && (
            <div className="flex flex-col gap-2">
              {booking.status === "confirmed" && !isPast && (
                <>
                  <Dialog open={isViewLearnerOpen} onOpenChange={setIsViewLearnerOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="mr-2 h-4 w-4" />
                        View Learner
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Learner Details</DialogTitle>
                        <DialogDescription>Information about your upcoming session learner</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-8 w-8 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{learner?.display_name || "Unknown User"}</p>
                            <p className="text-sm text-muted-foreground">Learner</p>
                          </div>
                        </div>
                        <div className="space-y-2 pt-4 border-t">
                          <div>
                            <p className="text-sm font-semibold">Session Date</p>
                            <p className="text-sm text-muted-foreground">
                              {sessionDate.toLocaleDateString()} at{" "}
                              {sessionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold">Skill Interest</p>
                            <p className="text-sm text-muted-foreground">{booking.skill}</p>
                          </div>
                          {booking.notes && (
                            <div>
                              <p className="text-sm font-semibold">Learner Notes</p>
                              <p className="text-sm text-muted-foreground">{booking.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate("cancelled")}
                    disabled={isLoading}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              {booking.status === "confirmed" && isPast && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">Mark Completed</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Complete Session</DialogTitle>
                      <DialogDescription>Please provide feedback about this session</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="showed-up"
                          checked={showedUp}
                          onCheckedChange={(checked) => setShowedUp(!!checked)}
                        />
                        <Label htmlFor="showed-up">Learner showed up</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="used-tools"
                          checked={usedTools}
                          onCheckedChange={(checked) => setUsedTools(!!checked)}
                        />
                        <Label htmlFor="used-tools">Learner used the tools</Label>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="feedback">Feedback (Optional)</Label>
                        <Textarea
                          id="feedback"
                          placeholder="How did the session go?"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button onClick={handleComplete} disabled={isLoading} className="w-full">
                      {isLoading ? "Completing..." : "Complete Session"}
                    </Button>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
