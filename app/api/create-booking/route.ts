import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const hostId = formData.get("host_id") as string
    const sessionDate = formData.get("session_date") as string // This is now already a UTC timestamp
    const skill = formData.get("skill") as string
    const notes = formData.get("notes") as string

    console.log("=== SERVER RECEIVED BOOKING DATA ===")
    console.log("Session date (UTC):", sessionDate)
    console.log("Current server time (UTC):", new Date().toISOString())

    // sessionDate is already a UTC timestamp from the client
    const { error: bookingError } = await supabase.from("bookings").insert({
      host_id: hostId,
      learner_id: user.id,
      session_date: sessionDate,
      skill,
      notes,
      status: "pending",
    })

    if (bookingError) {
      console.error("Supabase booking insert error:", bookingError)
      return NextResponse.json({ error: `Failed to create booking: ${bookingError.message}` }, { status: 500 })
    }

    console.log("Booking created successfully!")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}