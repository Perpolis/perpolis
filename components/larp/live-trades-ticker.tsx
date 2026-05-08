"use client"

import { useEffect, useState } from "react"

type Trade = {
  id: number
  wallet: string
  side: "LONG" | "SHORT"
  leverage: number
  symbol: string
  price: number
  pnl: number
}

const SYMBOLS = ["SOL", "BONK", "WIF", "POPCAT", "PEPE", "FARTCOIN", "JUP", "PYTH", "JTO", "TRUMP", "MOODENG", "TROLL", "GIGA", "PNUT", "ZEREBRO", "RAY", "RENDER", "HNT", "ORCA", "ACT", "PONKE", "AURA", "MICHI", "DRIFT"]
const LEVERAGES = [2, 3, 5, 10, 20, 25, 50, 100]

// Solana base58 alphabet (excludes 0, O, I, l for clarity).
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function shortWallet() {
  let prefix = ""
  let suffix = ""
  for (let i = 0; i < 4; i++) prefix += B58[Math.floor(Math.random() * B58.length)]
  for (let i = 0; i < 4; i++) suffix += B58[Math.floor(Math.random() * B58.length)]
  return `${prefix}…${suffix}`
}

function randomTrade(id: number): Trade {
  const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
  const leverage = LEVERAGES[Math.floor(Math.random() * LEVERAGES.length)]
  const side = Math.random() > 0.45 ? "LONG" : "SHORT"
  const price = +(Math.random() * 200 + 0.5).toFixed(4)
  const pnl = +(Math.random() * 4000 - 1500).toFixed(2)
  return { id, wallet: shortWallet(), side, leverage, symbol, price, pnl }
}

// Generate ONCE on mount — a large static pool that loops infinitely via CSS.
// No setInterval, no React re-renders, no animation restarts. Smooth scroll.
const POOL_SIZE = 60

export function LiveTradesTicker() {
  const [trades, setTrades] = useState<Trade[]>([])

  useEffect(() => {
    // Seed once on client (SSR-safe, no hydration mismatch)
    setTrades(Array.from({ length: POOL_SIZE }, (_, i) => randomTrade(i)))
  }, [])

  if (trades.length === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/85 backdrop-blur-md border-t border-[#A3FF12]/15 overflow-hidden">
      <div className="flex items-center gap-6 py-2.5 px-4 overflow-hidden whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-widest font-mono text-[#A3FF12] flex-shrink-0 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A3FF12] animate-pulse" />
          Live
        </span>
        <div className="flex items-center gap-8 animate-ticker">
          {/* Duplicate the pool inline so the loop is seamless (50% translateX). */}
          {trades.concat(trades).map((t, i) => (
            <div key={`${t.id}-${i}`} className="flex items-center gap-2 text-xs font-mono flex-shrink-0">
              <span className="text-white/40">{t.wallet}</span>
              <span className={t.side === "LONG" ? "text-[#A3FF12]" : "text-[#FF3C6E]"}>
                {t.side}
              </span>
              <span className="text-white/70">{t.leverage}x</span>
              <span className="text-white">${t.symbol}</span>
              <span className="text-white/40">@</span>
              <span className="text-white/70">${t.price}</span>
              <span className={t.pnl >= 0 ? "text-[#A3FF12]" : "text-[#FF3C6E]"}>
                {t.pnl >= 0 ? "+" : ""}${t.pnl}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
