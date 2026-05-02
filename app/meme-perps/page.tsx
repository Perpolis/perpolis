"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import useSWR from "swr"
import { Header } from "@/components/header"
import { WalletConnect } from "@/components/wallet-connect"
import { Search, Star, ArrowRight, Plus, Loader2 } from "lucide-react"
import "./animations.css"

interface TokenData {
  address: string
  symbol: string
  name: string
  logoURI: string
  price: number
  priceChange24h: number
  volume24h: number
  liquidity: number
  mc: number
  isUserCreated?: boolean
  creatorWallet?: string
  maxLeverage?: number
}

interface UserMarket {
  id: string
  creator_wallet: string
  token_address: string
  token_symbol: string
  token_name: string
  token_logo: string | null
  collateral: string
  max_leverage: number
  trading_fee: number
  created_at: string
  current_price: number
  price_change_24h: number
  volume_24h: number
  open_interest: number
  funding_rate: number
}

interface ApiResponse {
  tokens: TokenData[]
  solPrice: number
  totalMarkets: number
}

interface UserMarketsResponse {
  markets: UserMarket[]
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Fallback static data in case API fails
const fallbackTokens: TokenData[] = [
  {
    address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    symbol: "BONK",
    name: "Bonk",
    logoURI: "https://img.birdeye.so/token/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263?chain=solana",
    price: 0.0000234,
    priceChange24h: 5.23,
    volume24h: 45000000,
    liquidity: 12000000,
    mc: 1500000000,
  },
  {
    address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
    symbol: "WIF",
    name: "dogwifhat",
    logoURI: "https://img.birdeye.so/token/EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm?chain=solana",
    price: 1.85,
    priceChange24h: -3.45,
    volume24h: 89000000,
    liquidity: 45000000,
    mc: 1800000000,
  },
  {
    address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
    symbol: "MEW",
    name: "cat in a dogs world",
    logoURI: "https://img.birdeye.so/token/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5?chain=solana",
    price: 0.0089,
    priceChange24h: 12.34,
    volume24h: 23000000,
    liquidity: 8000000,
    mc: 890000000,
  },
  {
    address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
    symbol: "POPCAT",
    name: "Popcat",
    logoURI: "https://img.birdeye.so/token/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr?chain=solana",
    price: 0.78,
    priceChange24h: -7.89,
    volume24h: 34000000,
    liquidity: 15000000,
    mc: 780000000,
  },
  {
    address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN",
    symbol: "TRUMP",
    name: "Official Trump",
    logoURI: "https://img.birdeye.so/token/6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN?chain=solana",
    price: 12.45,
    priceChange24h: -4.56,
    volume24h: 120000000,
    liquidity: 60000000,
    mc: 2500000000,
  },
  {
    address: "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY",
    symbol: "MOODENG",
    name: "Moo Deng",
    logoURI: "https://img.birdeye.so/token/ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY?chain=solana",
    price: 0.145,
    priceChange24h: 23.45,
    volume24h: 18000000,
    liquidity: 5000000,
    mc: 145000000,
  },
  {
    address: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC",
    symbol: "AI16Z",
    name: "ai16z",
    logoURI: "https://img.birdeye.so/token/HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC?chain=solana",
    price: 0.89,
    priceChange24h: 15.67,
    volume24h: 67000000,
    liquidity: 25000000,
    mc: 890000000,
  },
  {
    address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82",
    symbol: "BOME",
    name: "BOOK OF MEME",
    logoURI: "https://img.birdeye.so/token/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82?chain=solana",
    price: 0.0067,
    priceChange24h: -2.34,
    volume24h: 28000000,
    liquidity: 12000000,
    mc: 670000000,
  },
  // Added — popular memes
  { address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", symbol: "PNUT", name: "Peanut the Squirrel", logoURI: "https://img.birdeye.so/token/2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump?chain=solana", price: 0.92, priceChange24h: 4.21, volume24h: 56000000, liquidity: 18000000, mc: 920000000 },
  { address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", symbol: "FARTCOIN", name: "Fartcoin", logoURI: "https://img.birdeye.so/token/9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump?chain=solana", price: 1.34, priceChange24h: 8.92, volume24h: 78000000, liquidity: 22000000, mc: 1340000000 },
  { address: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P", symbol: "PEPE", name: "Pepe (Solana)", logoURI: "https://img.birdeye.so/token/FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P?chain=solana", price: 0.0000089, priceChange24h: -1.23, volume24h: 12000000, liquidity: 4500000, mc: 89000000 },
  { address: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", symbol: "SLERF", name: "SLERF", logoURI: "https://img.birdeye.so/token/7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3?chain=solana", price: 0.21, priceChange24h: -5.67, volume24h: 8500000, liquidity: 3200000, mc: 210000000 },
  { address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", symbol: "WEN", name: "Wen", logoURI: "https://img.birdeye.so/token/WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk?chain=solana", price: 0.000125, priceChange24h: 2.34, volume24h: 6500000, liquidity: 2100000, mc: 125000000 },
  { address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", symbol: "MYRO", name: "Myro", logoURI: "https://img.birdeye.so/token/HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4?chain=solana", price: 0.058, priceChange24h: -3.21, volume24h: 4200000, liquidity: 1800000, mc: 58000000 },
  { address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9", symbol: "GIGA", name: "Gigachad", logoURI: "https://img.birdeye.so/token/63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9?chain=solana", price: 0.038, priceChange24h: 11.45, volume24h: 19000000, liquidity: 6800000, mc: 380000000 },
  { address: "CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump", symbol: "NEIRO", name: "Neiro", logoURI: "https://img.birdeye.so/token/CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump?chain=solana", price: 0.0021, priceChange24h: 6.78, volume24h: 3400000, liquidity: 1400000, mc: 21000000 },
  { address: "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn", symbol: "ZEREBRO", name: "Zerebro", logoURI: "https://img.birdeye.so/token/8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn?chain=solana", price: 0.34, priceChange24h: -7.89, volume24h: 11000000, liquidity: 4200000, mc: 340000000 },
  { address: "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump", symbol: "ACT", name: "Act I: AI Prophecy", logoURI: "https://img.birdeye.so/token/GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump?chain=solana", price: 0.089, priceChange24h: 14.23, volume24h: 8900000, liquidity: 3100000, mc: 89000000 },
  { address: "6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx", symbol: "RETARDIO", name: "RETARDIO", logoURI: "https://img.birdeye.so/token/6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx?chain=solana", price: 0.067, priceChange24h: -4.56, volume24h: 3800000, liquidity: 1500000, mc: 67000000 },
  { address: "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC", symbol: "PONKE", name: "Ponke", logoURI: "https://img.birdeye.so/token/5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC?chain=solana", price: 0.21, priceChange24h: 3.12, volume24h: 6700000, liquidity: 2400000, mc: 210000000 },
  { address: "DtR4D9FtVoTX2569gaL837ZgrB6wNjj6tkmnX9Rdk9B2", symbol: "AURA", name: "Aura", logoURI: "https://img.birdeye.so/token/DtR4D9FtVoTX2569gaL837ZgrB6wNjj6tkmnX9Rdk9B2?chain=solana", price: 0.012, priceChange24h: 19.45, volume24h: 4500000, liquidity: 1700000, mc: 12000000 },
  { address: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp", symbol: "MICHI", name: "Michi", logoURI: "https://img.birdeye.so/token/5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp?chain=solana", price: 0.18, priceChange24h: -2.34, volume24h: 5800000, liquidity: 2200000, mc: 180000000 },
  // Added — DeFi / utility
  { address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", symbol: "JTO", name: "Jito", logoURI: "https://img.birdeye.so/token/jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL?chain=solana", price: 3.45, priceChange24h: 2.12, volume24h: 45000000, liquidity: 18000000, mc: 1200000000 },
  { address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", symbol: "PYTH", name: "Pyth Network", logoURI: "https://img.birdeye.so/token/HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3?chain=solana", price: 0.42, priceChange24h: 1.78, volume24h: 32000000, liquidity: 14000000, mc: 980000000 },
  { address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", symbol: "RAY", name: "Raydium", logoURI: "https://img.birdeye.so/token/4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R?chain=solana", price: 3.21, priceChange24h: 4.56, volume24h: 28000000, liquidity: 12000000, mc: 890000000 },
  { address: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4", symbol: "JLP", name: "Jupiter LP", logoURI: "https://img.birdeye.so/token/27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4?chain=solana", price: 4.89, priceChange24h: 0.23, volume24h: 15000000, liquidity: 6500000, mc: 1800000000 },
  { address: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm", symbol: "INF", name: "Infinity", logoURI: "https://img.birdeye.so/token/5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm?chain=solana", price: 156.23, priceChange24h: 0.89, volume24h: 8500000, liquidity: 3400000, mc: 450000000 },
  { address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", symbol: "ORCA", name: "Orca", logoURI: "https://img.birdeye.so/token/orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE?chain=solana", price: 2.34, priceChange24h: 3.45, volume24h: 18000000, liquidity: 7800000, mc: 234000000 },
  { address: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", symbol: "KMNO", name: "Kamino", logoURI: "https://img.birdeye.so/token/KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS?chain=solana", price: 0.067, priceChange24h: 5.67, volume24h: 6700000, liquidity: 2800000, mc: 67000000 },
  { address: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7", symbol: "DRIFT", name: "Drift Protocol", logoURI: "https://img.birdeye.so/token/DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7?chain=solana", price: 0.89, priceChange24h: 2.34, volume24h: 12000000, liquidity: 4900000, mc: 89000000 },
  { address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", symbol: "RENDER", name: "Render", logoURI: "https://img.birdeye.so/token/rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof?chain=solana", price: 7.45, priceChange24h: -1.23, volume24h: 34000000, liquidity: 15000000, mc: 3800000000 },
  { address: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", symbol: "HNT", name: "Helium", logoURI: "https://img.birdeye.so/token/hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux?chain=solana", price: 4.21, priceChange24h: -0.89, volume24h: 22000000, liquidity: 9800000, mc: 670000000 },
  { address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", symbol: "SHDW", name: "Shadow Token", logoURI: "https://img.birdeye.so/token/SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y?chain=solana", price: 0.34, priceChange24h: 8.92, volume24h: 3400000, liquidity: 1200000, mc: 34000000 },
  { address: "Frpt6ArMnaaPNXNYpQTgwHqRsSWnYWGNVmrPtnVnD9pX", symbol: "TNSR", name: "Tensor", logoURI: "https://img.birdeye.so/token/Frpt6ArMnaaPNXNYpQTgwHqRsSWnYWGNVmrPtnVnD9pX?chain=solana", price: 0.42, priceChange24h: -2.45, volume24h: 5600000, liquidity: 2300000, mc: 42000000 },
  { address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", symbol: "MNGO", name: "Mango Markets", logoURI: "https://img.birdeye.so/token/MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac?chain=solana", price: 0.018, priceChange24h: 1.23, volume24h: 890000, liquidity: 340000, mc: 18000000 },
]

type TabType = "trending" | "new" | "gainers" | "losers" | "all" | "watchlist" | "positions" | "markets"
type VolumeFilter = "all" | "100k" | "500k" | "1m"
type LeverageFilter = "any" | "5x" | "10x" | "20x"
type PositionsSubTab = "open" | "history"

// Generate pseudo-random but consistent values based on token address
const getTokenMeta = (address: string, token?: TokenData) => {
  const hash = address.split('').reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)
  const leverages = [5, 10, 15, 20, 25, 50, 100]
  // Use user-defined leverage for user-created markets
  const maxLeverage = token?.maxLeverage || leverages[Math.abs(hash) % leverages.length]
  const fundingRate = ((Math.abs(hash) % 20) - 10) / 10000 // -0.001 to 0.001
  const openInterest = Math.abs(hash % 1000000)
  return { maxLeverage, fundingRate, openInterest }
}

export default function MemePerpsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("trending")
  const [volumeFilter, setVolumeFilter] = useState<VolumeFilter>("all")
  const [leverageFilter, setLeverageFilter] = useState<LeverageFilter>("any")
  const [favorites, setFavorites] = useState<string[]>([])
  const [positionsSubTab, setPositionsSubTab] = useState<PositionsSubTab>("open")

  // Read ?tab= from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get("tab") as TabType | null
    if (tab) setActiveTab(tab)
  }, [])
  const [devnetBalance, setDevnetBalance] = useState(0)
  const [openPositions, setOpenPositions] = useState<any[]>([])
  const [historyPositions, setHistoryPositions] = useState<any[]>([])
  const [positionsLoading, setPositionsLoading] = useState(false)

  // Fetch token data from API
  const { data, isLoading, error } = useSWR<ApiResponse>('/api/tokens', fetcher, {
    refreshInterval: 30000, // Refresh every 30 seconds
    fallbackData: { tokens: fallbackTokens, solPrice: 140, totalMarkets: fallbackTokens.length }
  })

  // Fetch user-created markets from Supabase
  const { data: userMarketsData } = useSWR<UserMarketsResponse>('/api/markets', fetcher, {
    refreshInterval: 10000, // Refresh every 10 seconds
  })

  // Get current wallet address for "My Markets" tab
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  
  useEffect(() => {
    // Get wallet address from localStorage (set by wallet-context on connect)
    const addr = localStorage.getItem('walletAddress')
    setWalletAddress(addr)
    
    // Listen for storage changes (when wallet connects/disconnects)
    const handleStorageChange = () => {
      const newAddr = localStorage.getItem('walletAddress')
      setWalletAddress(newAddr)
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    // Also poll for changes (same-tab updates don't trigger storage event)
    const interval = setInterval(() => {
      const currentAddr = localStorage.getItem('walletAddress')
      if (currentAddr !== walletAddress) {
        setWalletAddress(currentAddr)
      }
    }, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [walletAddress])

  // Fetch devnet balance
  useEffect(() => {
    if (!walletAddress) return
    fetch(`/api/demo-balance?wallet=${walletAddress}`)
      .then(r => r.json())
      .then(d => setDevnetBalance(d.balance || 0))
      .catch(() => {})
  }, [walletAddress])

  // Fetch positions when tab is selected
  useEffect(() => {
    if (activeTab !== "positions" || !walletAddress) return
    setPositionsLoading(true)
    Promise.all([
      fetch(`/api/positions?wallet=${walletAddress}&status=open`).then(r => r.json()),
      fetch(`/api/positions?wallet=${walletAddress}&status=closed`).then(r => r.json()),
      fetch(`/api/positions?wallet=${walletAddress}&status=liquidated`).then(r => r.json()),
    ]).then(([open, closed, liq]) => {
      setOpenPositions(open.positions || [])
      const history = [...(closed.positions || []), ...(liq.positions || [])].sort(
        (a: any, b: any) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime()
      )
      setHistoryPositions(history)
    }).catch(() => {}).finally(() => setPositionsLoading(false))
  }, [activeTab, walletAddress])

  // Convert user markets to TokenData format and merge with Birdeye data
  const userMarkets: TokenData[] = (userMarketsData?.markets || []).map(m => ({
    address: m.token_address,
    symbol: m.token_symbol,
    name: m.token_name,
    logoURI: m.token_logo || `https://ui-avatars.com/api/?name=${m.token_symbol}&background=2a2a2a&color=fff`,
    price: Number(m.current_price) || 0,
    priceChange24h: Number(m.price_change_24h) || 0,
    volume24h: Number(m.volume_24h) || 0,
    liquidity: 0,
    mc: 0,
    isUserCreated: true,
    creatorWallet: m.creator_wallet,
    maxLeverage: m.max_leverage
  }))

  // Merge tokens: user-created markets first, then Birdeye data (excluding duplicates)
  const birdeyeTokens = data?.tokens || fallbackTokens
  const existingAddresses = new Set(userMarkets.map(t => t.address.toLowerCase()))
  const filteredBirdeye = birdeyeTokens.filter(t => !existingAddresses.has(t.address.toLowerCase()))
  const tokens = [...userMarkets, ...filteredBirdeye]
  
  const solPrice = data?.solPrice || 140

  const toggleFavorite = (symbol: string) => {
    setFavorites(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol) 
        : [...prev, symbol]
    )
  }

  const filteredTokens = tokens
    .filter(token => {
      const matchesSearch = token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           token.name.toLowerCase().includes(searchQuery.toLowerCase())
      if (!matchesSearch) return false

      const meta = getTokenMeta(token.address, token)

      // Volume filter
      if (volumeFilter === "100k" && token.volume24h < 100000) return false
      if (volumeFilter === "500k" && token.volume24h < 500000) return false
      if (volumeFilter === "1m" && token.volume24h < 1000000) return false

      // Leverage filter
      if (leverageFilter === "5x" && meta.maxLeverage < 5) return false
      if (leverageFilter === "10x" && meta.maxLeverage < 10) return false
      if (leverageFilter === "20x" && meta.maxLeverage < 20) return false

      // Tab filter
      switch (activeTab) {
        case "watchlist":
          return favorites.includes(token.symbol)
        case "gainers":
          return token.priceChange24h > 0
        case "losers":
          return token.priceChange24h < 0
        case "positions":
          return false // No real positions - show empty state
        case "markets":
          // Show only markets created by the connected wallet
          return token.isUserCreated && token.creatorWallet === walletAddress
        case "new":
          return true
        default:
          return true
      }
    })
    .sort((a, b) => {
      if (activeTab === "gainers") return b.priceChange24h - a.priceChange24h
      if (activeTab === "losers") return a.priceChange24h - b.priceChange24h
      return b.volume24h - a.volume24h
    })

  const formatPrice = (raw: number) => {
    const price = Number(raw) || 0
    if (price < 0.000001) return `$${price.toFixed(9)}`
    if (price < 0.0001) return `$${price.toFixed(7)}`
    if (price < 0.01) return `$${price.toFixed(5)}`
    if (price < 1) return `$${price.toFixed(4)}`
    return `$${price.toFixed(2)}`
  }

  const formatVolume = (raw: number) => {
    const volume = Number(raw) || 0
    if (volume >= 1000000000) return `$${(volume / 1000000000).toFixed(2)}B`
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(2)}M`
    if (volume >= 1000) return `$${(volume / 1000).toFixed(2)}K`
    if (volume === 0) return "$0"
    return `$${volume.toFixed(2)}`
  }

  const formatChange = (raw: number) => {
    const change = Number(raw) || 0
    const prefix = change >= 0 ? "+" : ""
    return `${prefix}${change.toFixed(2)}%`
  }

  const formatFunding = (raw: number) => {
    const rate = Number(raw) || 0
    const prefix = rate >= 0 ? "+" : ""
    return `${prefix}${(rate * 100).toFixed(3)}%`
  }

  const totalVolume = tokens.reduce((sum, t) => sum + (Number(t.volume24h) || 0), 0)

  const tabs: { id: TabType; label: string }[] = [
    { id: "trending", label: "Trending" },
    { id: "new", label: "New" },
    { id: "gainers", label: "Gainers" },
    { id: "losers", label: "Losers" },
    { id: "all", label: "All" },
    { id: "watchlist", label: "Watchlist" },
    { id: "positions", label: "My Positions" },
    { id: "markets", label: "My Markets" },
  ]

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <main className="pt-20 pb-12">
        {/* Top Stats Bar */}
        <div className="border-b border-[#1a1a1a] bg-[#0a0a0a] animate-fade-in">
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
            <div className="flex items-center justify-between">
              {/* Left: Stats */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">SOL</span>
                  <span className="text-white font-medium">${solPrice.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Vol</span>
                  <span className="text-white font-medium">{formatVolume(totalVolume)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Markets</span>
                  <span className="text-white font-medium">{tokens.length}</span>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {walletAddress && (
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg">
                    <span className="text-gray-400 text-xs">Devnet</span>
                    <span className="text-white text-sm font-mono font-medium">{devnetBalance.toFixed(2)} USDC</span>
                  </div>
                )}
                <Link
                  href="/meme-perps/create"
                  className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] hover:bg-[#222] hover:border-[#3a3a3a] text-white text-sm font-medium rounded-lg transition-all duration-200 press-effect hover-lift"
                >
                  <Plus className="w-4 h-4" />
                  Create Market
                </Link>
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1a1a1a] animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-hide">
              {tabs.map((tab, index) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-all duration-200 relative press-effect ${
                    activeTab === tab.id
                      ? "text-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {tab.id === "watchlist" && <Star className="w-3 h-3 inline mr-1.5" />}
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white animate-scale-in" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-[#1a1a1a] animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-3">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="relative w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border border-[#2a2a2a] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3a3a3a] transition-all duration-200 input-focus-ring"
                />
              </div>

              {/* Volume Filters */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Volume</span>
                {(["all", "100k", "500k", "1m"] as VolumeFilter[]).map((v) => (
                  <button
                    key={v}
                    onClick={() => setVolumeFilter(v)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 press-effect ${
                      volumeFilter === v
                        ? "bg-white text-black"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a]"
                    }`}
                  >
                    {v === "all" ? "All" : v === "100k" ? ">$100K" : v === "500k" ? ">$500K" : ">$1M"}
                  </button>
                ))}
              </div>

              {/* Leverage Filters */}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">Leverage</span>
                {(["any", "5x", "10x", "20x"] as LeverageFilter[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => setLeverageFilter(l)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 press-effect ${
                      leverageFilter === l
                        ? "bg-white text-black"
                        : "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a]"
                    }`}
                  >
                    {l === "any" ? "Any" : `≥${l.toUpperCase()}`}
                  </button>
                ))}
              </div>

              {/* Markets count */}
              <div className="ml-auto text-gray-500 text-sm">
                {filteredTokens.length} markets
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          {/* Table Header */}
          <div className="hidden lg:grid grid-cols-[40px_1fr_120px_120px_140px_140px_120px_100px_40px] gap-4 px-4 py-3 text-xs text-gray-500 uppercase tracking-wider border-b border-[#1a1a1a]">
            <div></div>
            <div>Token</div>
            <div className="text-right">Price</div>
            <div className="text-right">24h Change</div>
            <div className="text-right">24h Volume</div>
            <div className="text-right">Open Interest</div>
            <div className="text-right">Funding Rate</div>
            <div className="text-right">Max Leverage</div>
            <div></div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="py-12 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              <span className="ml-2 text-gray-400">Loading markets...</span>
            </div>
          )}

          {/* Table Body */}
          {!isLoading && filteredTokens.map((token, index) => {
            const meta = getTokenMeta(token.address, token)
            return (
              <Link
                key={token.address}
                href={`/meme-perps/${token.symbol.toLowerCase()}`}
                className="grid grid-cols-1 lg:grid-cols-[40px_1fr_120px_120px_140px_140px_120px_100px_40px] gap-2 lg:gap-4 px-4 py-4 items-center border-b border-[#1a1a1a] hover:bg-[#111] transition-all duration-200 group animate-fade-in-up opacity-0"
                style={{ animationDelay: `${Math.min(index * 0.05, 0.5)}s`, animationFillMode: 'forwards' }}
              >
                {/* Favorite */}
                <div className="hidden lg:block">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavorite(token.symbol)
                    }}
                    className={`p-1 rounded transition-all duration-200 star-animate ${
                      favorites.includes(token.symbol)
                        ? "text-yellow-400"
                        : "text-gray-600 hover:text-gray-400"
                    }`}
                  >
                    <Star className="w-4 h-4 transition-transform duration-200" fill={favorites.includes(token.symbol) ? "currentColor" : "none"} />
                  </button>
                </div>

                {/* Token Info */}
                <div className="flex items-center gap-3">
                  <img
                    src={token.logoURI}
                    alt={token.name}
                    className="w-8 h-8 rounded-full bg-[#2a2a2a] flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=2a2a2a&color=fff&size=32`
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{token.symbol}</span>
                      {token.isUserCreated && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-[#A3FF12]/20 text-[#A3FF12] rounded">NEW</span>
                      )}
                      <span className="text-gray-500 text-sm truncate hidden sm:inline">{token.name}</span>
                    </div>
                    {/* Mobile: show price & change inline */}
                    <div className="flex items-center gap-2 lg:hidden mt-1">
                      <span className="text-white font-mono text-sm">{formatPrice(token.price)}</span>
                      <span className={`text-sm font-mono ${token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {formatChange(token.priceChange24h)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="hidden lg:block text-right text-white font-mono">
                  {formatPrice(token.price)}
                </div>

                {/* 24h Change */}
                <div className={`hidden lg:block text-right font-mono ${
                  token.priceChange24h >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {formatChange(token.priceChange24h)}
                </div>

                {/* Volume */}
                <div className="hidden lg:block text-right text-white font-mono">
                  {formatVolume(token.volume24h)}
                </div>

                {/* Open Interest */}
                <div className="hidden lg:block text-right text-white font-mono">
                  {formatVolume(meta.openInterest)}
                </div>

                {/* Funding Rate */}
                <div className={`hidden lg:block text-right font-mono ${
                  meta.fundingRate >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {formatFunding(meta.fundingRate)}
                </div>

                {/* Max Leverage */}
                <div className="hidden lg:block text-right text-white font-mono">
                  {meta.maxLeverage}x
                </div>

                {/* Arrow */}
                <div className="hidden lg:block text-gray-500 group-hover:text-white transition-all duration-200">
                  <ArrowRight className="w-4 h-4 row-hover-arrow" />
                </div>
              </Link>
            )
          })}

          {!isLoading && filteredTokens.length === 0 && activeTab !== "positions" && activeTab !== "markets" && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No markets found matching your criteria</p>
            </div>
          )}

          {/* My Positions */}
          {activeTab === "positions" && (
            <div>
              {/* Sub-tabs */}
              <div className="flex items-center gap-1 border-b border-[#1a1a1a] px-2 pt-2">
                <button
                  onClick={() => setPositionsSubTab("open")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${positionsSubTab === "open" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  Open ({openPositions.length})
                  {positionsSubTab === "open" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
                <button
                  onClick={() => setPositionsSubTab("history")}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${positionsSubTab === "history" ? "text-white" : "text-gray-500 hover:text-gray-300"}`}
                >
                  History ({historyPositions.length})
                  {positionsSubTab === "history" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
                </button>
              </div>

              {positionsLoading ? (
                <div className="py-12 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  <span className="text-gray-400">Loading positions...</span>
                </div>
              ) : !walletAddress ? (
                <div className="py-16 text-center">
                  <p className="text-gray-500 mb-4">Connect your wallet to see positions</p>
                </div>
              ) : positionsSubTab === "open" ? (
                openPositions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] text-gray-500 text-xs">
                          <th className="text-left px-4 py-3">MARKET</th>
                          <th className="text-left px-4 py-3">SIDE</th>
                          <th className="text-right px-4 py-3">SIZE</th>
                          <th className="text-right px-4 py-3">LEVERAGE</th>
                          <th className="text-right px-4 py-3">ENTRY PRICE</th>
                          <th className="text-right px-4 py-3">COLLATERAL</th>
                          <th className="text-right px-4 py-3">OPENED</th>
                          <th className="text-right px-4 py-3">ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {openPositions.map((pos: any) => (
                          <tr key={pos.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                            <td className="px-4 py-3 font-medium text-white">
                              <Link href={`/meme-perps/${pos.token_symbol.toLowerCase()}`} className="hover:text-[#A3FF12] transition-colors">
                                {pos.market}
                              </Link>
                            </td>
                            <td className={`px-4 py-3 font-medium ${pos.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                              {pos.side.toUpperCase()}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-white">{Number(pos.size).toFixed(3)}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{pos.leverage}x</td>
                            <td className="px-4 py-3 text-right font-mono text-white">${Number(pos.entry_price) < 0.01 ? Number(pos.entry_price).toFixed(6) : Number(pos.entry_price).toFixed(4)}</td>
                            <td className="px-4 py-3 text-right font-mono text-white">{Number(pos.collateral).toFixed(2)} USDC</td>
                            <td className="px-4 py-3 text-right text-gray-400 text-xs">
                              {new Date(pos.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/meme-perps/${pos.token_symbol.toLowerCase()}`}
                                className="px-3 py-1 text-xs bg-[#A3FF12]/20 border border-[#A3FF12] text-[#A3FF12] rounded hover:bg-[#A3FF12] hover:text-black transition-colors"
                              >
                                Manage
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <h3 className="text-white text-lg font-medium mb-2">No open positions</h3>
                    <p className="text-gray-500 mb-6">You don&apos;t have any open positions yet</p>
                    <button onClick={() => setActiveTab("trending")} className="px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      Browse Markets
                    </button>
                  </div>
                )
              ) : (
                /* History sub-tab */
                historyPositions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#1a1a1a] text-gray-500 text-xs">
                          <th className="text-left px-4 py-3">STATUS</th>
                          <th className="text-left px-4 py-3">MARKET</th>
                          <th className="text-left px-4 py-3">SIDE</th>
                          <th className="text-right px-4 py-3">COLLATERAL</th>
                          <th className="text-right px-4 py-3">ENTRY</th>
                          <th className="text-right px-4 py-3">CLOSE</th>
                          <th className="text-right px-4 py-3">REALIZED PNL</th>
                          <th className="text-right px-4 py-3">DATE</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historyPositions.map((pos: any) => {
                          const pnl = Number(pos.pnl_realized) || 0
                          return (
                            <tr key={pos.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 text-xs rounded ${pos.status === 'liquidated' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                  {pos.status.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-white">{pos.market}</td>
                              <td className={`px-4 py-3 font-medium ${pos.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                                {pos.side.toUpperCase()}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-white">{Number(pos.collateral).toFixed(2)}</td>
                              <td className="px-4 py-3 text-right font-mono text-white">${Number(pos.entry_price) < 0.01 ? Number(pos.entry_price).toFixed(6) : Number(pos.entry_price).toFixed(4)}</td>
                              <td className="px-4 py-3 text-right font-mono text-white">
                                {pos.close_price ? `$${Number(pos.close_price) < 0.01 ? Number(pos.close_price).toFixed(6) : Number(pos.close_price).toFixed(4)}` : '—'}
                              </td>
                              <td className={`px-4 py-3 text-right font-mono ${pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {pnl >= 0 ? '+' : ''}{(Number(pnl) || 0).toFixed(4)}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-400 text-xs">
                                {new Date(pos.closed_at || pos.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <p className="text-gray-500">No closed positions yet</p>
                  </div>
                )
              )}
            </div>
          )}

          {/* My Markets - Empty State (only show if no markets) */}
          {activeTab === "markets" && filteredTokens.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                <Plus className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No markets created</h3>
              <p className="text-gray-500 mb-6">You haven&apos;t created any markets yet</p>
              <Link
                href="/meme-perps/create"
                className="inline-block px-6 py-2.5 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
              >
                Create Market
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
