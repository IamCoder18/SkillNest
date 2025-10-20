"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LeaveHostButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLeaveHost = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/toggle-host-status", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        router.push("/dashboard/learner")
      } else {
        console.error("Failed to leave host platform:", data.error)
      }
    } catch (error) {
      console.error("Error leaving host platform:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={handleLeaveHost}
      disabled={isLoading}
    >
      {isLoading ? "Leaving..." : "Leave Host Platform"}
    </Button>
  )
}