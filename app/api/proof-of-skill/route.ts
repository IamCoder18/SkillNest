import { NextRequest, NextResponse } from 'next/server'
import { ethers } from 'ethers'
import { createClient } from '@/lib/supabase/server'

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
      session_start_date_time: body.session_start_date_time,
      wallet_address: body.wallet_address
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
      const errorText = await response.text()
      throw new Error(`IPFS upload failed: ${response.statusText} - ${errorText}`)
    }

    const result = await response.json()
    const cid = result.Hash
    const metadataUri = `ipfs://${cid}`

    // Validate wallet address
    if (!body.wallet_address || !ethers.isAddress(body.wallet_address)) {
      throw new Error(`Invalid wallet address: ${body.wallet_address}`)
    }

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