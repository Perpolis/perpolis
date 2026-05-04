import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - List positions for a wallet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('wallet')
  const status = searchParams.get('status') || 'open'

  if (!walletAddress) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }

  try {
    const rows = status === 'all'
      ? await sql`
          SELECT * FROM positions
          WHERE wallet_address = ${walletAddress}
          ORDER BY created_at DESC
        `
      : await sql`
          SELECT * FROM positions
          WHERE wallet_address = ${walletAddress} AND status = ${status}
          ORDER BY created_at DESC
        `
    return NextResponse.json({ positions: rows })
  } catch (e: any) {
    console.error('[positions GET] error:', e?.message)
    return NextResponse.json({ positions: [], error: e?.message }, { status: 200 })
  }
}

// POST - Create a new position
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      walletAddress,
      market,
      tokenSymbol,
      side,
      size,
      leverage,
      entryPrice,
      liquidationPrice,
      collateral,
      commission
    } = body

    if (!walletAddress || !market || !tokenSymbol || !side || !size || !leverage || !entryPrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO positions (
        wallet_address, market, token_symbol, side, size, leverage,
        entry_price, liquidation_price, collateral, commission, status
      ) VALUES (
        ${walletAddress}, ${market}, ${tokenSymbol}, ${side},
        ${Number(size)}, ${Number(leverage)},
        ${Number(entryPrice)}, ${Number(liquidationPrice) || 0},
        ${Number(collateral) || 0}, ${Number(commission) || 0}, 'open'
      )
      RETURNING *
    `
    return NextResponse.json({ position: rows[0] })
  } catch (error: any) {
    console.error('[positions POST] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to create position' }, { status: 500 })
  }
}
