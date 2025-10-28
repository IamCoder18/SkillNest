"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function BecomeHostButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleBecomeHost = async () => {
    console.log("[DEBUG] BecomeHostButton: Starting handleBecomeHost")
    setIsLoading(true)
    try {
      const supabase = createClient()
      console.log("[DEBUG] BecomeHostButton: Created Supabase client")

      const { data: { user }, error: userError } = await supabase.auth.getUser()
      console.log("[DEBUG] BecomeHostButton: getUser result", { user: user ? { id: user.id, email: user.email } : null, error: userError })

      if (!user) {
        console.log("[DEBUG] BecomeHostButton: No user found, redirecting to login")
        router.push("/auth/login")
        return
      }

      console.log("[DEBUG] BecomeHostButton: User authenticated, making API call")
      const response = await fetch("/api/become-host", {
        method: "POST",
      })
      console.log("[DEBUG] BecomeHostButton: API response status:", response.status)

      const data = await response.json()
      console.log("[DEBUG] BecomeHostButton: API response data:", data)

      if (response.ok && data.success) {
        console.log("[DEBUG] BecomeHostButton: Success, showing success modal")
        setShowSuccess(true)
        setTimeout(() => {
          router.push(data.redirect)
        }, 2000)
      } else {
        console.error("[DEBUG] BecomeHostButton: Failed to become host:", data.error)
      }
    } catch (error) {
      console.error("[DEBUG] BecomeHostButton: Error becoming host:", error)
    } finally {
      setIsLoading(false)
      console.log("[DEBUG] BecomeHostButton: Finished handleBecomeHost")
    }
  }

  return (
    <>
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Become a Host"}
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Become a Host</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to become a host? This will allow you to create and manage workshops for learners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBecomeHost} disabled={isLoading}>
              {isLoading ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to Hosting!</DialogTitle>
            <DialogDescription>
              Your host profile has been created successfully. You can now create workshops and share your skills with learners.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => router.push("/dashboard/host")}>Go to Host Dashboard</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}