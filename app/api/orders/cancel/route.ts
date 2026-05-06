import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST - Cancel an order and return collateral + commission to demo balance
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, walletAddress } = body

    if (!orderId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const rows = await sql`
      SELECT collateral, commission FROM orders
      WHERE id = ${orderId} AND wallet_address = ${walletAddress}
    `
    const order = rows[0]

    await sql`
      DELETE FROM orders
      WHERE id = ${orderId} AND wallet_address = ${walletAddress}
    `

    if (order) {
      const returnAmount = (Number(order.collateral) || 0) + (Number(order.commission) || 0)
      if (returnAmount > 0) {
        await sql`
          INSERT INTO demo_balances (wallet_address, balance, updated_at)
          VALUES (${walletAddress}, ${returnAmount}::numeric, NOW())
          ON CONFLICT (wallet_address)
          DO UPDATE SET balance = demo_balances.balance + ${returnAmount}::numeric,
                        updated_at = NOW()
        `
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[orders/cancel] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to cancel' }, { status: 500 })
  }
}
