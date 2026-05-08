import { NextRequest, NextResponse } from "next/server"

const PAYMENT_ADDRESS = process.env.PAYMENT_ADDRESS || ""
const PAYMENT_AMOUNT_SOL = 0.3
const LAMPORTS_PER_SOL = 1000000000

// Use multiple RPC endpoints for reliability
const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-mainnet.g.alchemy.com/v2/demo',
]

async function fetchWithFallback(body: object) {
  for (const endpoint of RPC_ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (data.result) return data
    } catch (e) {
      console.error(`RPC ${endpoint} failed:`, e)
    }
  }
  return null
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const amount = parseFloat(searchParams.get('amount') || '0.3')

  if (address !== PAYMENT_ADDRESS) {
    return NextResponse.json({ verified: false, error: 'Invalid payment address' })
  }

  try {
    // Query Solana RPC for recent transactions to our address
    const data = await fetchWithFallback({
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        PAYMENT_ADDRESS,
        { limit: 50 }
      ]
    })
    
    if (!data || !data.result || data.result.length === 0) {
      return NextResponse.json({ 
        verified: false, 
        error: 'No recent transactions found. Please wait a moment for the transaction to confirm and try again.' 
      })
    }

    // Check each recent transaction - 2 minutes window
    const thirtyMinutesAgo = Date.now() - 2 * 60 * 1000
    
    for (const sig of data.result) {
      // Check transactions from the last 30 minutes
      const txTime = sig.blockTime ? sig.blockTime * 1000 : Date.now()
      
      if (txTime < thirtyMinutesAgo) continue
      
      // Get transaction details
      const txData = await fetchWithFallback({
        jsonrpc: '2.0',
        id: 1,
        method: 'getTransaction',
        params: [
          sig.signature,
          { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
        ]
      })
      
      if (!txData || !txData.result) continue

      // Check if this is a transfer to our address with the correct amount
      const meta = txData.result.meta
      const preBalances = meta?.preBalances || []
      const postBalances = meta?.postBalances || []
      const accountKeys = txData.result.transaction?.message?.accountKeys || []

      // Find our address index
      const ourIndex = accountKeys.findIndex((key: any) => 
        (typeof key === 'string' ? key : key.pubkey) === PAYMENT_ADDRESS
      )

      if (ourIndex === -1) continue

      // Calculate how much SOL we received
      const received = (postBalances[ourIndex] - preBalances[ourIndex]) / LAMPORTS_PER_SOL

      // Check if we received at least 0.25 SOL (allow tolerance for fees/partial amounts)
      if (received >= 0.25) {
        return NextResponse.json({ 
          verified: true, 
          signature: sig.signature,
          amount: received
        })
      }
    }

    return NextResponse.json({ 
      verified: false, 
      error: 'Payment not found. Please wait 1-2 minutes for the transaction to confirm, then try again.' 
    })

  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ 
      verified: false, 
      error: 'Verification service temporarily unavailable. Please try again in a moment.' 
    })
  }
}
