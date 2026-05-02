"use client"

import { useState, useCallback, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import { TradingChart } from "@/components/trading-chart"
import { useWallet } from "@/lib/wallet-context"
import { Info, Plus, X, Loader2 } from "lucide-react"
import useSWR from "swr"
import "../animations.css"

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Treasury wallet for USDC payments
const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET || ""
// USDC token mint on Solana
const USDC_MINT = process.env.NEXT_PUBLIC_USDC_MINT || ""

interface Position {
  id: string
  wallet_address: string
  market: string
  token_symbol: string
  side: 'long' | 'short'
  size: number
  leverage: number
  entry_price: number
  liquidation_price: number
  collateral: number
  status: string
  created_at: string
  take_profit: number | null
  stop_loss: number | null
}

interface Order {
  id: string
  wallet_address: string
  market: string
  token_symbol: string
  side: 'long' | 'short'
  size: number
  leverage: number
  limit_price: number
  collateral: number
  status: string
  created_at: string
}

// Fallback token data - use Birdeye for Solana tokens (no tvSymbol = use Birdeye)
const fallbackTokens: Record<string, { name: string; address: string; tvSymbol: string }> = {
  // Existing
  pepe: { name: "Pepe", address: "FUAfBo2jgks6gB4Z4LfZkqSZgzNucisEHqnNebaRxM1P", tvSymbol: "" },
  wif: { name: "dogwifhat", address: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm", tvSymbol: "" },
  bonk: { name: "Bonk", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", tvSymbol: "" },
  trump: { name: "TRUMP", address: "6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN", tvSymbol: "" },
  popcat: { name: "Popcat", address: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr", tvSymbol: "" },
  moodeng: { name: "Moo Deng", address: "ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY", tvSymbol: "" },
  pnut: { name: "Peanut", address: "2qEHjDLDLbuBgRYvsxhc5D6uDWAivNFZGan56P1tpump", tvSymbol: "" },
  fartcoin: { name: "Fartcoin", address: "9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump", tvSymbol: "" },
  perk: { name: "Perk", address: "FdWXxKT7TYALhAB1vxXFsiBxzEMUDiAYwjxiEnLPk5jR", tvSymbol: "" },
  // Added: existing in /api/tokens
  mew: { name: "cat in a dogs world", address: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5", tvSymbol: "" },
  goat: { name: "Goatseus Maximus", address: "CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump", tvSymbol: "" },
  chillguy: { name: "Just a chill guy", address: "Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump", tvSymbol: "" },
  ai16z: { name: "ai16z", address: "HeLp6NuQkmYB4pYWo2zYs22mESHXPQYzXbB8n4V98jwC", tvSymbol: "" },
  bome: { name: "BOOK OF MEME", address: "ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82", tvSymbol: "" },
  mother: { name: "Mother Iggy", address: "3S8qX1MsMqRbiwKg2cQyx7nis1oHMgaCuc9c4VfvVdPN", tvSymbol: "" },
  jup: { name: "Jupiter", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", tvSymbol: "" },
  // Added: meme — popular
  slerf: { name: "SLERF", address: "7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7LoiVkM3", tvSymbol: "" },
  wen: { name: "Wen", address: "WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk", tvSymbol: "" },
  myro: { name: "Myro", address: "HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4", tvSymbol: "" },
  giga: { name: "Gigachad", address: "63LfDmNb3MQ8mw9MtZ2To9bEA2M71kZUUGq5tiJxcqj9", tvSymbol: "" },
  neiro: { name: "Neiro", address: "CTg3ZgYx79zrE1MteDVkmkcGniiFrK1hJ6yiabropump", tvSymbol: "" },
  zerebro: { name: "Zerebro", address: "8x5VqbHA8D7NkD52uNuS5nnt3PwA8pLD34ymskeSo2Wn", tvSymbol: "" },
  act: { name: "Act I: The AI Prophecy", address: "GJAFwWjJ3vnTsrQVabjBVK2TYB1YtRCQXRDfDgUnpump", tvSymbol: "" },
  retardio: { name: "RETARDIO", address: "6ogzHhzdrQr9Pgv6hZ2MNze7UrzBMAFyBBWUYp1Fhitx", tvSymbol: "" },
  ponke: { name: "Ponke", address: "5z3EqYQo9HiCEs3R84RCDMu2n7anpDMxRhdK8PSWmrRC", tvSymbol: "" },
  aura: { name: "Aura", address: "DtR4D9FtVoTX2569gaL837ZgrB6wNjj6tkmnX9Rdk9B2", tvSymbol: "" },
  michi: { name: "Michi", address: "5mbK36SZ7J19An8jFochhQS4of8g6BwUjbeCSxBSoWdp", tvSymbol: "" },
  // Added: DeFi / utility
  jto: { name: "Jito", address: "jtojtomepa8beP8AuQc6eXt5FriJwfFMwQx2v2f9mCL", tvSymbol: "" },
  pyth: { name: "Pyth Network", address: "HZ1JovNiVvGrGNiiYvEozEVgZ58xaU3RKwX8eACQBCt3", tvSymbol: "" },
  ray: { name: "Raydium", address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R", tvSymbol: "" },
  jlp: { name: "Jupiter LP", address: "27G8MtK7VtTcCHkpASjSDdkWWYfoqT6ggEuKidVJidD4", tvSymbol: "" },
  inf: { name: "Infinity", address: "5oVNBeEEQvYi1cX3ir8Dx5n1P7pdxydbGF2X4TxVusJm", tvSymbol: "" },
  orca: { name: "Orca", address: "orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE", tvSymbol: "" },
  kmno: { name: "Kamino", address: "KMNo3nJsBXfcpJTVhZcXLW7RmTwTt4GVFE7suUBo9sS", tvSymbol: "" },
  drift: { name: "Drift", address: "DriFtupJYLTosbwoN8koMbEYSx54aFAVLddWsbksjwg7", tvSymbol: "" },
  render: { name: "Render", address: "rndrizKT3MK1iimdxRdWabcF7Zg7AR5T4nud4EkHBof", tvSymbol: "" },
  hnt: { name: "Helium", address: "hntyVP6YFm1Hg25TN9WGLqM12b8TQmcknKrdu1oxWux", tvSymbol: "" },
  shdw: { name: "Shadow Token", address: "SHDWyBxihqiCj6YekG2GUr7wqKLeLAMK1gHZck9pL6y", tvSymbol: "" },
  tnsr: { name: "Tensor", address: "Frpt6ArMnaaPNXNYpQTgwHqRsSWnYWGNVmrPtnVnD9pX", tvSymbol: "" },
  mngo: { name: "Mango", address: "MangoCzJ36AjZyKwVj3VnYU4GTonjfVEnJmvvWaxLac", tvSymbol: "" },
}

export default function TradePage() {
  const params = useParams()
  const token = (params.token as string)?.toLowerCase() || "pepe"
  const fallbackInfo = fallbackTokens[token] || fallbackTokens.pepe
  
  // Fetch token data from Birdeye API (slow, for metadata)
  const { data: apiData } = useSWR('/api/tokens', fetcher, {
    refreshInterval: 30000,
    revalidateOnFocus: false
  })

  // Fetch user-created markets from Supabase
  const { data: userMarketData } = useSWR(`/api/markets/${token}`, fetcher, {
    refreshInterval: 2000,
    revalidateOnFocus: false
  })
  
  // Check if this is a user-created market
  const isUserCreatedMarket = userMarketData?.market && !userMarketData?.error
  const userMarket = userMarketData?.market
  
  // Get token data from either Birdeye or user-created market
  const birdeyeToken = apiData?.tokens?.find((t: any) => t.symbol.toLowerCase() === token)
  
  const tokenData = birdeyeToken || (isUserCreatedMarket ? {
    price: Number(userMarket?.current_price) || 0,
    change24h: Number(userMarket?.price_change_24h) || 0,
    volume24h: Number(userMarket?.volume_24h) || 0,
    symbol: userMarket?.token_symbol || token.toUpperCase(),
    name: userMarket?.token_name || token
  } : {
    price: 0.00001234,
    change24h: 5.42,
    volume24h: 125000000,
    symbol: token.toUpperCase(),
    name: fallbackInfo.name
  })
  
  // Token info with address for Birdeye chart
  const tokenInfo = fallbackTokens[token] || {
    name: userMarket?.token_name || token,
    address: userMarket?.token_address || "",
    tvSymbol: "" // Not used for user-created markets
  }
  
  // Get token address for chart - use Birdeye for Solana tokens
  const tokenAddress = userMarket?.token_address || birdeyeToken?.address || tokenInfo.address

  // Fast price polling every 2 seconds (for live PnL updates)
  const { data: livePriceData } = useSWR(
    tokenAddress && !isUserCreatedMarket ? `/api/token-price?address=${tokenAddress}` : null,
    fetcher,
    { refreshInterval: 2000, revalidateOnFocus: false, dedupingInterval: 1000 }
  )

  const solPrice = apiData?.solPrice || 82.29
  const totalVolume = apiData?.totalVolume || 24970000
  const marketsCount = (apiData?.tokens?.length || 8) + (userMarketData?.market ? 1 : 0)

  const [orderTab, setOrderTab] = useState<"market" | "limit" | "stoptp" | "interpolated">("market")
  const [side, setSide] = useState<"long" | "short">("long")
  const [size, setSize] = useState("")
  const [limitPrice, setLimitPrice] = useState("")
  const [triggerPrice, setTriggerPrice] = useState("")
  const [leverage, setLeverage] = useState(2)
  const [timeframe, setTimeframe] = useState("15m")
  const [isOpeningPosition, setIsOpeningPosition] = useState(false)
  const [positionError, setPositionError] = useState<string | null>(null)
  const [closingPositionId, setClosingPositionId] = useState<string | null>(null)
  const [tpSlModal, setTpSlModal] = useState<{ type: 'tp' | 'sl', position: Position } | null>(null)
  const [tpSlValue, setTpSlValue] = useState("")
  const [isSavingTpSl, setIsSavingTpSl] = useState(false)
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [devnetBalance, setDevnetBalance] = useState(0)
  const [isDepositingFunds, setIsDepositingFunds] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [positionsTab, setPositionsTab] = useState<"open" | "history">("open")
  const [liquidatingIds, setLiquidatingIds] = useState<Set<string>>(new Set())
  const [historyPositions, setHistoryPositions] = useState<any[]>([])

  // Interpolated entry state
  const [interpSize, setInterpSize] = useState("")
  const [interpFromPrice, setInterpFromPrice] = useState("")
  const [interpToPrice, setInterpToPrice] = useState("")
  const [interpSlices, setInterpSlices] = useState(4)
  const [interpDistribution, setInterpDistribution] = useState<"Linear" | "Exponential" | "Fibonacci">("Linear")
  const [interpProgress, setInterpProgress] = useState<{ current: number; total: number } | null>(null)
  const [interpComplete, setInterpComplete] = useState<{ count: number; avgEntry: number } | null>(null)
  
  // Max leverage from user market or default
  const maxLeverage = userMarket?.max_leverage || 10
  
  // Get wallet info from context (we use devnetBalance for trading, not usdcBalance)
  const { isConnected, walletAddress } = useWallet()

  // Fetch devnet balance
  const fetchDevnetBalance = async () => {
    if (!walletAddress) return
    try {
      const res = await fetch(`/api/demo-balance?wallet=${walletAddress}`)
      const data = await res.json()
      setDevnetBalance(data.balance || 0)
    } catch {}
  }
  useEffect(() => { fetchDevnetBalance() }, [walletAddress])

  // Fetch position history
  const fetchHistory = async () => {
    if (!walletAddress) return
    try {
      const res = await fetch(`/api/positions?wallet=${walletAddress}&status=closed`)
      const data = await res.json()
      const liq = await fetch(`/api/positions?wallet=${walletAddress}&status=liquidated`)
      const liqData = await liq.json()
      setHistoryPositions([...(data.positions || []), ...(liqData.positions || [])].sort(
        (a: any, b: any) => new Date(b.closed_at || b.created_at).getTime() - new Date(a.closed_at || a.created_at).getTime()
      ))
    } catch {}
  }
  useEffect(() => { if (positionsTab === "history") fetchHistory() }, [positionsTab, walletAddress])

  // Fetch user positions
  const { data: positionsData, mutate: refreshPositions } = useSWR(
    walletAddress ? `/api/positions?wallet=${walletAddress}&status=open` : null,
    fetcher,
    { refreshInterval: 3000 }
  )
  const positions: Position[] = positionsData?.positions || []
  
  // Fetch user orders
  const { data: ordersData, mutate: refreshOrders } = useSWR(
    walletAddress ? `/api/orders?wallet=${walletAddress}&status=pending` : null,
    fetcher,
    { refreshInterval: 3000 }
  )
  const orders: Order[] = ordersData?.orders || []
  // Include 0.5% commission in the balance check so user sees error before clicking
  const sizeNum = parseFloat(size.replace(',', '.')) || 0
  const insufficientBalance = size !== "" && sizeNum * 1.005 > devnetBalance
  const interpSizeNum = parseFloat(interpSize.replace(',', '.')) || 0
  const interpInsufficientBalance = interpSize !== "" && interpSizeNum * 1.005 > devnetBalance

  // ⚠️ Postgres returns DECIMAL as string. Always coerce — otherwise
  // `"3.83" < 0.0001` short-circuits the wrong way and `.toFixed()` on a
  // string crashes the render.
  const formatPrice = (raw: number | string | null | undefined) => {
    const price = Number(raw) || 0
    if (price < 0.0001) return price.toFixed(8)
    if (price < 0.01) return price.toFixed(6)
    if (price < 1) return price.toFixed(4)
    return price.toFixed(2)
  }

  const formatVolume = (raw: number | string | null | undefined) => {
    const vol = Number(raw) || 0
    if (vol >= 1000000) return `$${(vol / 1000000).toFixed(2)}M`
    if (vol >= 1000) return `$${(vol / 1000).toFixed(2)}K`
    return `$${vol.toFixed(2)}`
  }

  const formatAmount = (raw: number | string | null | undefined) => {
    const val = Number(raw) || 0
    if (val === 0) return "0"
    if (val < 0.0001) return val.toFixed(6)
    if (val < 0.01)   return val.toFixed(5)
    if (val < 0.1)    return val.toFixed(4)
    if (val < 1)      return val.toFixed(3)
    if (val < 1000)   return val.toFixed(2)
    return val.toFixed(0)
  }

  const getDistributionWeights = (n: number, dist: "Linear" | "Exponential" | "Fibonacci"): number[] => {
    let weights: number[]
    if (dist === "Exponential") {
      weights = Array.from({ length: n }, (_, i) => Math.pow(2, i))
    } else if (dist === "Fibonacci") {
      const fib = [1, 1, 2, 3, 5, 8, 13, 21]
      weights = fib.slice(0, n)
    } else {
      weights = Array.from({ length: n }, () => 1)
    }
    const sum = weights.reduce((a, b) => a + b, 0)
    return weights.map(w => w / sum)
  }

  const computeInterpSlices = () => {
    const totalSize = parseFloat(interpSize.replace(',', '.')) || 0
    const fromP = parseFloat(interpFromPrice.replace(',', '.')) || markPrice * 0.95
    const toP = parseFloat(interpToPrice.replace(',', '.')) || markPrice * 1.05
    const n = interpSlices
    const weights = getDistributionWeights(n, interpDistribution)
    return Array.from({ length: n }, (_, i) => {
      const price = n === 1 ? fromP : fromP + (toP - fromP) * i / (n - 1)
      const sliceSize = totalSize * weights[i]
      return { price, size: sliceSize, position: sliceSize * leverage }
    })
  }

  // Open position handler (Devnet - deducts from devnet balance, no real tx)
  const handleOpenPosition = async () => {
    if (!walletAddress || !size || isOpeningPosition) return
    const sizeValue = parseFloat(size.replace(',', '.'))
    if (!Number.isFinite(sizeValue) || sizeValue <= 0) return
    if (!Number.isFinite(markPrice) || markPrice <= 0) {
      setPositionError('Price unavailable for this market. Try again in a moment.')
      return
    }
    const commission = sizeValue * 0.005
    const totalCost = sizeValue + commission
    if (totalCost > devnetBalance) return

    setIsOpeningPosition(true)
    setPositionError(null)
    try {
      // Deduct from devnet balance
      const balRes = await fetch('/api/demo-balance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, delta: -totalCost })
      })
      const balData = await balRes.json()
      setDevnetBalance(Number(balData?.balance) || 0)

      const liqPrice = side === "long"
        ? markPrice * (1 - 0.9 / leverage)
        : markPrice * (1 + 0.9 / leverage)

      const response = await fetch('/api/positions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress,
          market: `${token.toUpperCase()}-PERP`,
          tokenSymbol: token.toUpperCase(),
          side, size: sizeValue * leverage, leverage,
          entryPrice: markPrice, liquidationPrice: liqPrice,
          collateral: sizeValue, commission
        })
      })
      if (!response.ok) { const e = await response.json(); throw new Error(e.error) }
      setSize("")
      refreshPositions()
    } catch (error: any) {
      setPositionError(error.message || 'Failed to open position')
    } finally {
      setIsOpeningPosition(false)
    }
  }

  // Close position handler (returns remaining value to devnet balance)
  const handleClosePosition = async (position: Position) => {
    if (closingPositionId) return

    // 🛑 Refuse to close a position from a DIFFERENT market — we'd be using
    // this page's markPrice (wrong token) as close_price. User must open
    // the actual market page to close it.
    if (position.token_symbol && position.token_symbol !== token.toUpperCase()) {
      setPositionError(`Open ${position.token_symbol}-PERP market to close this position.`)
      return
    }

    setClosingPositionId(position.id)
    try {
      const { pnlValue } = calculatePnl(position)
      // ⚠️ position.collateral comes from Postgres as a STRING — must coerce
      // to number or `+` becomes string concatenation and Math.max returns NaN.
      const collateralNum = Number(position.collateral) || 0
      const returnAmount = Math.max(0, collateralNum + pnlValue)

      const response = await fetch('/api/positions/close', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: position.id, walletAddress,
          closePrice: markPrice,
          pnlRealized: pnlValue,
          returnAmount
        })
      })
      if (!response.ok) { const e = await response.json(); throw new Error(e.error) }
      // Pull authoritative balance from server instead of optimistic add —
      // avoids drift between client state and DB.
      fetchDevnetBalance()
      refreshPositions()
    } catch (error: any) {
      setPositionError(error.message || 'Failed to close position')
    } finally {
      setClosingPositionId(null)
    }
  }

  // Save TP/SL for a position
  const handleSaveTpSl = async () => {
    if (!tpSlModal || !tpSlValue || isSavingTpSl) return
    
    const value = parseFloat(tpSlValue.replace(',', '.'))
    if (isNaN(value) || value <= 0) return
    
    setIsSavingTpSl(true)
    
    try {
      const response = await fetch('/api/positions/update-tpsl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          positionId: tpSlModal.position.id,
          walletAddress,
          type: tpSlModal.type,
          value
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save')
      }
      
      refreshPositions()
      setTpSlModal(null)
      setTpSlValue("")
    } catch (error) {
      console.error('Save TP/SL error:', error)
    } finally {
      setIsSavingTpSl(false)
    }
  }

  // Open limit order handler (Devnet - locks devnet balance)
  const handleOpenLimitOrder = async () => {
    if (!walletAddress || !size || !limitPrice || isOpeningPosition) return
    const sizeValue = parseFloat(size.replace(',', '.'))
    const limitPriceValue = parseFloat(limitPrice.replace(',', '.'))
    if (sizeValue <= 0 || limitPriceValue <= 0) return
    const commission = sizeValue * 0.005
    const totalCost = sizeValue + commission
    if (totalCost > devnetBalance) return

    setIsOpeningPosition(true)
    setPositionError(null)
    try {
      // Lock devnet balance
      const balRes = await fetch('/api/demo-balance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, delta: -totalCost })
      })
      const balData = await balRes.json()
      setDevnetBalance(Number(balData?.balance) || 0)

      const response = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress, market: `${token.toUpperCase()}-PERP`,
          tokenSymbol: token.toUpperCase(), side,
          size: sizeValue * leverage, leverage,
          limitPrice: limitPriceValue, collateral: sizeValue, commission
        })
      })
      if (!response.ok) { const e = await response.json(); throw new Error(e.error) }
      setSize(""); setLimitPrice("")
      refreshOrders()
    } catch (error: any) {
      setPositionError(error.message || 'Failed to create limit order')
    } finally {
      setIsOpeningPosition(false)
    }
  }

  // Interpolated entry — executes N sequential devnet positions across a price range
  const handleOpenInterpolated = async () => {
    if (!walletAddress || !interpSize || isOpeningPosition) return
    const totalSizeValue = parseFloat(interpSize.replace(',', '.'))
    if (totalSizeValue <= 0) return
    const totalCommission = totalSizeValue * 0.005
    const totalCost = totalSizeValue + totalCommission
    if (totalCost > devnetBalance) return

    const slices = computeInterpSlices()
    setIsOpeningPosition(true)
    setPositionError(null)
    setInterpComplete(null)

    try {
      // Deduct total cost from devnet balance upfront
      const balRes = await fetch('/api/demo-balance', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, delta: -totalCost })
      })
      const balData = await balRes.json()
      setDevnetBalance(Number(balData?.balance) || 0)

      let weightedPriceSum = 0
      let collateralSum = 0

      for (let i = 0; i < slices.length; i++) {
        const slice = slices[i]
        setInterpProgress({ current: i + 1, total: slices.length })

        const sliceCommission = slice.size * 0.005
        const liqPrice = side === "long"
          ? slice.price * (1 - 0.9 / leverage)
          : slice.price * (1 + 0.9 / leverage)

        await fetch('/api/positions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            walletAddress,
            market: `${token.toUpperCase()}-PERP`,
            tokenSymbol: token.toUpperCase(),
            side,
            size: slice.size * leverage,
            leverage,
            entryPrice: slice.price,
            liquidationPrice: liqPrice,
            collateral: slice.size,
            commission: sliceCommission
          })
        })

        weightedPriceSum += slice.price * slice.size
        collateralSum += slice.size
      }

      const avgEntry = weightedPriceSum / collateralSum
      setInterpComplete({ count: slices.length, avgEntry })
      setInterpSize("")
      refreshPositions()

    } catch (error: any) {
      console.error('Interpolated entry error:', error)
      setPositionError(error.message || 'Failed to execute interpolated entry')
    } finally {
      setIsOpeningPosition(false)
      setInterpProgress(null)
    }
  }

  // Add devnet funds — $1 USDC/USDT payment via Phantom → +1000 devnet USDC
  const handleAddFunds = async () => {
    if (!walletAddress || isDepositingFunds) return
    setIsDepositingFunds(true)
    setDepositError(null)
    try {
      const provider = (window as any).phantom?.solana
      if (!provider?.isPhantom) throw new Error("Please connect Phantom wallet")

      const { PublicKey, Transaction, Connection } = await import("@solana/web3.js")
      const {
        getAssociatedTokenAddress,
        createTransferInstruction,
        createAssociatedTokenAccountInstruction,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      } = await import("@solana/spl-token")

      const connection = new Connection(
        process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com",
        "confirmed"
      )

      const fromPubkey = new PublicKey(walletAddress)
      const toPubkey = new PublicKey(TREASURY_WALLET)

      // Try USDC first, fall back to USDT
      const USDT_MINT = process.env.NEXT_PUBLIC_USDT_MINT || ""
      let mintAddress = USDC_MINT
      let mintPubkey = new PublicKey(mintAddress)
      let fromATA = await getAssociatedTokenAddress(mintPubkey, fromPubkey)
      let fromATAInfo = await connection.getAccountInfo(fromATA)

      if (!fromATAInfo) {
        // Try USDT
        mintAddress = USDT_MINT
        mintPubkey = new PublicKey(mintAddress)
        fromATA = await getAssociatedTokenAddress(mintPubkey, fromPubkey)
        fromATAInfo = await connection.getAccountInfo(fromATA)
        if (!fromATAInfo) throw new Error("No USDC or USDT balance found")
      }

      const toATA = await getAssociatedTokenAddress(mintPubkey, toPubkey)
      const toATAInfo = await connection.getAccountInfo(toATA)

      const amount = 1_000_000 // $1.00
      const transaction = new Transaction()

      if (!toATAInfo) {
        transaction.add(createAssociatedTokenAccountInstruction(
          fromPubkey, toATA, toPubkey, mintPubkey, TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID
        ))
      }

      transaction.add(createTransferInstruction(fromATA, toATA, fromPubkey, amount, [], TOKEN_PROGRAM_ID))
      transaction.feePayer = fromPubkey
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash

      const signed = await provider.signTransaction(transaction)
      const txSignature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(txSignature, "confirmed")

      // Verify payment and credit devnet balance
      const res = await fetch('/api/demo-deposit', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: walletAddress, signature: txSignature })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Deposit verification failed')
      setDevnetBalance(Number(data?.balance) || 0)
    } catch (error: any) {
      console.error('Add funds error:', error)
      setDepositError(error.message || 'Failed to add funds')
    } finally {
      setIsDepositingFunds(false)
    }
  }

  // Liquidate a position
  const handleLiquidatePosition = async (position: Position) => {
    if (liquidatingIds.has(position.id) || !walletAddress || !priceLoaded) return
    setLiquidatingIds(prev => new Set([...prev, position.id]))
    try {
      await fetch('/api/positions/liquidate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ positionId: position.id, walletAddress, closePrice: markPrice })
      })
      refreshPositions()
    } catch (error) {
      console.error('Liquidation error:', error)
    } finally {
      setLiquidatingIds(prev => { const s = new Set(prev); s.delete(position.id); return s })
    }
  }

  // Cancel order handler
  const handleCancelOrder = async (order: Order) => {
    if (cancellingOrderId) return
    
    setCancellingOrderId(order.id)
    
    try {
      const response = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          walletAddress
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel order')
      }
      
      refreshOrders()
      
    } catch (error: any) {
      console.error('Order cancel error:', error)
      setPositionError(error.message || 'Failed to cancel order')
    } finally {
      setCancellingOrderId(null)
    }
  }

  // Trigger order when price reaches limit
  const triggerOrder = async (order: Order) => {
    try {
      console.log('Triggering order:', order.id, 'limit_price:', order.limit_price)
      const response = await fetch('/api/orders/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          walletAddress
        })
      })
      
      if (response.ok) {
        console.log('Order triggered successfully')
        refreshOrders()
        refreshPositions()
      } else {
        const error = await response.json()
        console.error('Order trigger failed:', error)
      }
    } catch (error) {
      console.error('Order trigger error:', error)
    } finally {
      setTriggeringOrderIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(order.id)
        return newSet
      })
    }
  }

  // Only consider price valid once real API data has loaded (not fallback)
  const priceLoaded = !!(apiData || isUserCreatedMarket || livePriceData?.price)

  // Use live price if available, otherwise fall back to tokenData. Never undefined.
  const markPrice = (livePriceData?.price && livePriceData.price > 0)
    ? Number(livePriceData.price)
    : (Number(tokenData?.price) || 0)

  // Calculate PNL for a position — guards against undefined fields so the UI
  // never crashes. Returns 0 for positions of OTHER tokens (we don't have
  // their current price on this page).
  const calculatePnl = (position: Position) => {
    // Don't show PnL for foreign-market positions — markPrice is only valid
    // for THIS token. Showing real PnL for them would require fetching their
    // live price, which we don't do here. Caller renders "—" in that case.
    if (position?.token_symbol && position.token_symbol !== token.toUpperCase()) {
      return { pnlValue: 0, pnlPercent: 0, foreign: true as const }
    }
    const currentPrice = Number(markPrice) || 0
    const entryPrice = Number(position?.entry_price) || 0
    const collateral = Number(position?.collateral) || 0
    const leverage = Number(position?.leverage) || 1

    if (entryPrice <= 0) return { pnlValue: 0, pnlPercent: 0, foreign: false as const }

    let pnlPercent: number
    if (position.side === 'long') {
      pnlPercent = ((currentPrice - entryPrice) / entryPrice) * leverage
    } else {
      pnlPercent = ((entryPrice - currentPrice) / entryPrice) * leverage
    }

    const pnlValue = collateral * pnlPercent
    return { pnlValue, pnlPercent: pnlPercent * 100, foreign: false as const }
  }
  const indexPrice = Number(tokenData?.price) || 0
  const fundingRate = -0.001
  const openInterest = 3500
  const volume24h = (Number(tokenData?.volume24h) || 0) / 1000
  const vaultValue = 597.43

  // ⚠️ CRITICAL: markPrice on this page is ONLY for `token` (the URL param).
  // We must NOT apply it to positions of other markets — otherwise a FARTCOIN
  // position's TP/SL gets compared to TRUMP price and "triggers" with fake PnL.
  const currentSymbol = token.toUpperCase()

  // Check if any position SHOULD be auto-closed based on TP/SL.
  // Only check positions of the current token — other markets are evaluated
  // when the user visits their own page (or by a future cron).
  useEffect(() => {
    if (!positions.length || !markPrice || !priceLoaded) return

    positions.forEach(async (position) => {
      if (position.token_symbol !== currentSymbol) return

      const tp = position.take_profit != null ? Number(position.take_profit) : null
      const sl = position.stop_loss != null ? Number(position.stop_loss) : null

      const shouldClose =
        (tp !== null && position.side === 'long' && markPrice >= tp) ||
        (tp !== null && position.side === 'short' && markPrice <= tp) ||
        (sl !== null && position.side === 'long' && markPrice <= sl) ||
        (sl !== null && position.side === 'short' && markPrice >= sl)

      if (shouldClose && closingPositionId !== position.id) {
        handleClosePosition(position)
      }
    })
  }, [positions, markPrice, priceLoaded, currentSymbol])

  // Check if any open position should be liquidated — same scoping rule.
  useEffect(() => {
    if (!positions.length || !markPrice || !priceLoaded) return
    positions.forEach((position) => {
      if (position.token_symbol !== currentSymbol) return
      if (liquidatingIds.has(position.id)) return
      const { pnlValue } = calculatePnl(position)
      const collateralNum = Number(position.collateral) || 0
      // Liquidate when loss >= collateral (P&L <= -collateral)
      if (collateralNum > 0 && pnlValue <= -collateralNum) {
        handleLiquidatePosition(position)
      }
    })
  }, [positions, markPrice, priceLoaded, currentSymbol])

  // Track which orders are being triggered to prevent duplicates
  const [triggeringOrderIds, setTriggeringOrderIds] = useState<Set<string>>(new Set())

  // Prefill interpolated price range when tab is selected
  useEffect(() => {
    if (orderTab === "interpolated" && markPrice > 0) {
      if (!interpFromPrice) setInterpFromPrice(formatPrice(markPrice * 0.95))
      if (!interpToPrice) setInterpToPrice(formatPrice(markPrice * 1.05))
    }
  }, [orderTab, markPrice])

  // Check if any limit order should be triggered — same scoping rule as
  // auto-close/liquidate: only evaluate orders for the current page's token.
  useEffect(() => {
    if (!orders.length || !markPrice || !priceLoaded) return

    orders.forEach(async (order) => {
      if (order.token_symbol !== currentSymbol) return
      if (triggeringOrderIds.has(order.id)) return

      const limitPrice = Number(order.limit_price)

      // LONG limit X: triggers when market reaches X from below or above
      // SHORT limit X: triggers when market reaches X from above or below
      const shouldTrigger =
        (order.side === 'long' && markPrice >= limitPrice) ||
        (order.side === 'short' && markPrice <= limitPrice)

      if (shouldTrigger) {
        setTriggeringOrderIds(prev => new Set([...prev, order.id]))
        triggerOrder(order)
      }
    })
  }, [orders, markPrice, currentSymbol])

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-[#1a1a1a] animate-fade-in">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left: Logo + Stats */}
          <div className="flex items-center gap-6">
            <Link href="/meme-perps" className="flex items-center gap-2">
              <img src="/logo.png" alt="Perpolis" className="w-12 h-12 rounded-xl" />
              <span className="font-bold text-lg">Perpolis</span>
            </Link>
            <div className="hidden md:flex items-center gap-4 text-sm">
              <span className="text-gray-400">SOL <span className="text-white">${solPrice.toFixed(2)}</span></span>
              <span className="text-gray-400">Vol <span className="text-white">{formatVolume(totalVolume)}</span></span>
              <span className="text-gray-400">Markets <span className="text-white">{marketsCount}</span></span>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button className="hidden sm:flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 press-effect hover-lift">
              <Plus className="w-4 h-4" />
              Create Market
            </button>
            <WalletConnect />
          </div>
        </div>
      </header>

      {/* Token Info Bar */}
      <div className="border-b border-[#1a1a1a] px-4 py-2">
        <div className="flex flex-wrap items-center gap-4 md:gap-8 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">{token.toUpperCase()}-PERP</span>
          </div>
          <div>
            <span className="text-gray-500">Mark </span>
            <span className="text-white font-mono">${formatPrice(markPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Index </span>
            <span className="text-white font-mono">${formatPrice(indexPrice)}</span>
          </div>
          <div>
            <span className="text-gray-500">Funding </span>
            <span className={fundingRate >= 0 ? "text-green-400" : "text-red-400"}>
              {fundingRate >= 0 ? "+" : ""}{(fundingRate * 100).toFixed(3)}%
            </span>
          </div>
          <div>
            <span className="text-gray-500">OI </span>
            <span className="text-white font-mono">{formatVolume(openInterest * 1000)}</span>
          </div>
          <div>
            <span className="text-gray-500">24h Vol </span>
            <span className="text-white font-mono">{formatVolume(volume24h * 1000)}</span>
          </div>
          <div>
            <span className="text-gray-500">Vault </span>
            <span className="text-white font-mono">${vaultValue.toFixed(2)}</span>
          </div>
          <div className="ml-auto">
            <span className="text-gray-500 hover:text-white cursor-pointer">{token.toUpperCase()}ORACLE</span>
          </div>
        </div>
      </div>

      {/* Timeframe Tabs */}
      <div className="border-b border-[#1a1a1a] px-4 py-1">
        <div className="flex items-center gap-1">
          {["5m", "15m", "1H", "4H", "1D"].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-sm rounded transition-all duration-200 press-effect ${
                timeframe === tf
                  ? "text-white bg-[#1a1a1a]"
                  : "text-gray-500 hover:text-white hover:bg-[#111]"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row">
        {/* Chart Area */}
        <div className="flex-1 relative">
          <div className="h-[400px] lg:h-[calc(100vh-460px)] lg:min-h-[360px]">
            {tokenAddress ? (
              <TradingChart
                tokenAddress={tokenAddress}
                tokenSymbol={token.toUpperCase()}
                timeframe={timeframe}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a] text-gray-500">
                <p>Chart unavailable for this token</p>
              </div>
            )}
          </div>

          {/* Positions & Orders Table */}
          <div className="border-t border-[#1a1a1a] lg:h-[240px] lg:overflow-y-auto">
            {/* Tab bar */}
            <div className="flex items-center gap-1 px-4 py-2 border-b border-[#1a1a1a]">
              <button
                onClick={() => setPositionsTab("open")}
                className={`px-3 py-1 text-xs rounded transition-colors ${positionsTab === "open" ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:text-white"}`}
              >
                OPEN ({positions.length + orders.length})
              </button>
              <button
                onClick={() => setPositionsTab("history")}
                className={`px-3 py-1 text-xs rounded transition-colors ${positionsTab === "history" ? "bg-[#1a1a1a] text-white" : "text-gray-500 hover:text-white"}`}
              >
                HISTORY
              </button>
            </div>

            {positionsTab === "open" ? (
              (positions.length > 0 || orders.length > 0) ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a1a] text-gray-500 text-xs">
                        <th className="text-left px-4 py-2">TYPE</th>
                        <th className="text-left px-4 py-2">MARKET</th>
                        <th className="text-left px-4 py-2">SIDE</th>
                        <th className="text-right px-4 py-2">SIZE</th>
                        <th className="text-right px-4 py-2">LEVERAGE</th>
                        <th className="text-right px-4 py-2">PRICE</th>
                        <th className="text-right px-4 py-2">PNL</th>
                        <th className="text-right px-4 py-2">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Open Positions */}
                      {positions.map((position) => {
                        const calc = calculatePnl(position)
                        const { pnlValue, pnlPercent, foreign } = calc
                        const isProfitable = pnlValue >= 0
                        return (
                          <tr key={position.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 text-xs bg-[#A3FF12]/20 text-[#A3FF12] rounded">POS</span>
                            </td>
                            <td className="px-4 py-2 font-medium">{position.market}</td>
                            <td className={`px-4 py-2 font-medium ${position.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                              {position.side.toUpperCase()}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">{(Number(position.size) || 0).toFixed(3)}</td>
                            <td className="px-4 py-2 text-right font-mono">{position.leverage}x</td>
                            <td className="px-4 py-2 text-right font-mono">${formatPrice(Number(position.entry_price) || 0)}</td>
                            <td className={`px-4 py-2 text-right font-mono ${foreign ? 'text-gray-500' : (isProfitable ? 'text-green-400' : 'text-red-400')}`}>
                              {foreign
                                ? '—'
                                : `${isProfitable ? '+' : ''}${(Number(pnlValue) || 0).toFixed(4)} (${isProfitable ? '+' : ''}${(Number(pnlPercent) || 0).toFixed(2)}%)`}
                            </td>
                            <td className="px-4 py-2 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => { setTpSlModal({ type: 'tp', position }); setTpSlValue(position.take_profit?.toString() || "") }}
                                  className={`px-2 py-1 text-xs border rounded hover:bg-[#2a2a2a] transition-colors ${
                                    position.take_profit ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-[#1a1a1a] border-[#2a2a2a]'
                                  }`}
                                >
                                  TP{position.take_profit ? ` $${formatPrice(position.take_profit)}` : ''}
                                </button>
                                <button
                                  onClick={() => { setTpSlModal({ type: 'sl', position }); setTpSlValue(position.stop_loss?.toString() || "") }}
                                  className={`px-2 py-1 text-xs border rounded hover:bg-[#2a2a2a] transition-colors ${
                                    position.stop_loss ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-[#1a1a1a] border-[#2a2a2a]'
                                  }`}
                                >
                                  SL{position.stop_loss ? ` $${formatPrice(position.stop_loss)}` : ''}
                                </button>
                                <button
                                  onClick={() => {
                                    if (foreign) {
                                      // Send user to the actual market page where its mark price is known.
                                      window.location.href = `/meme-perps/${position.token_symbol.toLowerCase()}`
                                      return
                                    }
                                    handleClosePosition(position)
                                  }}
                                  disabled={closingPositionId === position.id}
                                  title={foreign ? `Open ${position.token_symbol}-PERP to close` : 'Close position at current market price'}
                                  className="px-2 py-1 text-xs bg-red-500/20 border border-red-500 text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                >
                                  {closingPositionId === position.id ? '...' : (foreign ? 'Open' : 'Close')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}

                      {/* Pending Orders */}
                      {orders.map((order) => (
                        <tr key={order.id} className="border-b border-[#1a1a1a] hover:bg-[#111] bg-[#0d0d0d]">
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">LIMIT</span>
                          </td>
                          <td className="px-4 py-2 font-medium">{order.market}</td>
                          <td className={`px-4 py-2 font-medium ${order.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                            {order.side.toUpperCase()}
                          </td>
                          <td className="px-4 py-2 text-right font-mono">{(Number(order.size) || 0).toFixed(3)}</td>
                          <td className="px-4 py-2 text-right font-mono">{order.leverage}x</td>
                          <td className="px-4 py-2 text-right font-mono">${formatPrice(Number(order.limit_price) || 0)}</td>
                          <td className="px-4 py-2 text-right font-mono text-gray-500">-</td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleCancelOrder(order)}
                              disabled={cancellingOrderId === order.id}
                              className="px-2 py-1 text-xs bg-gray-500/20 border border-gray-500 text-gray-400 rounded hover:bg-gray-500 hover:text-white transition-colors disabled:opacity-50"
                            >
                              {cancellingOrderId === order.id ? '...' : 'Cancel'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-gray-500 text-sm">No open positions or orders</p>
                </div>
              )
            ) : (
              /* History Tab */
              historyPositions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1a1a1a] text-gray-500 text-xs">
                        <th className="text-left px-4 py-2">STATUS</th>
                        <th className="text-left px-4 py-2">MARKET</th>
                        <th className="text-left px-4 py-2">SIDE</th>
                        <th className="text-right px-4 py-2">COLLATERAL</th>
                        <th className="text-right px-4 py-2">ENTRY</th>
                        <th className="text-right px-4 py-2">CLOSE</th>
                        <th className="text-right px-4 py-2">PNL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyPositions.map((pos: any) => {
                        const pnl = Number(pos.pnl_realized) || 0
                        const isProfitable = pnl >= 0
                        return (
                          <tr key={pos.id} className="border-b border-[#1a1a1a] hover:bg-[#111]">
                            <td className="px-4 py-2">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                pos.status === 'liquidated'
                                  ? 'bg-orange-500/20 text-orange-400'
                                  : 'bg-gray-500/20 text-gray-400'
                              }`}>
                                {pos.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-4 py-2 font-medium">{pos.market}</td>
                            <td className={`px-4 py-2 font-medium ${pos.side === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                              {pos.side.toUpperCase()}
                            </td>
                            <td className="px-4 py-2 text-right font-mono">{(Number(pos.collateral) || 0).toFixed(2)}</td>
                            <td className="px-4 py-2 text-right font-mono">${formatPrice(Number(pos.entry_price) || 0)}</td>
                            <td className="px-4 py-2 text-right font-mono">
                              {pos.close_price ? `$${formatPrice(Number(pos.close_price) || 0)}` : '-'}
                            </td>
                            <td className={`px-4 py-2 text-right font-mono ${isProfitable ? 'text-green-400' : 'text-red-400'}`}>
                              {isProfitable ? '+' : ''}{(Number(pnl) || 0).toFixed(4)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-4 py-6 text-center">
                  <p className="text-gray-500 text-sm">No closed positions yet</p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[300px] border-l border-[#1a1a1a] flex flex-col animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
          {/* Balance Section */}
          <div className="p-4 border-b border-[#1a1a1a]">
            <h3 className="text-gray-400 text-sm font-medium mb-3">DEVNET BALANCE</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  Available <Info className="w-3 h-3" />
                </span>
                <span className="text-white font-mono">{isConnected ? (Number(devnetBalance) || 0).toFixed(2) : "0.00"} USDC</span>
              </div>
              <button
                onClick={handleAddFunds}
                disabled={!isConnected || isDepositingFunds}
                className="w-full py-2 text-xs font-medium rounded-lg border border-[#A3FF12] text-[#A3FF12] hover:bg-[#A3FF12] hover:text-black transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
              >
                {isDepositingFunds ? (
                  <><Loader2 className="w-3 h-3 animate-spin" /> Processing...</>
                ) : (
                  <><Plus className="w-3 h-3" /> Add Devnet Funds ($1 → 1000 USDC)</>
                )}
              </button>
              {depositError && (
                <p className="text-red-500 text-xs">{depositError}</p>
              )}
            </div>
          </div>

          {/* Order Panel */}
          <div className="p-4 flex-1">
            {/* Order Type Tabs */}
            <div className="flex border-b border-[#1a1a1a] mb-4">
              {[
                { id: "market", label: "MARKET" },
                { id: "limit", label: "LIMIT" },
                { id: "stoptp", label: "STOP/TP" },
                { id: "interpolated", label: "INTERP" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setOrderTab(tab.id as any)}
                  className={`flex-1 pb-2 text-xs font-medium transition-all duration-200 ${
                    orderTab === tab.id
                      ? tab.id === "interpolated"
                        ? "text-[#2D7DFF] border-b-2 border-[#2D7DFF]"
                        : "text-white border-b-2 border-white"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Long/Short Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setSide("long")}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 press-effect ${
                  side === "long"
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/20"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a]"
                }`}
              >
                LONG
              </button>
              <button
                onClick={() => setSide("short")}
                className={`flex-1 py-2.5 rounded-lg font-medium transition-all duration-200 press-effect ${
                  side === "short"
                    ? "bg-red-500 text-white shadow-lg shadow-red-500/20"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222] border border-[#2a2a2a]"
                }`}
              >
                SHORT
              </button>
            </div>

            {/* Size Input — standard tabs */}
            {orderTab !== "interpolated" && (
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Size (collateral)</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    placeholder="0.00"
                    className={`w-full bg-[#1a1a1a] border rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-600 focus:outline-none transition-all duration-200 font-mono input-focus-ring ${
                      insufficientBalance ? "border-red-500" : "border-[#2a2a2a]"
                    }`}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">USDC</span>
                </div>
                {insufficientBalance && (
                  <p className="text-red-500 text-xs mt-1">Insufficient balance</p>
                )}
              </div>
            )}

            {/* Limit Price (for LIMIT orders) */}
            {orderTab === "limit" && (
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Limit Price</label>
                <div className="relative">
                  <input
                    type="text"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    placeholder={formatPrice(markPrice)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-600 focus:outline-none transition-all duration-200 font-mono input-focus-ring"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">USD</span>
                </div>
              </div>
            )}

            {/* Trigger Price (for STOP/TP) */}
            {orderTab === "stoptp" && (
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Trigger Price</label>
                <div className="relative">
                  <input
                    type="text"
                    value={triggerPrice}
                    onChange={(e) => setTriggerPrice(e.target.value)}
                    placeholder={formatPrice(markPrice)}
                    className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 pr-16 text-white placeholder-gray-600 focus:outline-none transition-all duration-200 font-mono input-focus-ring"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">USD</span>
                </div>
              </div>
            )}

            {/* Interpolated Entry UI */}
            {orderTab === "interpolated" && (
              <div className="mb-4 space-y-3">
                {/* Total Size */}
                <div>
                  <label className="text-gray-400 text-xs mb-1 block tracking-wider">TOTAL SIZE (COLLATERAL)</label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="decimal"
                      value={interpSize}
                      onChange={(e) => { setInterpSize(e.target.value); setInterpComplete(null) }}
                      placeholder="0.00"
                      className={`w-full bg-[#1a1a1a] border rounded-lg px-3 py-2.5 pr-14 text-white placeholder-gray-600 focus:outline-none font-mono text-sm transition-colors ${
                        interpInsufficientBalance ? "border-red-500" : "border-[#2a2a2a]"
                      }`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">USDC</span>
                  </div>
                  {interpInsufficientBalance && <p className="text-red-500 text-xs mt-1">Insufficient balance</p>}
                </div>

                {/* Entry Range */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block tracking-wider">ENTRY RANGE</label>
                  <div className="flex items-center gap-1.5">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={interpFromPrice}
                        onChange={(e) => setInterpFromPrice(e.target.value)}
                        placeholder="From"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-4 pr-2 py-2 text-white placeholder-gray-600 focus:outline-none font-mono text-xs"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                      <div className="w-3 h-px bg-[#3a3a3a]" />
                      <div className="w-1 h-1 rounded-full bg-[#3a3a3a]" />
                      <div className="w-3 h-px bg-[#3a3a3a]" />
                    </div>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={interpToPrice}
                        onChange={(e) => setInterpToPrice(e.target.value)}
                        placeholder="To"
                        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg pl-4 pr-2 py-2 text-white placeholder-gray-600 focus:outline-none font-mono text-xs"
                      />
                    </div>
                  </div>
                  {/* Mark price position indicator */}
                  {(() => {
                    const from = parseFloat(interpFromPrice.replace(',', '.'))
                    const to = parseFloat(interpToPrice.replace(',', '.'))
                    if (!from || !to || from >= to || !markPrice) return null
                    const pct = Math.max(0, Math.min(100, ((markPrice - from) / (to - from)) * 100))
                    return (
                      <div className="mt-2 relative h-1 bg-[#1a1a1a] rounded-full border border-[#2a2a2a]">
                        <div className="absolute left-0 top-0 h-full bg-[#2D7DFF]/20 rounded-full" style={{ width: `${pct}%` }} />
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#2D7DFF] border-2 border-[#0a0a0a]"
                          style={{ left: `calc(${pct}% - 4px)` }}
                        />
                        <span className="absolute -bottom-4 text-[9px] text-[#2D7DFF] font-mono" style={{ left: `calc(${pct}% - 8px)` }}>mark</span>
                      </div>
                    )
                  })()}
                </div>

                {/* Slices */}
                <div className="pt-1">
                  <label className="text-gray-400 text-xs mb-1.5 block tracking-wider">SLICES</label>
                  <div className="flex gap-1">
                    {[2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        onClick={() => setInterpSlices(n)}
                        className={`flex-1 py-1.5 text-xs font-mono rounded border transition-all duration-150 ${
                          interpSlices === n
                            ? "bg-[#2D7DFF]/15 border-[#2D7DFF] text-[#2D7DFF]"
                            : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-white"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distribution */}
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block tracking-wider">DISTRIBUTION</label>
                  <div className="flex gap-1">
                    {(["Linear", "Exponential", "Fibonacci"] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setInterpDistribution(d)}
                        className={`flex-1 py-1.5 text-xs rounded border transition-all duration-150 ${
                          interpDistribution === d
                            ? "bg-[#2D7DFF]/15 border-[#2D7DFF] text-[#2D7DFF]"
                            : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#3a3a3a] hover:text-white"
                        }`}
                      >
                        {d === "Exponential" ? "Exp" : d === "Fibonacci" ? "Fib" : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview Table */}
                {parseFloat(interpSize.replace(',', '.')) > 0 && (() => {
                  const slices = computeInterpSlices()
                  const totalCollateral = slices.reduce((s, sl) => s + sl.size, 0)
                  const totalPosition = slices.reduce((s, sl) => s + sl.position, 0)
                  const avgEntry = slices.reduce((s, sl) => s + sl.price * sl.size, 0) / totalCollateral
                  return (
                    <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
                      <table className="w-full text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#1a1a1a] text-gray-500 bg-[#0f0f0f]">
                            <th className="text-left px-2 py-1.5 font-normal">#</th>
                            <th className="text-right px-2 py-1.5 font-normal">Price</th>
                            <th className="text-right px-2 py-1.5 font-normal">Size</th>
                            <th className="text-right px-2 py-1.5 font-normal">Pos</th>
                          </tr>
                        </thead>
                        <tbody>
                          {slices.map((sl, i) => (
                            <tr key={i} className="border-b border-[#111] hover:bg-[#111] transition-colors">
                              <td className="px-2 py-1 text-gray-500">{i + 1}</td>
                              <td className="px-2 py-1 text-right text-white">${formatPrice(sl.price)}</td>
                              <td className="px-2 py-1 text-right text-gray-300">${formatAmount(sl.size)}</td>
                              <td className="px-2 py-1 text-right text-[#2D7DFF]">${formatAmount(sl.position)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t border-[#2a2a2a] bg-[#0f0f0f]">
                            <td colSpan={2} className="px-2 py-1.5 text-gray-500">
                              avg <span className="text-white">${formatPrice(avgEntry)}</span>
                            </td>
                            <td className="px-2 py-1.5 text-right text-gray-300">${formatAmount(totalCollateral)}</td>
                            <td className="px-2 py-1.5 text-right text-[#2D7DFF] font-medium">${formatAmount(totalPosition)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )
                })()}

                {/* Completion banner */}
                {interpComplete && (
                  <div className="flex items-start gap-2 p-2.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <span className="text-green-400">✓</span>
                    <p className="text-green-400 text-xs leading-relaxed">
                      Interpolated entry complete — {interpComplete.count} positions opened at avg ${formatPrice(interpComplete.avgEntry)}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Leverage Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-gray-400 text-sm">Leverage</label>
                <span className="text-white font-mono">{leverage}x</span>
              </div>
              <input
                type="range"
                min="2"
                max={maxLeverage}
                step="1"
                value={leverage}
                onChange={(e) => setLeverage(parseInt(e.target.value))}
                className="w-full h-1 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #fff ${((leverage - 2) / (maxLeverage - 2)) * 100}%, #2a2a2a ${((leverage - 2) / (maxLeverage - 2)) * 100}%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>2x</span>
                <span>{Math.round(maxLeverage / 3)}x</span>
                <span>{Math.round(maxLeverage * 2 / 3)}x</span>
                <span>{maxLeverage}x</span>
              </div>
            </div>

            {/* Submit Button */}
            {orderTab === "interpolated" && interpProgress && (
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                  <span className="font-mono">Executing slice {interpProgress.current}/{interpProgress.total}...</span>
                  <span className="font-mono">{Math.round((interpProgress.current / interpProgress.total) * 100)}%</span>
                </div>
                <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#2a2a2a]">
                  <div
                    className="h-full bg-[#2D7DFF] transition-all duration-300 rounded-full"
                    style={{ width: `${(interpProgress.current / interpProgress.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
            <button
              onClick={
                orderTab === "limit" ? handleOpenLimitOrder :
                orderTab === "interpolated" ? handleOpenInterpolated :
                handleOpenPosition
              }
              disabled={
                !isConnected ||
                isOpeningPosition ||
                (orderTab === "interpolated"
                  ? (interpInsufficientBalance || !interpSize)
                  : (insufficientBalance || !size || (orderTab === "limit" && !limitPrice))
                )
              }
              className={`w-full py-3 rounded-lg font-medium transition-all duration-200 border press-effect flex items-center justify-center gap-2 ${
                !isConnected || isOpeningPosition ||
                (orderTab === "interpolated"
                  ? (interpInsufficientBalance || !interpSize)
                  : (insufficientBalance || !size || (orderTab === "limit" && !limitPrice))
                )
                  ? "border-gray-600 text-gray-600 cursor-not-allowed"
                  : side === "long"
                    ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-white hover:shadow-lg hover:shadow-green-500/20"
                    : "border-red-500 text-red-500 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-500/20"
              }`}
            >
              {isOpeningPosition ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {orderTab === "interpolated" ? "Executing..." : orderTab === "limit" ? "Creating Order..." : "Opening..."}
                </>
              ) : !isConnected ? (
                "Connect Wallet"
              ) : orderTab === "interpolated" && interpInsufficientBalance ? (
                "Insufficient Balance"
              ) : insufficientBalance ? (
                "Insufficient Balance"
              ) : orderTab === "interpolated" ? (
                `Open ${interpSlices} ${side === "long" ? "Long" : "Short"} Orders`
              ) : orderTab === "limit" && !limitPrice ? (
                "Enter Limit Price"
              ) : (
                `${orderTab === "limit" ? "Place Limit" : "Open"} ${side === "long" ? "Long" : "Short"}`
              )}
            </button>
            
            {positionError && (
              <p className="text-red-500 text-xs mt-2">{positionError}</p>
            )}

            {/* Position Info - show when size is entered */}
            {(() => {
              // Parse size handling comma as decimal separator (European format)
              const sizeValue = parseFloat(size.replace(',', '.')) || 0
              if (sizeValue <= 0) return null
              
              const positionValue = sizeValue * leverage
              const feeValue = sizeValue * 0.005
              const liqPrice = side === "long"
                ? markPrice * (1 - 0.9 / leverage) 
                : markPrice * (1 + 0.9 / leverage)
              
              return (
                <div className="mt-4 pt-4 border-t border-[#1a1a1a] space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Collateral</span>
                    <span className="text-white font-mono">{sizeValue.toFixed(4)} USDC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Position</span>
                    <span className="text-white font-mono">{positionValue.toFixed(4)} USDC</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Entry</span>
                    <span className="text-white font-mono">${formatPrice(markPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Liq Price</span>
                    <span className="text-white font-mono">${formatPrice(liqPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Fee (0.5%)</span>
                    <span className="text-white font-mono">${feeValue.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Slippage</span>
                    <span className="text-white font-mono">~0.00%</span>
                  </div>
                </div>
              )
            })()}
          </div>


        </div>
      </div>

      {/* TP/SL Modal */}
      {tpSlModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setTpSlModal(null)}>
          <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Set {tpSlModal.type === 'tp' ? 'Take Profit' : 'Stop Loss'}
              </h3>
              <button onClick={() => setTpSlModal(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-400 text-sm mb-2">
                {tpSlModal.position.market} {tpSlModal.position.side.toUpperCase()} @ ${formatPrice(tpSlModal.position.entry_price)}
              </p>
              <p className="text-gray-500 text-xs">
                Current price: ${formatPrice(markPrice)}
              </p>
            </div>
            
            <div className="mb-4">
              <label className="text-gray-400 text-sm mb-2 block">
                {tpSlModal.type === 'tp' ? 'Take Profit Price' : 'Stop Loss Price'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={tpSlValue}
                  onChange={(e) => setTpSlValue(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-gray-500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">USD</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setTpSlModal(null)}
                className="flex-1 py-2 border border-[#2a2a2a] rounded-lg text-gray-400 hover:bg-[#1a1a1a] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTpSl}
                disabled={isSavingTpSl || !tpSlValue}
                className={`flex-1 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  tpSlModal.type === 'tp' 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isSavingTpSl ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
