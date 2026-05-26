"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function TokenPageError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("[token-page] crash:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#111] border border-[#1a1a1a] rounded-2xl p-8 text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-[#A3FF12]/10 border border-[#A3FF12]/30 flex items-center justify-center">
          <span className="text-2xl">⚠</span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-gray-400 text-sm mb-6">
          The trading view couldn&apos;t load this market. This usually clears up on a retry.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="w-full bg-[#A3FF12] text-black font-semibold rounded-full py-3 hover:bg-[#8AE000] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/meme-perps"
            className="w-full bg-[#1a1a1a] text-white border border-white/10 rounded-full py-3 hover:bg-[#222] transition-colors"
          >
            Back to markets
          </Link>
        </div>
      </div>
    </div>
  )
}
