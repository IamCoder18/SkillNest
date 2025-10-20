import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const abi = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function balanceOf(address owner) view returns (uint256)",
  "function owner() view returns (address)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function walletTokenURIs(address owner) view returns (string[])",
  "function mint(address to, string uri) returns (uint256)",
  "function revoke(uint256 tokenId)",
  "function transferOwnership(address newOwner)",
  "function supportsInterface(bytes4 interfaceId) view returns (bool)"
]

const NFT_IMAGES: { [key: string]: string } = {
  "Woodworking": "ipfs://QmS5KSvdtymrRLhEFFXWHjQHsqHJFcjpbWqXaqoB3iD1QS",
  "Auto Skills": "ipfs://QmXkPxkZsn2TRvvz9L9nEzcG27qpckCkPzbB3zcPie36fk",
  "Metalwork": "ipfs://QmWnwXPn5JYKbiQoeesB2fsuBbUzxL8yYtC97siSJqyGNz",
  "Crafts & Textiles": "ipfs://QmXJMHozSZ4Qa7Fi49VYsgKp4v9c1tTp3WHzCqyMgEmSho",
  "Digital Fabrication": "ipfs://QmRThjbqdbzBfzy2hn24eHtAuxAGdRMVgofqf7fWbRLMvg",
  "Home Repairs": "ipfs://QmTpD8LB4sAsobG12g5b7xPGf4GA3Zm5tjGAKtsMHGsUxe",
  "Other": "ipfs://QmTWAPmFedxsozJFpNcM1oNtCY65epcsxVF3XRoFwJiXBc"
}

const proofOfSkillSchema = z.object({
  learner_id: z.string(),
  learner_name: z.string(),
  host_id: z.string(),
  host_name: z.string(),
  workshop_name: z.string(),
  workshop_id: z.string(),
  workshop_description: z.string(),
  tools_used: z.string(),
  skills_learned: z.array(z.string()).min(1),
  session_duration: z.string(),
  session_start_date_time: z.string(),
  wallet_address: z.string().refine(ethers.isAddress, "Invalid wallet address")
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedBody = proofOfSkillSchema.parse(body)

    const workshopData = {
      learner_id: validatedBody.learner_id,
      learner_name: validatedBody.learner_name,
      host_id: validatedBody.host_id,
      host_name: validatedBody.host_name,
      workshop_name: validatedBody.workshop_name,
      workshop_id: validatedBody.workshop_id,
      workshop_description: validatedBody.workshop_description,
      tools_used: validatedBody.tools_used,
      skills_learned: validatedBody.skills_learned,
      session_duration: validatedBody.session_duration,
      session_start_date_time: validatedBody.session_start_date_time,
      wallet_address: validatedBody.wallet_address
    }

    const nftMetadata = {
      "name": `Proof Of Skill: ${workshopData.workshop_name}`,
      "description": `${workshopData.learner_name} completed the workshop ${workshopData.workshop_name} hosted by ${workshopData.host_name}. Futher details are in the attributes section.`,
      "image": `${NFT_IMAGES[workshopData.skills_learned?.[0]] || NFT_IMAGES["Other"]}`,
      "attributes": [
        {
          "trait_type": "Learner ID",
          "value": workshopData.learner_id
        },
        {
          "trait_type": "Learner Name",
          "value": workshopData.learner_name
        },
        {
          "trait_type": "Host ID",
          "value": workshopData.host_id
        },
        {
          "trait_type": "Host Name",
          "value": workshopData.host_name
        },
        {
          "trait_type": "Workshop ID",
          "value": workshopData.workshop_id
        },
        {
          "trait_type": "Tools Used",
          "value": workshopData.tools_used
        },
        {
          "trait_type": "Skills Learned",
          "value": workshopData.skills_learned
        },
        {
          "trait_type": "Session Duration",
          "value": workshopData.session_duration
        },
        {
          "trait_type": "Session Start Time",
          "value": workshopData.session_start_date_time
        }
      ]
    }

    if (!process.env.RPC_URL || !process.env.WALLET_PRIVATE_KEY || !process.env.CONTRACT_ADDRESS) {
      throw new Error('Missing required environment variables for blockchain operations')
    }

    // Initialize ethers wallet and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL!)
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY!, provider)
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS!, abi, wallet)

    // Test contract connection
    try {
      await contract.name()
    } catch (contractError) {
      throw new Error(`Contract connection failed: ${contractError instanceof Error ? contractError.message : String(contractError)}`)
    }

    // Upload JSON to Filebase IPFS RPC
    const form = new FormData()
    form.append(
      'file',
      new Blob([JSON.stringify(nftMetadata)], { type: 'application/json' }),
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
      const errorText = await response.text()
      throw new Error(`IPFS upload failed: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    const cid = result.Hash
    const metadataUri = `ipfs://${cid}`

    // Wallet address is already validated by Zod schema

    // Mint the token
    const mintTx = await contract.mint(body.wallet_address, metadataUri)
    const receipt = await mintTx.wait()

    return NextResponse.json({
      success: true,
      message: 'Proof of Skill token minted successfully',
      data: workshopData,
      ipfs: {
        cid: cid,
        url: metadataUri
      },
      transaction: {
        hash: receipt.hash,
        blockNumber: receipt.blockNumber
      }
    })
  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error(String(error))

    return NextResponse.json(
      {
        error: 'Failed to mint Proof of Skill token',
        details: errorObj.message
      },
      { status: 500 }
    )
  }
}