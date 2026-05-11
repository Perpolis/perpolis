import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Fetch all user-created markets
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const creatorWallet = searchParams.get('creator')

  try {
    const rows = creatorWallet
      ? await sql`
          SELECT * FROM user_markets
          WHERE creator_wallet = ${creatorWallet}
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT * FROM user_markets
          ORDER BY created_at DESC
        `
    return NextResponse.json({ markets: rows })
  } catch (e: any) {
    console.error('[markets GET] error:', e?.message)
    return NextResponse.json({ markets: [] })
  }
}

// POST - Create a new market
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      creator_wallet,
      token_address,
      token_symbol,
      token_name,
      token_logo,
      collateral,
      max_leverage,
      trading_fee,
      current_price
    } = body

    if (!creator_wallet || !token_address || !token_symbol || !token_name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Already exists?
    const existing = await sql`
      SELECT id FROM user_markets WHERE token_address = ${token_address}
    `
    if (existing.length) {
      return NextResponse.json({ error: 'Market already exists for this token' }, { status: 409 })
    }

    const initial_change = +(Math.random() * 20 - 10).toFixed(2)
    const rows = await sql`
      INSERT INTO user_markets (
        creator_wallet, token_address, token_symbol, token_name, token_logo,
        collateral, max_leverage, trading_fee, current_price, price_change_24h,
        volume_24h, open_interest, funding_rate
      ) VALUES (
        ${creator_wallet}, ${token_address},
        ${String(token_symbol).toUpperCase()}, ${token_name}, ${token_logo || null},
        ${collateral || 'USDC'}, ${Number(max_leverage) || 10},
        ${Number(trading_fee) || 0.1}, ${Number(current_price) || 0},
        ${initial_change}, 0, 0, 0
      )
      RETURNING *
    `
    return NextResponse.json({ market: rows[0] }, { status: 201 })
  } catch (error: any) {
    console.error('[markets POST] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to create market' }, { status: 500 })
  }
}
