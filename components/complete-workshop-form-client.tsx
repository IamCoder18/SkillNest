'use client'

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"

interface Booking {
  id: number
  status: string
  learner: {
    display_name?: string
    email?: string
    avatar_url?: string
  }
}

interface CompleteWorkshopFormClientProps {
  confirmedBookings: Booking[]
  onSubmit: (formData: FormData, workshopId: string) => Promise<void>
  workshopId: string
}

export function CompleteWorkshopFormClient({ confirmedBookings, onSubmit, workshopId }: CompleteWorkshopFormClientProps) {
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [uncheckedParticipants, setUncheckedParticipants] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentStatus, setCurrentStatus] = useState<string>("")

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const participated = formData.getAll("participated") as string[]

    // Find unchecked participants
    const unchecked = confirmedBookings
      .filter((booking: any) => !participated.includes(booking.id.toString()))
      .map((booking: any) => booking.learner.display_name || "Anonymous")

    if (unchecked.length > 0) {
      setUncheckedParticipants(unchecked)
      setShowConfirmation(true)
      return
    }

    // If all participants are checked, proceed with submission
    handleConfirmedSubmit(formData)
  }

  const handleConfirmedSubmit = async (formData?: FormData) => {
    setIsSubmitting(true)
    setShowConfirmation(false)
    setCurrentStatus("")

    try {
      if (formData) {
        await onSubmit(formData, workshopId)
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      // Don't show error to user if it's a redirect error
      if (!(error instanceof Error) || !error.message?.includes('NEXT_REDIRECT')) {
        // Handle other errors here if needed
      }
    } finally {
      setIsSubmitting(false)
      setCurrentStatus("")
    }
  }

  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setUncheckedParticipants([])
  }

  return (
    <>
      <form onSubmit={handleFormSubmit} className="space-y-6">
        {/* Participants */}
        <div>
          <h4 className="font-semibold mb-3">Participants ({confirmedBookings.length})</h4>
          <div className="space-y-4">
            {confirmedBookings.map((booking: any) => (
              <Card key={booking.id} className="border">
                <CardContent className="p-4">
                  <input type="hidden" name="bookingId" value={booking.id} />
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">
                        {booking.learner.display_name?.charAt(0) || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">{booking.learner.display_name || "Anonymous"}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id={`participated-${booking.id}`} name="participated" value={booking.id} />
                      <Label htmlFor={`participated-${booking.id}`} className="text-sm cursor-pointer">
                        Learner showed up and used the tools/equipment or learned the concepts being taught
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Feedback */}
        <div>
          <Label htmlFor="feedback">Workshop Feedback (Optional)</Label>
          <Textarea
            id="feedback"
            name="feedback"
            placeholder="How did the workshop go? Any notes for future reference..."
            className="mt-2"
            rows={4}
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                {currentStatus || "Completing Workshop..."}
              </div>
            ) : (
              "Complete Workshop"
            )}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/dashboard/host">Cancel</Link>
          </Button>
        </div>
      </form>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unmarked Participants</DialogTitle>
            <DialogDescription>
              The following participants are not marked as having participated:
              <ul className="mt-2 list-disc list-inside">
                {uncheckedParticipants.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
              <br />
              Are you sure you want to complete the workshop? These participants will not receive workshop certificates or completion records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelConfirmation}>
              Go Back
            </Button>
            <Button
              onClick={() => {
                // Get the form data and submit
                const form = document.querySelector('form') as HTMLFormElement
                if (form) {
                  const formData = new FormData(form)
                  handleConfirmedSubmit(formData)
                }
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  {currentStatus || "Completing..."}
                </div>
              ) : (
                "Complete Anyway"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}