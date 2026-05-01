import { NextRequest, NextResponse } from "next/server"

const USDC_MINT = process.env.USDC_MINT || ""
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ""

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  if (!HELIUS_API_KEY) {
    return NextResponse.json({ solBalance: 0, usdcBalance: 0, error: 'RPC not configured' })
  }

  try {
    const response = await fetch(
      `https://api.helius.xyz/v0/addresses/${address}/balances?api-key=${HELIUS_API_KEY}`,
      { cache: 'no-store' }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[wallet-balance] RPC error:', response.status, errorText)
      return NextResponse.json({ solBalance: 0, usdcBalance: 0, error: errorText })
    }

    const data = await response.json()

    const solBalance = (data.nativeBalance || 0) / 1e9

    const tokens = data.tokens || []
    const usdcToken = tokens.find((t: any) => t.mint === USDC_MINT)

    let usdcBalance = 0
    if (usdcToken) {
      usdcBalance = usdcToken.amount / Math.pow(10, usdcToken.decimals || 6)
    }

    return NextResponse.json({
      solBalance,
      usdcBalance,
    })
  } catch (error: any) {
    console.error('[wallet-balance] fetch error:', error?.message)
    return NextResponse.json({ solBalance: 0, usdcBalance: 0, error: error.message })
  }
}
