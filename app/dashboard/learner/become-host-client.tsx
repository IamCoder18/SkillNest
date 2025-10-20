"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function BecomeHostButton() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleBecomeHost = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/become-host", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        router.push(data.redirect)
      } else {
        console.error("Failed to become host:", data.error)
      }
    } catch (error) {
      console.error("Error becoming host:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleBecomeHost}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Become a Host"}
    </Button>
  )
}