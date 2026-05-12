"use client"

import { useEffect, useState } from "react"

// Anchor date — counter looks like it's been ticking up since this date.
// Tweak this whenever you want the bar to look fresher.
const ANCHOR = new Date("2026-05-01T00:00:00Z").getTime()
const TOTAL = 1000
const START_CLAIMED = 412 // visible "claimed" count on May 1st 2026
const PER_DAY = 16        // approximate claims/day — bar fills naturally over ~5 weeks

export function FounderPassBanner() {
  const [claimed, setClaimed] = useState(START_CLAIMED)

  useEffect(() => {
    const tick = () => {
      const daysPassed = Math.max(0, (Date.now() - ANCHOR) / (1000 * 60 * 60 * 24))
      const base = START_CLAIMED + Math.floor(daysPassed * PER_DAY)
      // tiny jitter so it doesn't look frozen between page reloads
      const jitter = Math.floor((Date.now() / 1000) % 3)
      setClaimed(Math.min(TOTAL - 5, base + jitter))
    }
    tick()
    const interval = setInterval(tick, 30000)
    return () => clearInterval(interval)
  }, [])

  const pct = Math.min(100, Math.round((claimed / TOTAL) * 100))

  return (
    <section className="bg-[#0a0a0a] border-y border-[#A3FF12]/10 py-4">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-[#A3FF12]/10 border border-[#A3FF12]/30">
              <svg className="w-4 h-4 text-[#A3FF12]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="10" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#A3FF12] font-mono font-bold">
                Founder Pass
              </div>
              <div className="text-sm text-white/80">
                First {TOTAL.toLocaleString('en-US')} demo traders mint a non-transferable Founder Pass
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[320px]">
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-[#A3FF12] transition-[width] duration-700"
                style={{ width: `${pct}%`, boxShadow: "0 0 14px rgba(163,255,18,0.5)" }}
              />
            </div>
            <div className="text-xs font-mono text-white/70 whitespace-nowrap">
              <span className="text-[#A3FF12] font-semibold">{claimed.toLocaleString('en-US')}</span>
              <span className="text-white/40"> / {TOTAL.toLocaleString('en-US')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
