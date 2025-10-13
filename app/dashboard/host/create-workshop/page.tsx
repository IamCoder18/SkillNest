import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default async function CreateWorkshopPage() {
  let user
  let hostProfile

  try {
    const supabase = await createClient()

    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) {
      redirect("/auth/login")
    }

    user = authUser

    if (!user) {
      redirect("/auth/login")
    }

    const { data, error: profileError } = await supabase
      .from("host_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()

    if (profileError) {
    }

    hostProfile = data

    if (!hostProfile) {
      redirect("/dashboard/host/setup")
    }
  } catch (error) {
    redirect("/auth/login")
  }

  async function createWorkshop(formData: FormData) {
    "use server"
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/auth/login")
    }

    const { data: hostProfile } = await supabase.from("host_profiles").select("id").eq("user_id", user.id).maybeSingle()

    if (!hostProfile) {
      redirect("/dashboard/host/setup")
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const skills = formData.getAll("skills") as string[]
    const toolsProvided = (formData.get("tools_provided") as string).split(",").map((t) => t.trim())
    const sessionDate = formData.get("session_date") as string
    const sessionTime = formData.get("session_time") as string
    const userTimezone = formData.get("user_timezone") as string
    const durationHours = Number.parseFloat(formData.get("duration_hours") as string)
    const price = Number.parseFloat(formData.get("price") as string)
    const maxParticipants = Number.parseInt(formData.get("max_participants") as string)
    const location = formData.get("location") as string

    // Debug logging for timezone handling
    console.log("=== CREATE WORKSHOP DEBUG ===")
    console.log("Raw session_date input:", sessionDate)
    console.log("Raw session_time input:", sessionTime)
    console.log("User timezone:", userTimezone)
    console.log("Current server time (UTC):", new Date().toISOString())
    console.log("Server timezone offset (minutes):", new Date().getTimezoneOffset())

    // SOLUTION: Properly interpret user's local time input using their timezone
    // The key insight: JavaScript's Date constructor treats strings without timezone as UTC
    // But we want to interpret the user's input as their local time

    // Parse the date and time components
    const [year, month, day] = sessionDate.split('-').map(Number)
    const [hours, minutes] = sessionTime.split(':').map(Number)

    console.log("Parsed components:", { year, month, day, hours, minutes })

    // Create date object using components - this interprets as local time in the user's timezone
    // Month is 0-indexed in JavaScript Date constructor
    const userLocalDateTime = new Date(year, month - 1, day, hours, minutes, 0, 0)
    console.log("User local dateTime (interpreted as local):", userLocalDateTime)
    console.log("User local time string:", userLocalDateTime.toString())
    console.log("User local timezone offset:", userLocalDateTime.getTimezoneOffset())

    // For UTC storage, we need to convert from user's local time to UTC
    // The key insight: getTime() gives milliseconds since epoch UTC
    // So userLocalDateTime.getTime() already represents the correct UTC time
    const sessionDateTimeUTC = new Date(userLocalDateTime.getTime())
    console.log("UTC time for storage:", sessionDateTimeUTC)
    console.log("UTC time string:", sessionDateTimeUTC.toISOString())
    console.log("UTC timestamp:", sessionDateTimeUTC.getTime())

    // Log time comparison for debugging (but allow past dates)
    const now = new Date()
    console.log("Current time comparison (UTC):", {
      sessionTimeUTC: sessionDateTimeUTC.getTime(),
      currentTimeUTC: now.getTime(),
      isInPast: sessionDateTimeUTC.getTime() < now.getTime(),
      differenceMinutes: Math.floor((sessionDateTimeUTC.getTime() - now.getTime()) / (1000 * 60))
    })

    // Note: Allowing past dates as requested

    console.log("Inserting workshop with data:", {
      host_id: hostProfile.id,
      title,
      session_date: sessionDateTimeUTC.toISOString(),
      duration_hours: durationHours,
      price,
      max_participants: maxParticipants,
      location,
      status: "active"
    })

    const { error } = await supabase.from("workshops").insert({
      host_id: hostProfile.id,
      title,
      description,
      skills,
      tools_provided: toolsProvided,
      session_date: sessionDateTimeUTC.toISOString(),
      duration_hours: durationHours,
      price,
      max_participants: maxParticipants,
      location,
      status: "active",
    })

    if (error) {
      console.error("Supabase workshop insert error:", error)
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      throw new Error(`Failed to create workshop: ${error.message}`)
    }

    console.log("Workshop created successfully!")
    redirect("/dashboard/host")
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Create a Workshop</h1>
          <p className="text-muted-foreground">Set up a new workshop session for learners to book</p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Workshop Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form action={createWorkshop} className="space-y-6">
              {/* Hidden timezone input - populated by JavaScript */}
              <input type="hidden" id="user_timezone" name="user_timezone" />
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

              {/* Submit */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!hostProfile.skills || hostProfile.skills.length === 0}
                >
                  Create Workshop
                </Button>
                <Button type="button" variant="outline" asChild className="bg-transparent">
                  <a href="/dashboard/host">Cancel</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* JavaScript to populate timezone */}
      <script dangerouslySetInnerHTML={{
        __html: `
          document.addEventListener('DOMContentLoaded', function() {
            const timezoneInput = document.getElementById('user_timezone');
            if (timezoneInput) {
              // Get user's timezone
              timezoneInput.value = Intl.DateTimeFormat().resolvedOptions().timeZone;
              console.log('User timezone detected:', timezoneInput.value);
            }
          });
        `
      }} />
    </div>
  )
}
