import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || ''

// GET - Fetch a single user-created market by symbol.
// If the market isn't in user_markets, returns { market: null } so the client
// falls back to its built-in token registry.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params

  try {
    const rows = await sql`
      SELECT * FROM user_markets
      WHERE LOWER(token_symbol) = LOWER(${symbol})
      LIMIT 1
    `

    if (!rows.length) {
      return NextResponse.json({ market: null })
    }

    const data: any = rows[0]

    // Refresh price from Birdeye if we have an address + API key.
    if (data?.token_address && BIRDEYE_API_KEY) {
      try {
        const priceResponse = await fetch(
          `https://public-api.birdeye.so/defi/price?address=${data.token_address}`,
          {
            headers: { 'X-API-KEY': BIRDEYE_API_KEY, 'x-chain': 'solana' },
            next: { revalidate: 30 }
          }
        )
        if (priceResponse.ok) {
          const priceData = await priceResponse.json()
          if (priceData.data?.value) {
            data.current_price = priceData.data.value
            data.price_change_24h = priceData.data.priceChange24h || 0
          }
        }
      } catch {
        // keep DB price
      }
    }

    return NextResponse.json({ market: data })
  } catch (e: any) {
    console.error('[markets/[symbol] GET] error:', e?.message)
    return NextResponse.json({ market: null })
  }
}
