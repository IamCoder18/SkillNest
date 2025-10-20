import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"

export interface Workshop {
  title: string;
  description: string | null;
  session_date: string | null;
  location: string | null;
  skills: string[] | null;
  price: number | null;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// NFT Images Configuration
export const NFT_IMAGES: { [key: string]: string } = {
  "woodworking": "/WoodworkingNFT.avif",
  "auto-skills": "/AutoSkillsNFT.avif",
  "metalwork": "/MetalworkNFT.avif",
  "crafts-textiles": "/CraftsTextilesNFT.avif",
  "digital-fabrication": "/DigitalFabricationNFT.avif",
  "home-repairs": "/HomeRepairsNFT.avif",
  "other": "/OtherNFT.avif"
}

// Configuration constants
export const SKILL_CATEGORY_MAP: Record<string, string[]> = {
  "digital-fabrication": ["3d printing", "3d print", "cnc", "laser", "cad", "digital fabrication"],
  "crafts-textiles": ["craft", "textile", "sewing", "knitting", "fabric", "crafts & textiles"],
  "woodworking": ["wood", "carpentry", "cabinet", "woodworking"],
  "auto-skills": ["auto", "car", "vehicle", "mechanic", "auto skills"],
  "metalwork": ["metal", "welding", "steel", "aluminum", "metalwork"],
  "home-repairs": ["home", "repair", "plumbing", "electrical", "maintenance", "home repairs"],
}

// Helper function to get NFT category for a workshop based on skills
export const getNFTCategoryForWorkshop = (workshop: Workshop | null): string => {
  const skills = workshop?.skills || []

  if (skills.length === 0) {
    return "other"
  }

  for (const skill of skills) {
    const skillLower = skill?.toLowerCase() || ''
    for (const category in SKILL_CATEGORY_MAP) {
      if (SKILL_CATEGORY_MAP[category].some(keyword => skillLower.includes(keyword))) {
        return category
      }
    }
  }

  return "other"
}

// Helper function to get NFT image for a workshop based on skills
export const getNFTImageForWorkshop = (workshop: Workshop | null): string => {
  const category = getNFTCategoryForWorkshop(workshop)
  return NFT_IMAGES[category as keyof typeof NFT_IMAGES] || NFT_IMAGES["other"]
}

// Validate wallet address
export const validateWalletAddress = (address: string): boolean => {
  return ethers.isAddress(address)
}
