import { NextResponse } from "next/server"

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY

// Popular meme + DeFi tokens on Solana
const MEME_TOKENS = [
  // Existing
  { address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK" },
  { address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", symbol: "WIF" },
  { address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", symbol: "MEW" },
  { address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", symbol: "POPCAT" },
  { address: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump", symbol: "GOAT" },
  { address: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump", symbol: "CHILLGUY" },
  { address: "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY", symbol: "MOODENG" },
  { address: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC", symbol: "AI16Z" },
  { address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", symbol: "TRUMP" },
  { address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", symbol: "BOME" },
  { address: "3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN", symbol: "MOTHER" },
  { address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP" },
  // Added: meme — 2024-2026 popular
  { address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", symbol: "PNUT" },
  { address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", symbol: "FARTCOIN" },
  { address: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P", symbol: "PEPE" },
  { address: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", symbol: "SLERF" },
  { address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", symbol: "WEN" },
  { address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", symbol: "MYRO" },
  { address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9", symbol: "GIGA" },
  { address: "CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump", symbol: "NEIRO" },
  { address: "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn", symbol: "ZEREBRO" },
  { address: "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump", symbol: "ACT" },
  { address: "6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx", symbol: "RETARDIO" },
  { address: "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC", symbol: "PONKE" },
  { address: "DtR4D9FtVoTX2569gaL837ZgrB6wNjj6tkmnX9Rdk9B2", symbol: "AURA" },
  { address: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp", symbol: "MICHI" },
  // Added: DeFi / utility — high-volume Solana tokens
  { address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", symbol: "JTO" },
  { address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", symbol: "PYTH" },
  { address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", symbol: "RAY" },
  { address: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4", symbol: "JLP" },
  { address: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm", symbol: "INF" },
  { address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", symbol: "ORCA" },
  { address: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", symbol: "KMNO" },
  { address: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7", symbol: "DRIFT" },
  { address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", symbol: "RENDER" },
  { address: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", symbol: "HNT" },
  { address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", symbol: "SHDW" },
  { address: "Frpt6ArMnaaPNXNYpQTgwHqRsSWnYWGNVmrPtnVnD9pX", symbol: "TNSR" },
  { address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", symbol: "MNGO" },
]

export async function GET() {
  try {
    // Fetch token data from Birdeye
    const tokenPromises = MEME_TOKENS.map(async (token) => {
      try {
        const response = await fetch(
          `https://public-api.birdeye.so/defi/token_overview?address=${token.address}`,
          {
            headers: {
              "X-API-KEY": BIRDEYE_API_KEY || "",
              "x-chain": "solana",
            },
            next: { revalidate: 60 }, // Cache for 60 seconds
          }
        )

        if (!response.ok) {
          console.log(`Birdeye API error for ${token.symbol}:`, response.status)
          return null
        }

        const data = await response.json()
        const tokenData = data.data

        if (!tokenData) return null

        return {
          address: token.address,
          symbol: tokenData.symbol || token.symbol,
          name: tokenData.name || token.symbol,
          logoURI: tokenData.logoURI || `https://img.birdeye.so/token/${token.address}?chain=solana`,
          price: tokenData.price || 0,
          priceChange24h: tokenData.priceChange24hPercent || 0,
          volume24h: tokenData.v24hUSD || 0,
          liquidity: tokenData.liquidity || 0,
          mc: tokenData.mc || 0,
        }
      } catch (error) {
        console.log(`Error fetching ${token.symbol}:`, error)
        return null
      }
    })

    const results = await Promise.all(tokenPromises)
    const tokens = results.filter(Boolean)

    // Also fetch SOL price
    let solPrice = 0
    try {
      const solResponse = await fetch(
        "https://public-api.birdeye.so/defi/price?address=So11111111111111111111111111111111111111112",
        {
          headers: {
            "X-API-KEY": BIRDEYE_API_KEY || "",
            "x-chain": "solana",
          },
          next: { revalidate: 30 },
        }
      )
      if (solResponse.ok) {
        const solData = await solResponse.json()
        solPrice = solData.data?.value || 0
      }
    } catch (e) {
      console.log("Error fetching SOL price:", e)
    }

    return NextResponse.json({
      tokens,
      solPrice,
      totalMarkets: tokens.length,
    })
  } catch (error) {
    console.error("API route error:", error)
    return NextResponse.json({ tokens: [], solPrice: 0, totalMarkets: 0 }, { status: 500 })
  }
}
