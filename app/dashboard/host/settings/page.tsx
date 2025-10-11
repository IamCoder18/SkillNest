"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { X, ArrowLeft } from "lucide-react"
import Link from "next/link"

const skillOptions = [
  "Woodworking",
  "Auto Skills",
  "Metalwork & Welding",
  "Crafts & Textiles",
  "Digital Fabrication",
  "Home Repairs",
]

export default function HostSettingsPage() {
  const [displayName, setDisplayName] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [customSkillInput, setCustomSkillInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const loadProfile = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
        const { data: hostProfile } = await supabase
          .from("host_profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()

        if (profile) {
          setDisplayName(profile.display_name || "")
          setLocation(profile.location || "")
          setBio(profile.bio || "")
        }
        if (hostProfile) {
          setSkills(hostProfile.skills || [])
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const toggleSkill = (skill: string) => {
    setSkills((prev) => (prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]))
  }

  const addCustomSkill = () => {
    if (customSkillInput.trim() && !skills.includes(customSkillInput.trim())) {
      setSkills([...skills, customSkillInput.trim()])
      setCustomSkillInput("")
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in")

      // Update profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          location,
          bio,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      const { error: hostError } = await supabase
        .from("host_profiles")
        .update({
          skills,
        })
        .eq("user_id", user.id)

      if (hostError) throw hostError

      router.push("/dashboard/host")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/dashboard/host">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Host Settings</CardTitle>
            <CardDescription>Update your workshop profile and information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="e.g., Calgary, AB"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell learners about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Skills You Can Teach</h3>
                <div className="flex flex-wrap gap-2">
                  {skillOptions.map((skill) => (
                    <Badge
                      key={skill}
                      variant={skills.includes(skill) ? "default" : "outline"}
                      className="cursor-pointer px-4 py-2"
                      onClick={() => toggleSkill(skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customSkill" className="text-sm text-muted-foreground">
                    Other (specify):
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="customSkill"
                      placeholder="Enter custom skill..."
                      value={customSkillInput}
                      onChange={(e) => setCustomSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                    />
                    <Button type="button" onClick={addCustomSkill}>
                      Add
                    </Button>
                  </div>
                </div>
                {skills.filter((s) => !skillOptions.includes(s)).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills
                      .filter((s) => !skillOptions.includes(s))
                      .map((skill) => (
                        <Badge key={skill} variant="secondary" className="px-3 py-1">
                          {skill}
                          <button type="button" onClick={() => removeSkill(skill)} className="ml-2">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">Settings saved successfully!</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isSaving || skills.length === 0}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
