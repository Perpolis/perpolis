import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || ""
const USDC_MINT = process.env.USDC_MINT || ""
const USDT_MINT = process.env.USDT_MINT || ""
const MIN_AMOUNT = Number(process.env.MIN_DEPOSIT_USD || "0.85")
const DEVNET_CREDIT = Number(process.env.DEVNET_CREDIT_USD || "1000")

const RPC_ENDPOINTS = [
  process.env.SOLANA_RPC_PRIMARY,
  process.env.SOLANA_RPC_FALLBACK || 'https://api.mainnet-beta.solana.com',
].filter(Boolean) as string[]

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getTransaction(signature: string, retries = 8, delayMs = 3000) {
  for (let attempt = 0; attempt < retries; attempt++) {
    for (const endpoint of RPC_ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            jsonrpc: '2.0', id: 1,
            method: 'getTransaction',
            params: [signature, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }]
          })
        })
        const data = await res.json()
        if (data.result) return data.result
      } catch {}
    }
    if (attempt < retries - 1) await sleep(delayMs)
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wallet, signature } = body
    if (!wallet || !signature) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Deposit already credited?
    const existing = await sql`
      SELECT id FROM demo_deposits WHERE tx_signature = ${signature}
    `
    if (existing.length) {
      return NextResponse.json({ error: 'Transaction already used' }, { status: 400 })
    }

    // Verify tx on-chain
    const tx = await getTransaction(signature)
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found. Please wait for confirmation.' }, { status: 404 })
    }

    // Sum USDC/USDT received into treasury
    const preTokenBalances = tx.meta?.preTokenBalances || []
    const postTokenBalances = tx.meta?.postTokenBalances || []

    let received = 0
    for (const post of postTokenBalances) {
      if (![USDC_MINT, USDT_MINT].includes(post.mint)) continue
      if (post.owner !== PAYMENT_ADDRESS) continue
      const pre = preTokenBalances.find((p: any) => p.accountIndex === post.accountIndex)
      const preAmt = Number(pre?.uiTokenAmount?.uiAmount || 0)
      const postAmt = Number(post?.uiTokenAmount?.uiAmount || 0)
      const delta = postAmt - preAmt
      if (delta > 0) received += delta
    }

    if (received < MIN_AMOUNT) {
      return NextResponse.json({
        error: `Payment too small: received $${received.toFixed(2)}, minimum $${MIN_AMOUNT}`
      }, { status: 400 })
    }

    // Record deposit to prevent double credit
    await sql`
      INSERT INTO demo_deposits (tx_signature, wallet_address, amount_credited)
      VALUES (${signature}, ${wallet}, ${received})
    `

    // Credit demo balance atomically
    const credited = await sql`
      INSERT INTO demo_balances (wallet_address, balance, updated_at)
      VALUES (${wallet}, ${DEVNET_CREDIT}::numeric, NOW())
      ON CONFLICT (wallet_address)
      DO UPDATE SET balance = demo_balances.balance + ${DEVNET_CREDIT}::numeric,
                    updated_at = NOW()
      RETURNING balance
    `

    return NextResponse.json({
      success: true,
      credited: DEVNET_CREDIT,
      balance: Number(credited[0]?.balance) || DEVNET_CREDIT,
    })
  } catch (error: any) {
    console.error('[demo-deposit] error:', error?.message)
    return NextResponse.json({ error: error?.message }, { status: 500 })
  }
}
