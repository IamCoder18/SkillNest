"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface BookingFormProps {
  hostId: string
  hostSkills: string[]
}

export default function BookingForm({ hostId, hostSkills }: BookingFormProps) {
  const [sessionDate, setSessionDate] = useState("")
  const [sessionTime, setSessionTime] = useState("")
  const [skill, setSkill] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setShowConfirmation(true)
  }

  const handleConfirmedSubmit = async () => {
    setShowConfirmation(false)
    setIsLoading(true)
    setError(null)

    // Convert to UTC on the client side (browser's timezone context)
    const [year, month, day] = sessionDate.split('-').map(Number)
    const [hours, minutes] = sessionTime.split(':').map(Number)

    // Create date in user's local timezone context (browser)
    const userLocalDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // Convert to UTC timestamp for server
    const utcTimestamp = userLocalDateTime.toISOString()


    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to book a session")

      // Note: Allowing past dates as requested

      // Create booking via API route
      const formDataToSend = new FormData()
      formDataToSend.set("host_id", hostId)
      formDataToSend.set("session_date", utcTimestamp)
      formDataToSend.set("skill", skill)
      formDataToSend.set("notes", notes)

      const response = await fetch('/api/create-booking', {
        method: 'POST',
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }


      setShowSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/learner")
      }, 2000)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Hidden timezone input - populated by JavaScript */}
        <input type="hidden" id="user_timezone" name="user_timezone" />
        <div className="space-y-2">
          <Label htmlFor="skill">Skill to Learn</Label>
          <Select value={skill} onValueChange={setSkill} required>
            <SelectTrigger>
              <SelectValue placeholder="Select a skill" />
            </SelectTrigger>
            <SelectContent>
              {hostSkills.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Preferred Date</Label>
          <Input
            id="date"
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Preferred Time</Label>
          <Input id="time" type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Tell the host about your experience level and what you'd like to learn..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Requesting..." : "Request Booking"}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          The host will review your request and confirm availability
        </p>

        {/* JavaScript to populate timezone */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', function() {
              const timezoneInput = document.getElementById('user_timezone');
              if (timezoneInput) {
                timezoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
              }
            });
          `
        }} />
      </form>

      {/* Confirmation Modal */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Request Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to request this booking? The host will review your request and confirm availability.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmedSubmit} disabled={isLoading}>
              {isLoading ? "Requesting..." : "Request Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Requested!</DialogTitle>
            <DialogDescription>
              Your booking request has been submitted successfully. The host will review your request and get back to you soon.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push("/dashboard/learner")}>Go to Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Hidden timezone input - populated by JavaScript */}
      <input type="hidden" id="user_timezone" name="user_timezone" />
      <div className="space-y-2">
        <Label htmlFor="skill">Skill to Learn</Label>
        <Select value={skill} onValueChange={setSkill} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a skill" />
          </SelectTrigger>
          <SelectContent>
            {hostSkills.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Preferred Date</Label>
        <Input
          id="date"
          type="date"
          value={sessionDate}
          onChange={(e) => setSessionDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="time">Preferred Time</Label>
        <Input id="time" type="time" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Tell the host about your experience level and what you'd like to learn..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Requesting..." : "Request Booking"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        The host will review your request and confirm availability
      </p>

      {/* JavaScript to populate timezone */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const timezoneInput = document.getElementById('user_timezone');
            if (timezoneInput) {
              timezoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
          });
        `
      }} />
    </form>
  )
}
