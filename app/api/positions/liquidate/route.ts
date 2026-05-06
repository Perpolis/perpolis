import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST - Liquidate a position (P&L hit -collateral)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionId, walletAddress, closePrice } = body

    if (!positionId || !walletAddress || !closePrice) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rows = await sql`
      SELECT * FROM positions
      WHERE id = ${positionId}
        AND wallet_address = ${walletAddress}
        AND status = 'open'
    `

    if (!rows.length) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }

    const position = rows[0]
    const pnlRealized = -Number(position.collateral)

    await sql`
      UPDATE positions
      SET status = 'liquidated',
          close_price = ${Number(closePrice)},
          pnl_realized = ${pnlRealized},
          closed_at = NOW()
      WHERE id = ${positionId} AND wallet_address = ${walletAddress}
    `

    // Nothing returned to balance on liquidation
    return NextResponse.json({ success: true, pnlRealized })
  } catch (error: any) {
    console.error('[positions/liquidate] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to liquidate' }, { status: 500 })
  }
}
