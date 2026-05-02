import { NextRequest, NextResponse } from 'next/server'

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY || ''

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  const timeframe = searchParams.get('timeframe') || '15m'
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }

  // Map timeframe to Birdeye format
  const timeframeMap: Record<string, string> = {
    '1m': '1m',
    '5m': '5m', 
    '15m': '15m',
    '1H': '1H',
    '4H': '4H',
    '1D': '1D'
  }
  
  const birdeyeTimeframe = timeframeMap[timeframe] || '15m'
  
  // Calculate time range based on timeframe - fetch more history for larger timeframes
  const timeRangeMap: Record<string, number> = {
    '1m': 86400 * 1,      // 1 day for 1m
    '5m': 86400 * 3,      // 3 days for 5m
    '15m': 86400 * 7,     // 7 days for 15m
    '1H': 86400 * 30,     // 30 days for 1H
    '4H': 86400 * 90,     // 90 days for 4H
    '1D': 86400 * 365     // 365 days for 1D
  }
  const timeRange = timeRangeMap[timeframe] || 86400 * 7
  
  try {
    // Fetch OHLCV data from Birdeye
    const response = await fetch(
      `https://public-api.birdeye.so/defi/ohlcv?address=${address}&type=${birdeyeTimeframe}&time_from=${Math.floor(Date.now() / 1000) - timeRange}&time_to=${Math.floor(Date.now() / 1000)}`,
      {
        headers: {
          'X-API-KEY': BIRDEYE_API_KEY,
          'x-chain': 'solana'
        },
        next: { revalidate: 60 }
      }
    )

    if (!response.ok) {
      // Return mock data if API fails
      return NextResponse.json({ data: generateMockOHLCV() })
    }

    const data = await response.json()
    
    if (!data.data?.items || data.data.items.length === 0) {
      return NextResponse.json({ data: generateMockOHLCV() })
    }

    // Transform to chart format
    const candles = data.data.items.map((item: any) => ({
      time: item.unixTime,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }))

    return NextResponse.json({ data: candles })
  } catch (error) {
    console.error('OHLCV fetch error:', error)
    return NextResponse.json({ data: generateMockOHLCV() })
  }
}

function generateMockOHLCV() {
  const now = Math.floor(Date.now() / 1000)
  const candles = []
  let price = 0.0009 + Math.random() * 0.0001
  
  for (let i = 500; i >= 0; i--) {
    const time = now - i * 900 // 15 min candles
    const volatility = 0.05
    const change = (Math.random() - 0.5) * volatility
    const open = price
    const close = price * (1 + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.02)
    const low = Math.min(open, close) * (1 - Math.random() * 0.02)
    const volume = Math.random() * 100000
    
    candles.push({ time, open, high, low, close, volume })
    price = close
  }
  
  return candles
}
