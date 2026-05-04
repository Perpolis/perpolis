import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST - Close a position and return remaining balance to demo balance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionId, walletAddress, closePrice, pnlRealized, returnAmount } = body

    if (!positionId || !walletAddress || closePrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const actualReturn = Math.max(0, Number(returnAmount) || 0)

    await sql`
      UPDATE positions
      SET status = 'closed',
          close_price = ${Number(closePrice)},
          pnl_realized = ${Number(pnlRealized) || 0},
          closed_at = NOW()
      WHERE id = ${positionId} AND wallet_address = ${walletAddress}
    `

    if (actualReturn > 0) {
      await sql`
        INSERT INTO demo_balances (wallet_address, balance, updated_at)
        VALUES (${walletAddress}, ${actualReturn}::numeric, NOW())
        ON CONFLICT (wallet_address)
        DO UPDATE SET balance = demo_balances.balance + ${actualReturn}::numeric,
                      updated_at = NOW()
      `
    }

    return NextResponse.json({ success: true, returnAmount: actualReturn })
  } catch (error: any) {
    console.error('[positions/close] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to close position' }, { status: 500 })
  }
}
