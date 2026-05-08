"use client"

import { useEffect, useState } from "react"

type WhaleEvent = {
  id: number
  wallet: string
  action: "opened" | "closed"
  side: "LONG" | "SHORT"
  size: string
  symbol: string
  pnl?: number
}

const SYMBOLS = ["SOL", "BONK", "WIF", "POPCAT", "PEPE", "FARTCOIN", "JUP", "JTO", "MOODENG", "TROLL", "PNUT", "GIGA", "ZEREBRO", "POPCAT", "ACT", "PONKE"]

// Solana base58 alphabet (no 0, O, I, l).
const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"

function whaleWallet() {
  let prefix = ""
  let suffix = ""
  for (let i = 0; i < 4; i++) prefix += B58[Math.floor(Math.random() * B58.length)]
  for (let i = 0; i < 4; i++) suffix += B58[Math.floor(Math.random() * B58.length)]
  return `${prefix}…${suffix}`
}

function generateEvent(id: number): WhaleEvent {
  // Realistic sizes for a small demo DEX — no $1M+ flexing.
  const sizes = ["$1.2K", "$1.8K", "$2.4K", "$3.5K", "$5.2K", "$7.8K", "$11K", "$15K", "$22K"]
  const action = Math.random() > 0.55 ? "opened" : "closed"
  return {
    id,
    wallet: whaleWallet(),
    action,
    side: Math.random() > 0.5 ? "LONG" : "SHORT",
    size: sizes[Math.floor(Math.random() * sizes.length)],
    symbol: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
    // PnL on closed trades — keep modest, max ±$5K.
    pnl: action === "closed" ? +(Math.random() * 7000 - 2500).toFixed(0) : undefined,
  }
}

// Random delay between toasts, in milliseconds. Min 18s, max 32s.
function nextDelay() {
  return 18000 + Math.random() * 14000
}

export function WhaleWatchToast() {
  const [events, setEvents] = useState<WhaleEvent[]>([])

  useEffect(() => {
    let cancelled = false
    let counter = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const emit = () => {
      if (cancelled) return
      const ev = generateEvent(counter++)
      setEvents((prev) => [...prev, ev].slice(-3))
      const dismiss = setTimeout(() => {
        if (cancelled) return
        setEvents((prev) => prev.filter((e) => e.id !== ev.id))
      }, 7000)
      timeouts.push(dismiss)
      const nextId = setTimeout(emit, nextDelay())
      timeouts.push(nextId)
    }

    // First event 5s after mount.
    const initialId = setTimeout(emit, 5000)
    timeouts.push(initialId)

    return () => {
      cancelled = true
      for (const id of timeouts) clearTimeout(id)
    }
  }, [])

  return (
    <div className="fixed bottom-14 right-4 z-40 flex flex-col gap-2 pointer-events-none">
      {events.map((ev) => (
        <div
          key={ev.id}
          className="bg-[#0d0d0d]/95 backdrop-blur-md border border-[#A3FF12]/20 rounded-lg px-4 py-3 max-w-xs shadow-2xl animate-slide-up"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">🐋</span>
            <span className="text-[10px] uppercase tracking-widest text-[#A3FF12] font-mono font-bold">
              Whale Watch
            </span>
          </div>
          <div className="text-xs text-white/80 font-mono leading-snug">
            <span className="text-white/50">{ev.wallet}</span> {ev.action}{" "}
            <span className={ev.side === "LONG" ? "text-[#A3FF12]" : "text-[#FF3C6E]"}>
              {ev.size} {ev.side}
            </span>{" "}
            on <span className="text-white">${ev.symbol}</span>
            {ev.pnl !== undefined && (
              <span className={ev.pnl >= 0 ? "text-[#A3FF12]" : "text-[#FF3C6E]"}>
                {" "}
                ({ev.pnl >= 0 ? "+" : ""}${ev.pnl.toLocaleString('en-US')})
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
