import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// GET - List orders for a wallet
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')
  const status = searchParams.get('status') || 'pending'

  if (!wallet) {
    return NextResponse.json({ error: 'Wallet address required' }, { status: 400 })
  }

  try {
    const rows = await sql`
      SELECT * FROM orders
      WHERE wallet_address = ${wallet} AND status = ${status}
      ORDER BY created_at DESC
    `
    return NextResponse.json({ orders: rows })
  } catch (e: any) {
    console.error('[orders GET] error:', e?.message)
    return NextResponse.json({ orders: [], error: e?.message }, { status: 200 })
  }
}

// POST - Create a new limit order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { walletAddress, market, tokenSymbol, side, size, leverage, limitPrice, collateral, commission } = body

    if (!walletAddress || !market || !tokenSymbol || !side || !size || !leverage || !limitPrice || !collateral) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rows = await sql`
      INSERT INTO orders (
        wallet_address, market, token_symbol, side, size, leverage,
        limit_price, collateral, commission, status
      ) VALUES (
        ${walletAddress}, ${market}, ${tokenSymbol}, ${side},
        ${Number(size)}, ${Number(leverage)},
        ${Number(limitPrice)}, ${Number(collateral)}, ${Number(commission) || 0}, 'pending'
      )
      RETURNING *
    `
    return NextResponse.json({ order: rows[0] })
  } catch (error: any) {
    console.error('[orders POST] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to create order' }, { status: 500 })
  }
}
