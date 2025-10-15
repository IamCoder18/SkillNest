"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function WalletSetupPage() {
  const [walletAddress, setWalletAddress] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSkipDialog, setShowSkipDialog] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      // Check if user already has wallet setup or opted out
      const { data: profile } = await supabase
        .from("profiles")
        .select("wallet_address, wallet_opted_out, wallet_prompted")
        .eq("id", user.id)
        .single()

      if (profile && (profile.wallet_address || profile.wallet_opted_out)) {
        router.push("/dashboard")
      }
    }

    checkAuth()
  }, [router])

  const validateWalletAddress = (address: string): boolean => {
    if (!address.startsWith("0x")) return false
    if (address.length !== 42) return false
    return /^[0-9a-fA-F]+$/.test(address.slice(2))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateWalletAddress(walletAddress)) {
      setError("Please enter a valid Ethereum wallet address (42 characters starting with 0x)")
      return
    }

    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          wallet_address: walletAddress,
          wallet_prompted: true
        })
        .eq("id", user.id)

      if (error) throw error

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { error } = await supabase
        .from("profiles")
        .update({
          wallet_opted_out: true,
          wallet_prompted: true
        })
        .eq("id", user.id)

      if (error) throw error

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Set Up Your Wallet</CardTitle>
            <CardDescription>
              Connect your Ethereum wallet to receive "Proof of Skill" tokens - a secure and permanent record of the workshops you've completed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="wallet">Ethereum Wallet Address</Label>
                  <Input
                    id="wallet"
                    type="text"
                    placeholder="0x..."
                    required
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                  <p className="text-sm text-muted-foreground">
                    We only need your wallet address to send tokens. No authentication required.
                  </p>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Wallet Address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowSkipDialog(true)}
                  disabled={isLoading}
                >
                  Skip for Now
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Dialog open={showSkipDialog} onOpenChange={setShowSkipDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Skip Wallet Setup?</DialogTitle>
              <DialogDescription>
                Are you sure you want to skip setting up your wallet? You won't receive "Proof of Skill" tokens,
                but you'll still be able to host, register for, and attend workshops just like users with a wallet address.
                You can always add your wallet address later in your settings.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSkipDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSkip} disabled={isLoading}>
                {isLoading ? "Skipping..." : "Skip"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}