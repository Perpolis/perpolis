"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { ArrowLeft, X, AlertCircle } from "lucide-react"
import "../animations.css"

interface Token {
  address: string
  symbol: string
  name: string
  logo: string
}

export default function CreateMarketPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Token[]>([])
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [collateral, setCollateral] = useState<"USDC" | "USDT" | "PYUSD">("USDC")
  const [maxLeverage, setMaxLeverage] = useState(10)
  const [tradingFee, setTradingFee] = useState(0.1)
  const [isCreating, setIsCreating] = useState(false)
  const [createError, setCreateError] = useState("")
  const [progress, setProgress] = useState(0)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  
  // Payment constants
  const PAYMENT_ADDRESS = process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || ""
  const PAYMENT_AMOUNT = 0.3
  const searchTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search-token?q=${encodeURIComponent(searchQuery)}`)
        const data = await response.json()
        setSearchResults(data.tokens || [])
        setShowDropdown(true)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  const selectToken = (token: Token) => {
    setSelectedToken(token)
    setSearchQuery(token.symbol)
    setShowDropdown(false)
    setCreateError("")
  }

  const clearSelection = () => {
    setSelectedToken(null)
    setSearchQuery("")
    setSearchResults([])
    setCreateError("")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const calculateRevenue = (dailyVolume: number) => {
    const dailyRev = dailyVolume * (tradingFee / 100) * 0.1
    const monthlyRev = dailyRev * 30
    return { daily: dailyRev, monthly: monthlyRev }
  }

  // Step 1: Show payment modal
  const handleCreateMarket = () => {
    if (!selectedToken) return
    setCreateError("")
    setShowPaymentModal(true)
  }

  // Step 2: Copy address to clipboard
  const copyAddress = () => {
    navigator.clipboard.writeText(PAYMENT_ADDRESS)
  }

  // Step 3: Verify payment and create market
  const handleVerifyPayment = async () => {
    if (!selectedToken) return

    setIsVerifying(true)
    setCreateError("")

    try {
      // Get wallet address from localStorage
      const walletAddress = localStorage.getItem('walletAddress') || 'anonymous'

      // Verify payment by checking recent transactions to our address
      const response = await fetch(`/api/verify-payment?address=${PAYMENT_ADDRESS}&amount=${PAYMENT_AMOUNT}`)
      const verifyData = await response.json()

      if (!verifyData.verified) {
        throw new Error("Payment not found. Please make sure you sent exactly 0.3 SOL to the address shown.")
      }

      setShowPaymentModal(false)
      setIsCreating(true)
      setProgress(50)

      // Fetch token price from Birdeye
      let currentPrice = 0
      try {
        const priceResponse = await fetch(`/api/token-price?address=${selectedToken.address}`)
        const priceData = await priceResponse.json()
        currentPrice = priceData.price || 0
      } catch (e) {
        console.log('Could not fetch price, using 0')
      }

      setProgress(80)

      // Create the market via API
      const createResponse = await fetch('/api/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creator_wallet: walletAddress,
          token_address: selectedToken.address,
          token_symbol: selectedToken.symbol,
          token_name: selectedToken.name,
          token_logo: selectedToken.logo,
          collateral: collateral,
          max_leverage: maxLeverage,
          trading_fee: tradingFee,
          current_price: currentPrice,
          payment_signature: verifyData.signature
        })
      })

      const data = await createResponse.json()

      setProgress(100)

      if (!createResponse.ok) {
        throw new Error(data.error || 'Failed to create market')
      }

      // Success! Redirect to the new market
      setTimeout(() => {
        window.location.href = `/meme-perps/${selectedToken.symbol.toLowerCase()}`
      }, 500)

    } catch (error: any) {
      setIsVerifying(false)
      setIsCreating(false)
      setCreateError(error.message || "Payment verification failed. Please try again.")
    }
  }

  const rev100k = calculateRevenue(100000)
  const rev1m = calculateRevenue(1000000)

  // Calculate slider fill percentages
  const leverageFill = ((maxLeverage - 2) / (20 - 2)) * 100
  const feeFill = ((tradingFee - 0.03) / (1 - 0.03)) * 100

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Header />

      {/* Main Content - pt-24 to account for fixed header */}
      <div className="max-w-2xl mx-auto px-6 pt-24 pb-8">
        {/* Back Link - aligned with card */}
        <Link
          href="/meme-perps"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Markets
        </Link>
        <div className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden card-entrance hover-glow">
          {/* Title */}
          <div className="px-6 py-4 border-b border-[#1a1a1a]">
            <h1 className="text-white font-semibold tracking-wide">CREATE MARKET</h1>
          </div>

          <div className="p-6 space-y-6">
            {/* Token Search */}
            <div ref={searchRef} className="relative">
              <label className="text-gray-400 text-sm mb-2 block">Token</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (selectedToken && e.target.value !== selectedToken.symbol) {
                      setSelectedToken(null)
                    }
                  }}
                  onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
                  placeholder="Search token or paste mint address..."
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none transition-all duration-200 font-mono input-focus-ring"
                />
                {selectedToken && (
                  <button
                    onClick={clearSelection}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Search Dropdown - static position to expand container */}
              {showDropdown && searchResults.length > 0 && (
                <div className="w-full mt-3 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg overflow-hidden dropdown-enter">
                  {searchResults.map((token, index) => (
                    <button
                      key={token.address}
                      onClick={() => selectToken(token)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#1a1a1a] transition-all duration-200 text-left hover-scale ${
                        index !== 0 ? "border-t border-[#1a1a1a]" : ""
                      }`}
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className="w-8 h-8 rounded-full bg-[#1a1a1a]"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${token.symbol}&background=1a1a1a&color=fff`
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-white font-medium">{token.symbol}</span>
                        <span className="text-gray-500 ml-2 text-sm">{token.name}</span>
                      </div>
                      <span className="text-gray-600 font-mono text-sm">
                        {formatAddress(token.address)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {isSearching && (
                <div className="absolute z-50 w-full mt-1 bg-[#111] border border-[#2a2a2a] rounded-lg p-4 text-center">
                  <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-white rounded-full mx-auto" />
                </div>
              )}
            </div>

            {/* Selected Token Display */}
            {selectedToken && (
              <div className="flex items-center gap-3 py-2">
                <img
                  src={selectedToken.logo}
                  alt={selectedToken.symbol}
                  className="w-8 h-8 rounded-full bg-[#1a1a1a]"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${selectedToken.symbol}&background=1a1a1a&color=fff`
                  }}
                />
                <span className="text-white font-medium">{selectedToken.symbol}</span>
                <span className="text-gray-500">({selectedToken.name})</span>
                <span className="text-gray-600 font-mono text-sm">
                  {formatAddress(selectedToken.address)}
                </span>
              </div>
            )}

            {/* Parameters Section */}
            {selectedToken && (
              <>
                <div className="border-t border-[#1a1a1a] pt-6">
                  <h2 className="text-gray-400 text-sm font-medium mb-4 tracking-wide">PARAMETERS</h2>

                  {/* Collateral Selection */}
                  <div className="mb-6">
                    <label className="text-gray-400 text-sm mb-3 block">Collateral</label>
                    <div className="grid grid-cols-3 gap-3">
                      {(["USDC", "USDT", "PYUSD"] as const).map((c) => (
                        <button
                          key={c}
                          onClick={() => setCollateral(c)}
                          className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200 press-effect ${
                            collateral === c
                              ? "border-[#A3FF12] bg-[#A3FF12]/10 text-[#A3FF12]"
                              : "border-[#2a2a2a] text-gray-400 hover:border-gray-500 hover:bg-[#1a1a1a]"
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            c === "USDC" ? "bg-[#2775CA]" : c === "USDT" ? "bg-[#26A17B]" : "bg-[#0052FF]"
                          }`}>
                            $
                          </div>
                          {c}
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mt-2">
                      All traders on this market will use {collateral} as collateral.
                    </p>
                  </div>

                  {/* Max Leverage Slider */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-gray-400 text-sm">Max Leverage</label>
                      <span className="text-white font-mono">{maxLeverage}x</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="2"
                        max="20"
                        value={maxLeverage}
                        onChange={(e) => setMaxLeverage(parseInt(e.target.value))}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10"
                        style={{
                          background: `linear-gradient(to right, #A3FF12 0%, #A3FF12 ${leverageFill}%, #2a2a2a ${leverageFill}%, #2a2a2a 100%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-gray-600 text-xs mt-1">
                      <span>2x</span>
                      <span>20x</span>
                    </div>
                  </div>

                  {/* Trading Fee Slider */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-gray-400 text-sm">Trading Fee</label>
                      <span className="text-white font-mono">{tradingFee.toFixed(2)}%</span>
                    </div>
                    <div className="relative">
                      <input
                        type="range"
                        min="0.03"
                        max="1"
                        step="0.01"
                        value={tradingFee}
                        onChange={(e) => setTradingFee(parseFloat(e.target.value))}
                        className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer relative z-10"
                        style={{
                          background: `linear-gradient(to right, #A3FF12 0%, #A3FF12 ${feeFill}%, #2a2a2a ${feeFill}%, #2a2a2a 100%)`
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-gray-600 text-xs mt-1">
                      <span>0.03%</span>
                      <span>1.00%</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Section */}
                <div className="border-t border-[#1a1a1a] pt-6">
                  <h2 className="text-gray-400 text-sm font-medium mb-3 tracking-wide">YOUR REVENUE</h2>
                  <p className="text-gray-500 text-sm mb-4">
                    You earn 10% of all trading fees on this market.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">At $100K daily volume</span>
                      <span className="text-white font-mono">
                        ${rev100k.daily.toFixed(0)}/day (${rev100k.monthly.toFixed(0)}/mo)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">At $1M daily volume</span>
                      <span className="text-white font-mono">
                        ${rev1m.daily.toFixed(0)}/day (${rev1m.monthly.toFixed(0)}/mo)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cost */}
                <div className="flex items-center justify-between py-4">
                  <span className="text-gray-400">Cost</span>
                  <span className="text-white font-mono">0.3 SOL</span>
                </div>

                {/* Oracle Notice or Loading State */}
                {isCreating ? (
                  <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="animate-spin w-5 h-5 border-2 border-gray-600 border-t-[#A3FF12] rounded-full" />
                      <span className="text-white font-mono">Waiting for price feed...</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">
                      The cranker is picking up your new oracle and feeding the first price. This usually takes 30-60 seconds.
                    </p>
                    <div className="w-full h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#A3FF12] transition-all duration-100"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                ) : createError ? (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 font-medium mb-1">Market Creation Failed</p>
                        <p className="text-red-400/80 text-sm">{createError}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#A3FF12]/10 border border-[#A3FF12]/30 rounded-lg p-4">
                    <p className="text-[#A3FF12] text-sm">
                      No oracle exists for this token yet. One will be created automatically - the cranker starts feeding prices within ~60 seconds.
                    </p>
                  </div>
                )}

                {/* Create Button */}
                <button
                  onClick={handleCreateMarket}
                  disabled={isCreating}
                  className={`w-full py-4 rounded-lg font-medium transition-all duration-200 border press-effect ${
                    isCreating
                      ? "border-gray-600 text-gray-600 cursor-not-allowed"
                      : "border-white text-white hover:bg-white hover:text-black hover-lift"
                  }`}
                >
                  {isCreating ? "Creating Market..." : "Create Market"}
                </button>
              </>
            )}

            {/* Initial State - No Token Selected */}
            {!selectedToken && (
              <button
                disabled
                className="w-full py-4 rounded-lg font-medium border border-[#2a2a2a] text-gray-600 cursor-not-allowed"
              >
                Select a Token
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111] border border-[#2a2a2a] rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white text-lg font-semibold">Payment Required</h2>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Send exactly <span className="text-white font-mono font-bold">0.3 SOL</span> to the address below to create your market.
            </p>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-lg">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=solana:${PAYMENT_ADDRESS}?amount=${PAYMENT_AMOUNT}`}
                  alt="Payment QR Code"
                  className="w-[180px] h-[180px]"
                />
              </div>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="text-gray-500 text-xs mb-2 block">Wallet Address</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 font-mono text-sm text-white break-all">
                  {PAYMENT_ADDRESS}
                </div>
                <button
                  onClick={copyAddress}
                  className="px-3 py-2.5 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg text-white text-sm transition-colors"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="text-gray-500 text-xs mb-2 block">Amount</label>
              <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-2.5 font-mono text-white">
                0.3 SOL
              </div>
            </div>

            {/* Error Message */}
            {createError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-red-400 text-sm">{createError}</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className={`w-full py-3 rounded-lg font-medium transition-all ${
                isVerifying
                  ? "bg-[#2a2a2a] text-gray-500 cursor-not-allowed"
                  : "bg-[#A3FF12] text-black hover:bg-[#A3FF12]/90"
              }`}
            >
              {isVerifying ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-gray-500 border-t-white rounded-full animate-spin" />
                  Verifying Payment...
                </span>
              ) : (
                "I've Sent the Payment"
              )}
            </button>

            <p className="text-gray-500 text-xs text-center mt-4">
              After sending, click the button above to verify your payment.
            </p>
          </div>
        </div>
      )}

      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #A3FF12;
          margin-top: -4px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 2px solid #A3FF12;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 4px;
        }
        input[type="range"]::-moz-range-track {
          height: 8px;
          border-radius: 4px;
        }
      `}</style>
    </div>
  )
}
