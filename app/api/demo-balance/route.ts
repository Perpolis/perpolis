import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

const WELCOME_BONUS = 50

// GET - Get demo balance for wallet. First-time wallets get a welcome credit.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const wallet = searchParams.get('wallet')
  if (!wallet) return NextResponse.json({ error: 'Wallet required' }, { status: 400 })

  try {
    const rows = await sql`
      SELECT balance FROM demo_balances WHERE wallet_address = ${wallet}
    `

    if (rows.length === 0) {
      // First-time wallet — seed welcome bonus.
      const inserted = await sql`
        INSERT INTO demo_balances (wallet_address, balance, updated_at)
        VALUES (${wallet}, ${WELCOME_BONUS}::numeric, NOW())
        ON CONFLICT (wallet_address) DO NOTHING
        RETURNING balance
      `
      return NextResponse.json({
        balance: Number(inserted[0]?.balance) || WELCOME_BONUS,
        welcome: true,
      })
    }

    return NextResponse.json({ balance: Number(rows[0].balance) || 0 })
  } catch (e: any) {
    console.error('[demo-balance GET] error:', e?.message)
    // Fail soft so the UI never shows a 500 — assume welcome bonus.
    return NextResponse.json({ balance: WELCOME_BONUS, welcome: true, fallback: true })
  }
}

// POST - Apply a delta to balance (positive = credit, negative = debit, floor at 0)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, delta } = body
    if (!wallet || delta === undefined) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }
    const numericDelta = Number(delta)
    if (!Number.isFinite(numericDelta)) {
      return NextResponse.json({ error: 'Invalid delta' }, { status: 400 })
    }

    // Single atomic upsert: if no row, seed with welcome+delta (floored to 0);
    // if row exists, update balance to MAX(0, balance + delta).
    // Cast bound numerics to NUMERIC explicitly so Postgres doesn't infer INTEGER.
    const seedAmount = WELCOME_BONUS + numericDelta
    const rows = await sql`
      INSERT INTO demo_balances (wallet_address, balance, updated_at)
      VALUES (${wallet}, GREATEST(0::numeric, ${seedAmount}::numeric), NOW())
      ON CONFLICT (wallet_address)
      DO UPDATE SET
        balance = GREATEST(0::numeric, demo_balances.balance + ${numericDelta}::numeric),
        updated_at = NOW()
      RETURNING balance
    `

    return NextResponse.json({ balance: Number(rows[0]?.balance) || 0 })
  } catch (error: any) {
    console.error('[demo-balance POST] error:', error?.message)
    return NextResponse.json({ error: error?.message || 'Failed to update balance' }, { status: 500 })
  }
}
