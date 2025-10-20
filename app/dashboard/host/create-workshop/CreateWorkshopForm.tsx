"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

interface HostProfile {
  skills: string[]
}

interface CreateWorkshopFormProps {
  hostProfile: HostProfile
}

export function CreateWorkshopForm({ hostProfile }: CreateWorkshopFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)

    // Get the raw date/time inputs
    const sessionDate = formData.get("session_date") as string
    const sessionTime = formData.get("session_time") as string

    // Convert to UTC on the client side (browser's timezone context)
    const [year, month, day] = sessionDate.split('-').map(Number)
    const [hours, minutes] = sessionTime.split(':').map(Number)

    // Create date in user's local timezone context (browser)
    const userLocalDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)

    // Convert to UTC timestamp for server
    const utcTimestamp = userLocalDateTime.toISOString()


    // Replace the session_date in formData with UTC timestamp
    formData.set("session_date", utcTimestamp)

    try {
      const response = await fetch('/api/create-workshop', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      router.push("/dashboard/host")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div>
        <Label htmlFor="title">Workshop Title *</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g., Beginner Woodworking: Build a Cutting Board"
          required
        />
      </div>

      {/* Description */}
      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Describe what learners will do and learn in this workshop..."
          required
        />
      </div>

      <div>
        <Label>Skills Covered *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Select from the skills you've configured in your profile
        </p>
        {hostProfile.skills && hostProfile.skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {hostProfile.skills.map((skill: string) => (
              <label key={skill} className="cursor-pointer">
                <input type="checkbox" name="skills" value={skill} className="peer sr-only" />
                <Badge
                  variant="outline"
                  className="cursor-pointer px-4 py-2 peer-checked:bg-primary peer-checked:text-primary-foreground peer-checked:border-primary"
                >
                  {skill}
                </Badge>
              </label>
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground p-4 border-2 border-dashed rounded-lg">
            No skills configured yet.{" "}
            <a href="/dashboard/host/settings" className="text-primary hover:underline">
              Add skills in your settings
            </a>{" "}
            before creating a workshop.
          </div>
        )}
      </div>

      {/* Tools Provided */}
      <div>
        <Label htmlFor="tools_provided">Tools & Equipment Provided *</Label>
        <Input
          id="tools_provided"
          name="tools_provided"
          placeholder="Table saw, drill, safety glasses (comma separated)"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">Separate multiple tools with commas</p>
      </div>

      {/* Date and Time */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="session_date">Date *</Label>
          <Input id="session_date" name="session_date" type="date" required />
        </div>
        <div>
          <Label htmlFor="session_time">Start Time *</Label>
          <Input id="session_time" name="session_time" type="time" required />
        </div>
      </div>

      {/* Duration and Price */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration_hours">Duration (hours) *</Label>
          <Input
            id="duration_hours"
            name="duration_hours"
            type="number"
            step="0.5"
            min="0.5"
            placeholder="2"
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            placeholder="0"
            defaultValue="0"
            required
          />
        </div>
      </div>

      {/* Max Participants */}
      <div>
        <Label htmlFor="max_participants">Max Participants *</Label>
        <Input
          id="max_participants"
          name="max_participants"
          type="number"
          min="1"
          placeholder="4"
          defaultValue="1"
          required
        />
      </div>

      {/* Location */}
      <div>
        <Label htmlFor="location">Location *</Label>
        <Input id="location" name="location" placeholder="123 Main St, Calgary, AB" required />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Submit */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          className="flex-1"
          disabled={isLoading || !hostProfile.skills || hostProfile.skills.length === 0}
        >
          {isLoading ? "Creating Workshop..." : "Create Workshop"}
        </Button>
        <Button type="button" variant="outline" asChild className="bg-transparent">
          <a href="/dashboard/host">Cancel</a>
        </Button>
      </div>
    </form>
  )
}