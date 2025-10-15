"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { ArrowLeft, Wallet } from "lucide-react"
import Link from "next/link"

export default function LearnerSettingsPage() {
  const [displayName, setDisplayName] = useState("")
  const [location, setLocation] = useState("")
  const [bio, setBio] = useState("")
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

        if (profile) {
          setDisplayName(profile.display_name || "")
          setLocation(profile.location || "")
          setBio(profile.bio || "")
          setWalletAddress(profile.wallet_address || "")
          setWalletOptedOut(profile.wallet_opted_out || false)
          setWalletPrompted(profile.wallet_prompted || false)
        }
      }
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  const validateWalletAddress = (address: string): boolean => {
    if (!address.startsWith("0x")) return false
    if (address.length !== 42) return false
    return /^[0-9a-fA-F]+$/.test(address.slice(2))
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
          wallet_prompted: true,
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
          wallet_prompted: walletPrompted,
        })
        .eq("id", user.id)

      if (profileError) throw profileError

      router.push("/dashboard/learner")
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
          <Link href="/dashboard/learner">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-3xl">Learner Settings</CardTitle>
            <CardDescription>Update your profile and preferences</CardDescription>
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
                  <Input
                    id="bio"
                    placeholder="Tell hosts about yourself..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
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

              {error && <p className="text-sm text-red-500">{error}</p>}
              {success && <p className="text-sm text-green-600">Settings saved successfully!</p>}

              <Button type="submit" className="w-full" size="lg" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}