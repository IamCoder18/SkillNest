import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const workshopData = {
      learner_id: body.learner_id,
      learner_name: body.learner_name,
      host_id: body.host_id,
      host_name: body.host_name,
      workshop_name: body.workshop_name,
      workshop_id: body.workshop_id,
      workshop_description: body.workshop_description,
      tools_used: body.tools_used,
      skills_learned: body.skills_learned,
      session_duration: body.session_duration,
      session_start_date_time: body.session_start_date_time
    }

    // Upload JSON to Filebase IPFS RPC
    const form = new FormData()
    form.append(
      'file',
      new Blob([JSON.stringify(workshopData)], { type: 'application/json' }),
      'workshop.json'
    )

    const response = await fetch('https://rpc.filebase.io/api/v0/add', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.FILEBASE_IPFS_KEY}`
      },
      body: form
    })

    if (!response.ok) {
      throw new Error(`IPFS upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    const cid = result.Hash

    return NextResponse.json({
      success: true,
      message: 'Workshop data uploaded to IPFS successfully',
      data: workshopData,
      ipfs: {
        cid: cid,
        url: `ipfs://${cid}`
      }
    })
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    return NextResponse.json(
      { error: 'Failed to upload workshop data to IPFS' },
      { status: 500 }
    )
  }
}