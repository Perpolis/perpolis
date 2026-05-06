import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { positionId, walletAddress, type, value } = body

    if (!positionId || !walletAddress || !type || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const numericValue = Number(value)
    if (!Number.isFinite(numericValue)) {
      return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
    }

    const rows = type === 'tp'
      ? await sql`
          UPDATE positions SET take_profit = ${numericValue}
          WHERE id = ${positionId} AND wallet_address = ${walletAddress}
          RETURNING *
        `
      : await sql`
          UPDATE positions SET stop_loss = ${numericValue}
          WHERE id = ${positionId} AND wallet_address = ${walletAddress}
          RETURNING *
        `

    if (!rows.length) {
      return NextResponse.json({ error: 'Position not found' }, { status: 404 })
    }
    return NextResponse.json({ position: rows[0] })
  } catch (error: any) {
    console.error('[positions/update-tpsl] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 500 })
  }
}
