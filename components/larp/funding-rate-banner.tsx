"use client"

import { useEffect, useState } from "react"

type Funding = { symbol: string; rate: number }

// Fallback static rates (used if real API is unreachable)
const FALLBACK: Funding[] = [
  { symbol: "SOL", rate: 0.0089 },
  { symbol: "BTC", rate: 0.0042 },
  { symbol: "ETH", rate: 0.0058 },
  { symbol: "WIF", rate: 0.0241 },
  { symbol: "BONK", rate: -0.0173 },
  { symbol: "JUP", rate: 0.0067 },
  { symbol: "JTO", rate: 0.0094 },
  { symbol: "PYTH", rate: -0.0028 },
  { symbol: "TRUMP", rate: 0.0312 },
  { symbol: "POPCAT", rate: 0.0156 },
  { symbol: "FARTCOIN", rate: 0.0421 },
  { symbol: "MOODENG", rate: 0.0287 },
]

export function FundingRateBanner() {
  const [rates, setRates] = useState<Funding[]>(FALLBACK)

  useEffect(() => {
    // Try to fetch live funding rates from Drift (public endpoint, no auth)
    // Falls back to static if blocked / errors out — banner stays profi looking either way.
    const load = async () => {
      try {
        const res = await fetch("https://dlob.drift.trade/contracts", {
          signal: AbortSignal.timeout(4000),
        })
        if (!res.ok) return
        const data = await res.json()
        const contracts = Array.isArray(data?.contracts) ? data.contracts : []
        if (!contracts.length) return
        const live: Funding[] = contracts
          .slice(0, 12)
          .map((c: { ticker_id?: string; base_currency?: string; funding_rate?: string | number }) => ({
            symbol: c.base_currency || (c.ticker_id || "").split("-")[0] || "?",
            rate: Number(c.funding_rate ?? 0),
          }))
          .filter((f: Funding) => f.symbol && !Number.isNaN(f.rate))
        if (live.length >= 4) setRates(live)
      } catch {
        /* swallow — keep fallback */
      }
    }
    load()
    const interval = setInterval(load, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative z-[60] bg-[#050505] border-b border-[#A3FF12]/10 overflow-hidden">
      <div className="flex items-center py-2 px-4 gap-6 overflow-hidden whitespace-nowrap">
        <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 flex-shrink-0">
          Funding · 1h
        </span>
        <div className="flex items-center gap-7 animate-ticker-slow">
          {rates.concat(rates).map((r, i) => (
            <div key={`${r.symbol}-${i}`} className="flex items-center gap-1.5 text-[11px] font-mono flex-shrink-0">
              <span className="text-white/60">{r.symbol}</span>
              <span className={r.rate >= 0 ? "text-[#A3FF12]" : "text-[#FF3C6E]"}>
                {r.rate >= 0 ? "+" : ""}
                {(r.rate * 100).toFixed(4)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
