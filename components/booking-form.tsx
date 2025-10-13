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
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in to book a session")

      // Debug logging for timezone handling
      console.log("=== BOOKING FORM DEBUG ===")
      console.log("Raw sessionDate input:", sessionDate)
      console.log("Raw sessionTime input:", sessionTime)
      console.log("Current client time (UTC):", new Date().toISOString())
      console.log("Client timezone offset (minutes):", new Date().getTimezoneOffset())

      // Combine date and time, treating as UTC to avoid timezone issues
      const dateTimeString = `${sessionDate}T${sessionTime}:00.000Z`
      console.log("Constructed dateTimeString:", dateTimeString)

      const sessionDateTime = new Date(dateTimeString)
      console.log("Parsed Date object:", sessionDateTime)
      console.log("Date object UTC string:", sessionDateTime.toISOString())
      console.log("Date object local string:", sessionDateTime.toString())
      console.log("Date object UTC time:", sessionDateTime.getTime())
      console.log("Date object UTC hours:", sessionDateTime.getUTCHours())
      console.log("Date object local hours:", sessionDateTime.getHours())

      // Validate the date is not in the past
      const now = new Date()
      console.log("Booking time comparison:", {
        sessionTime: sessionDateTime.getTime(),
        currentTime: now.getTime(),
        isInPast: sessionDateTime.getTime() < now.getTime(),
        differenceMinutes: Math.floor((sessionDateTime.getTime() - now.getTime()) / (1000 * 60))
      })

      if (sessionDateTime.getTime() < now.getTime()) {
        throw new Error("Booking date cannot be in the past")
      }

      // Create booking
      const { error: bookingError } = await supabase.from("bookings").insert({
        host_id: hostId,
        learner_id: user.id,
        session_date: sessionDateTime.toISOString(),
        skill,
        notes,
        status: "pending",
      })

      if (bookingError) {
        console.error("Supabase booking error:", bookingError)
        throw bookingError
      }

      console.log("Booking created successfully:", {
        host_id: hostId,
        learner_id: user.id,
        session_date: sessionDateTime.toISOString(),
        skill,
        status: "pending"
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard/learner")
      }, 2000)
    } catch (err: unknown) {
      console.error("Booking form error:", err)
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      console.error("Error message:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold">Booking Requested!</h3>
        <p className="text-sm text-muted-foreground">The host will review your request and get back to you soon.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
    </form>
  )
}
