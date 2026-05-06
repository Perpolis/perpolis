import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

// POST - Trigger an order (convert to position)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, walletAddress } = body

    if (!orderId || !walletAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const orderRows = await sql`
      SELECT * FROM orders
      WHERE id = ${orderId}
        AND wallet_address = ${walletAddress}
        AND status = 'pending'
    `

    if (!orderRows.length) {
      return NextResponse.json({ error: 'Order not found or already triggered' }, { status: 404 })
    }

    const order = orderRows[0]
    const limitPrice = Number(order.limit_price)
    const leverage = Number(order.leverage)
    const liqPrice = order.side === 'long'
      ? limitPrice * (1 - 0.9 / leverage)
      : limitPrice * (1 + 0.9 / leverage)

    const posRows = await sql`
      INSERT INTO positions (
        wallet_address, market, token_symbol, side, size, leverage,
        entry_price, liquidation_price, collateral, commission, status
      ) VALUES (
        ${order.wallet_address}, ${order.market}, ${order.token_symbol},
        ${order.side}, ${order.size}, ${order.leverage},
        ${limitPrice}, ${liqPrice}, ${order.collateral},
        ${Number(order.commission) || 0}, 'open'
      )
      RETURNING *
    `

    await sql`DELETE FROM orders WHERE id = ${orderId}`

    return NextResponse.json({ position: posRows[0] })
  } catch (error: any) {
    console.error('[orders/trigger] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to trigger' }, { status: 500 })
  }
}
