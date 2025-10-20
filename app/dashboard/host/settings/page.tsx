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
import { X, ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { validateWalletAddress } from "@/lib/utils"

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
  const [walletAddress, setWalletAddress] = useState("")
  const [walletOptedOut, setWalletOptedOut] = useState(false)
  const [walletPrompted, setWalletPrompted] = useState(false)
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
          setWalletAddress(profile.wallet_address || "")
          setWalletOptedOut(profile.wallet_opted_out || false)
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


  const handleWalletSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (walletAddress && !validateWalletAddress(walletAddress)) {
      setError("Please enter a valid Ethereum wallet address (42 characters starting with 0x)")
      return
    }

    setIsSaving(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("You must be logged in")

      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          wallet_address: walletAddress || null,
          wallet_opted_out: walletAddress ? false : true, // Auto-opt out if no address, opt in if address provided
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setIsSaving(false)
    }
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
          wallet_address: walletAddress || null,
          wallet_opted_out: walletOptedOut,
          is_host: true // Ensure host status is maintained
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
        <div className="flex justify-between items-center mb-4">
          <Button asChild variant="ghost">
            <Link href="/dashboard/host">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                Leave Host Program
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Leave Host Program?</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to leave the host program? Your host profile and workshop history will be preserved, and you can rejoin anytime by clicking "Become a Host" from the learner dashboard.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      const response = await fetch("/api/toggle-host-status", {
                        method: "POST",
                      })
                      const data = await response.json()
                      if (data.success) {
                        router.push("/dashboard/learner")
                      } else {
                        setError("Failed to leave host program")
                      }
                    } catch (error) {
                      setError("An error occurred while leaving the host program")
                    }
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Leave Program
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

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

              {/* Wallet Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Wallet Settings
                </h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Ethereum wallet to receive "Proof of Skill" tokens - a secure and permanent record of workshops you've completed.
                </p>
                <form onSubmit={handleWalletSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="walletAddress">Ethereum Wallet Address</Label>
                    <Input
                      id="walletAddress"
                      type="text"
                      placeholder="0x..."
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      We only need your wallet address to send tokens. No authentication required.
                    </p>
                  </div>
                  <Button type="submit" size="sm" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Update Wallet Settings"}
                  </Button>
                </form>
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
