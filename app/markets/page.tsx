"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Star } from "lucide-react"
import { useState } from "react"

const markets = [
  { symbol: "BTCUSD", price: "112,239.50", change: "+5.2%", volume: "$2.1B", funding: "+0.01%", favorite: false },
  { symbol: "ETHUSD", price: "3,456.80", change: "+3.8%", volume: "$850M", funding: "+0.008%", favorite: false },
  { symbol: "SOLUSD", price: "245.60", change: "+12.4%", volume: "$420M", funding: "+0.02%", favorite: false },
  { symbol: "BNBUSD", price: "678.90", change: "-2.1%", volume: "$180M", funding: "-0.005%", favorite: false },
  { symbol: "XRPUSD", price: "2.34", change: "+8.6%", volume: "$320M", funding: "+0.015%", favorite: false },
  { symbol: "ADAUSD", price: "1.12", change: "+4.2%", volume: "$95M", funding: "+0.01%", favorite: false },
  { symbol: "AVAXUSD", price: "42.80", change: "-1.5%", volume: "$65M", funding: "-0.002%", favorite: false },
  { symbol: "DOTUSD", price: "8.90", change: "+6.7%", volume: "$55M", funding: "+0.012%", favorite: false },
]

export default function MarketsPage() {
  const [filter, setFilter] = useState<"all" | "favorites">("all")
  const [marketList, setMarketList] = useState(markets)

  const toggleFavorite = (symbol: string) => {
    setMarketList(marketList.map(m => 
      m.symbol === symbol ? { ...m, favorite: !m.favorite } : m
    ))
  }

  const filteredMarkets = filter === "favorites" 
    ? marketList.filter(m => m.favorite)
    : marketList

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-gray-400 mb-8">Browse all available perpetual markets</p>
          
          {/* Filter */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all" 
                  ? "bg-[#A3FF12] text-black" 
                  : "bg-[#1a1a1a] text-gray-400 hover:text-white"
              }`}
            >
              All Markets
            </button>
            <button
              onClick={() => setFilter("favorites")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "favorites" 
                  ? "bg-[#A3FF12] text-black" 
                  : "bg-[#1a1a1a] text-gray-400 hover:text-white"
              }`}
            >
              Favorites
            </button>
          </div>
          
          {/* Markets Table */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#2a2a2a]">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-white">Market</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">Price</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">24h Change</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">24h Volume</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-white">Funding</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-white">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMarkets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No favorites yet. Click the star icon to add markets to your favorites.
                    </td>
                  </tr>
                ) : (
                  filteredMarkets.map((market) => (
                    <tr 
                      key={market.symbol}
                      className="border-t border-[#2a2a2a] hover:bg-[#2a2a2a]/30 cursor-pointer"
                      onClick={() => window.location.href = `/trade/${market.symbol}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleFavorite(market.symbol)
                            }}
                            className="text-gray-500 hover:text-[#A3FF12] transition-colors"
                          >
                            <Star className={`w-4 h-4 ${market.favorite ? "fill-[#A3FF12] text-[#A3FF12]" : ""}`} />
                          </button>
                          <span className="text-white font-medium">{market.symbol}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-mono">{market.price}</td>
                      <td className={`px-6 py-4 text-right font-medium ${
                        market.change.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}>
                        {market.change}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400">{market.volume}</td>
                      <td className={`px-6 py-4 text-right text-sm ${
                        market.funding.startsWith("+") ? "text-green-500" : "text-red-500"
                      }`}>
                        {market.funding}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <a
                          href={`/trade/${market.symbol}`}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-block px-4 py-1.5 bg-[#A3FF12] text-black text-sm font-medium rounded-lg hover:bg-[#0a0a0a] transition-colors"
                        >
                          Trade
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}
