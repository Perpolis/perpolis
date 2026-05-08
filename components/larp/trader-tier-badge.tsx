"use client"

import { useEffect, useState } from "react"

type Tier = {
  label: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  color: string
  ring: string
}

const TIERS: Tier[] = [
  { label: "BRONZE", color: "#CD7F32", ring: "rgba(205,127,50,0.35)" },
  { label: "SILVER", color: "#C0C0C0", ring: "rgba(192,192,192,0.35)" },
  { label: "GOLD", color: "#FFC83D", ring: "rgba(255,200,61,0.35)" },
  { label: "PLATINUM", color: "#A3FF12", ring: "rgba(163,255,18,0.35)" },
]

// Deterministic tier from a string seed (so the same "wallet" always lands the same tier)
function pickTier(seed: string): Tier {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  // Skew toward bronze/silver — gold/platinum should feel scarce
  const r = h % 100
  if (r < 50) return TIERS[0]
  if (r < 80) return TIERS[1]
  if (r < 95) return TIERS[2]
  return TIERS[3]
}

export function TraderTierBadge() {
  const [tier, setTier] = useState<Tier | null>(null)

  useEffect(() => {
    let seed = localStorage.getItem("perpolis-tier-seed")
    if (!seed) {
      seed = Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem("perpolis-tier-seed", seed)
    }
    setTier(pickTier(seed))
  }, [])

  if (!tier) return null

  return (
    <div
      className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border bg-black/40 backdrop-blur"
      style={{ borderColor: tier.ring }}
      title="Your Trader Tier — based on demo activity"
    >
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: tier.color, boxShadow: `0 0 12px ${tier.color}` }}
      />
      <span
        className="text-[10px] font-mono font-bold uppercase tracking-widest"
        style={{ color: tier.color }}
      >
        {tier.label}
      </span>
    </div>
  )
}
