import { NextResponse } from "next/server"

const BIRDEYE_API_KEY = process.env.BIRDEYE_API_KEY

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get("q")?.toLowerCase() || ""

  if (!query || query.length < 2) {
    return NextResponse.json({ tokens: [] })
  }

  try {
    // Check if query looks like a Solana address (base58, 32-44 chars)
    const isAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(query)

    if (isAddress) {
      // Search by address using Birdeye
      if (BIRDEYE_API_KEY) {
        const response = await fetch(
          `https://public-api.birdeye.so/defi/token_overview?address=${query}`,
          {
            headers: {
              "X-API-KEY": BIRDEYE_API_KEY,
              "x-chain": "solana",
            },
          }
        )

        if (response.ok) {
          const data = await response.json()
          if (data.success && data.data) {
            return NextResponse.json({
              tokens: [
                {
                  address: query,
                  symbol: data.data.symbol || "UNKNOWN",
                  name: data.data.name || "Unknown Token",
                  logo: data.data.logoURI || `https://ui-avatars.com/api/?name=${data.data.symbol || "?"}&background=1a1a1a&color=fff`,
                },
              ],
            })
          }
        }
      }

      // Fallback to DexScreener
      const dexResponse = await fetch(
        `https://api.dexscreener.com/latest/dex/tokens/${query}`
      )

      if (dexResponse.ok) {
        const dexData = await dexResponse.json()
        if (dexData.pairs && dexData.pairs.length > 0) {
          const token = dexData.pairs[0].baseToken
          return NextResponse.json({
            tokens: [
              {
                address: query,
                symbol: token.symbol || "UNKNOWN",
                name: token.name || "Unknown Token",
                logo: `https://dd.dexscreener.com/ds-data/tokens/solana/${query}.png`,
              },
            ],
          })
        }
      }

      return NextResponse.json({ tokens: [] })
    }

    // Search by name/symbol using Birdeye token list
    if (BIRDEYE_API_KEY) {
      const response = await fetch(
        `https://public-api.birdeye.so/defi/tokenlist?sort_by=v24hUSD&sort_type=desc&offset=0&limit=100`,
        {
          headers: {
            "X-API-KEY": BIRDEYE_API_KEY,
            "x-chain": "solana",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data?.tokens) {
          const filtered = data.data.tokens
            .filter(
              (t: any) =>
                t.symbol?.toLowerCase().includes(query) ||
                t.name?.toLowerCase().includes(query)
            )
            .slice(0, 10)
            .map((t: any) => ({
              address: t.address,
              symbol: t.symbol,
              name: t.name,
              logo: t.logoURI || `https://ui-avatars.com/api/?name=${t.symbol}&background=1a1a1a&color=fff`,
            }))

          return NextResponse.json({ tokens: filtered })
        }
      }
    }

    // Fallback to DexScreener search
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`
    )

    if (dexResponse.ok) {
      const dexData = await dexResponse.json()
      if (dexData.pairs) {
        const uniqueTokens = new Map()
        
        dexData.pairs
          .filter((p: any) => p.chainId === "solana")
          .forEach((p: any) => {
            const token = p.baseToken
            if (
              !uniqueTokens.has(token.address) &&
              (token.symbol?.toLowerCase().includes(query) ||
                token.name?.toLowerCase().includes(query))
            ) {
              uniqueTokens.set(token.address, {
                address: token.address,
                symbol: token.symbol,
                name: token.name,
                logo: `https://dd.dexscreener.com/ds-data/tokens/solana/${token.address}.png`,
              })
            }
          })

        return NextResponse.json({
          tokens: Array.from(uniqueTokens.values()).slice(0, 10),
        })
      }
    }

    return NextResponse.json({ tokens: [] })
  } catch (error) {
    console.error("Token search error:", error)
    return NextResponse.json({ tokens: [] })
  }
}
