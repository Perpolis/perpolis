import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get('address')
  
  if (!address) {
    return NextResponse.json({ error: 'Address required' }, { status: 400 })
  }
  
  try {
    // Try to fetch from Birdeye API
    const apiKey = process.env.BIRDEYE_API_KEY
    
    if (apiKey) {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/price?address=${address}`,
        {
          headers: {
            'X-API-KEY': apiKey,
            'accept': 'application/json'
          },
          cache: 'no-store'
        }
      )
      
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json({ 
          price: data.data?.value || 0,
          priceChange24h: data.data?.priceChange24h || 0
        })
      }
    }
    
    // Fallback: return 0 if we can't fetch the price
    return NextResponse.json({ price: 0, priceChange24h: 0 })
  } catch (error) {
    console.error('Error fetching token price:', error)
    return NextResponse.json({ price: 0, priceChange24h: 0 })
  }
}
