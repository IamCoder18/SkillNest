"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, MapPin, Clock, ArrowUpRight, ExternalLink } from "lucide-react"
import Image from "next/image"
import { ConfettiOnLoad } from "@/components/ui/confetti"

interface Workshop {
  title: string;
  description: string | null;
  session_date: string | null;
  location: string | null;
  skills: string[] | null;
  price: number | null;
}

interface Booking {
  id: string;
  created_at: string;
  workshops: Workshop | null;
  transaction_hash?: string;
  token_metadata_uri?: string;
  host?: {
    display_name: string | null;
    avatar_url: string | null;
    location: string | null;
  } | null;
}

interface NFTCardProps {
  booking: Booking;
  nftImage: string;
  showConfetti?: boolean;
}

export function NFTCard({ booking, nftImage, showConfetti = false }: NFTCardProps) {
  const workshop = booking.workshops
  if (!workshop) return null

  const sessionDate = workshop.session_date ? new Date(workshop.session_date) : null
  const isValidDate = sessionDate && !isNaN(sessionDate.getTime())
  const host = booking.host

  const hasBlockchainData = booking.transaction_hash && booking.token_metadata_uri
  const cid = booking.token_metadata_uri?.replace('ipfs://', '') || ''

  const handleViewRawData = () => {
    if (cid) {
      window.open(`https://ipfs.io/ipfs/${cid}`, '_blank')
    }
  }

  const handleContinue = () => {
    if (booking.transaction_hash) {
      window.open(`https://amoy.polygonscan.com/tx/${booking.transaction_hash}`, '_blank')
    }
  }

  return (
    <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
      {showConfetti && <ConfettiOnLoad duration={2000} />}
      <CardHeader className="pb-1">
        <CardTitle className="text-xl mb-0 line-clamp-2">{workshop.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Buttons positioned at top right of card - only show if blockchain data exists */}
        {hasBlockchainData && (
          <div className="absolute top-4 right-4 flex flex-row gap-1 z-10">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="default" variant="secondary" className="text-sm">
                  View Transaction
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>View Transaction on Blockchain Explorer</DialogTitle>
                  <DialogDescription>
                    This will take you to a blockchain explorer where you can see the details of your NFT transaction.
                    <br /><br />
                    To get the workshop information:
                    <br />1. Scroll down to the "Input Data" section
                    <br />2. Click "Decode Input Data"
                    <br />3. You'll see something like: ipfs://QmTBYVGV9E8hhZ3w6momRFvSBNDS6Yb2cQ1vzb8oojteiG
                    <br />4. Copy code from "ipfs://(the long code)" and visit "https://ipfs.io/ipfs/(the long code)" to see detailed workshop data.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <Button onClick={handleContinue} className="flex items-center gap-2">
                    Continue
                    <ArrowUpRight className="h-4 w-4" />
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="default" variant="outline" onClick={handleViewRawData} className="text-sm flex items-center gap-1">
              View Raw Data
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-6">
          <div className="w-[200px] h-[200px] rounded-full overflow-hidden flex-shrink-0 shadow-md">
            <Image
              src={nftImage}
              alt="NFT Badge"
              width={200}
              height={200}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Workshop Details */}
          <div className="flex-1 min-w-0">
            {/* Host and Price */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary text-xs">{host?.display_name?.charAt(0).toUpperCase() || "?"}</span>
                </div>
                <span className="text-sm font-medium">{host?.display_name || "Unknown Host"}</span>
              </div>
              <div className="text-sm font-bold text-primary">${workshop.price}</div>
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-3">
              {workshop.skills?.slice(0, 3).map((skill: string, idx: number) => (
                <Badge key={idx} variant="default" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {workshop.skills && workshop.skills.length > 3 && (
                <Badge variant="default" className="text-xs">
                  +{workshop.skills.length - 3} more
                </Badge>
              )}
            </div>

            {/* Description */}
            {workshop.description && (
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{workshop.description}</p>
            )}

            {/* Session Details */}
            <div className="space-y-2 pt-2 border-t">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {isValidDate ? sessionDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }) : "Date TBD"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{isValidDate ? `${sessionDate.getHours().toString().padStart(2, '0')}:${sessionDate.getMinutes().toString().padStart(2, '0')}` : "Time TBD"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="truncate">{workshop.location || "Location TBD"}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}