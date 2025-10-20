import { NextRequest, NextResponse } from 'next/server'
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase.from("profiles").select("is_host").eq("id", user.id).maybeSingle()

    if (!profile?.is_host) {
      return NextResponse.json({ error: "User is not a host" }, { status: 403 })
    }

    const { data: hostProfile } = await supabase.from("host_profiles").select("id").eq("user_id", user.id).maybeSingle()

    if (!hostProfile) {
      return NextResponse.json({ error: "Host profile not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const skills = formData.getAll("skills") as string[]
    const toolsProvided = (formData.get("tools_provided") as string).split(",").map((t) => t.trim())
    const sessionDate = formData.get("session_date") as string // This is now already a UTC timestamp
    const durationHours = Number.parseFloat(formData.get("duration_hours") as string)
    const price = Number.parseFloat(formData.get("price") as string)
    const maxParticipants = Number.parseInt(formData.get("max_participants") as string)
    const location = formData.get("location") as string


    // sessionDate is already a UTC timestamp from the client
    const { error } = await supabase.from("workshops").insert({
      host_id: hostProfile.id,
      title,
      description,
      skills,
      tools_provided: toolsProvided,
      session_date: sessionDate,
      duration_hours: durationHours,
      price,
      max_participants: maxParticipants,
      location,
      status: "active",
    })

    if (error) {
      return NextResponse.json({ error: `Failed to create workshop: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create workshop' },
      { status: 500 }
    )
  }
}