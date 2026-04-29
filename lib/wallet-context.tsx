"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface WalletContextType {
  isConnected: boolean
  walletAddress: string
  walletType: string | null
  usdcBalance: number
  solBalance: number
  connect: (walletType: string) => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

// Fetch balance from our server-side API (avoids CORS issues)
async function fetchBalanceFromAPI(address: string) {
  try {
    const response = await fetch(`/api/wallet-balance?address=${address}`)
    if (!response.ok) {
      console.error("Balance API error:", response.status)
      return null
    }
    return await response.json()
  } catch (e) {
    console.error("Balance API failed:", e)
    return null
  }
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletType, setWalletType] = useState<string | null>(null)
  const [usdcBalance, setUsdcBalance] = useState(0)
  const [solBalance, setSolBalance] = useState(0)

  // Fetch SOL and USDC balance for connected wallet via server API
  const fetchSolanaBalance = async (address: string) => {
    try {
      const data = await fetchBalanceFromAPI(address)
      console.log("Balance API response:", data)
      
      if (data) {
        if (data.solBalance !== undefined) {
          setSolBalance(data.solBalance)
        }
        if (data.usdcBalance !== undefined) {
          setUsdcBalance(data.usdcBalance)
        }
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const refreshBalance = async () => {
    if (!walletAddress) return

    try {
      // For Solana wallets, fetch SOL balance
      if (walletType === "Phantom" || walletType === "Solflare") {
        await fetchSolanaBalance(walletAddress)
      } else if (walletType === "MetaMask") {
        // For MetaMask, get ETH balance (on Ethereum)
        const ethereum = (window as any).ethereum
        if (ethereum) {
          const balanceHex = await ethereum.request({
            method: "eth_getBalance",
            params: [walletAddress, "latest"],
          })
          const balanceWei = parseInt(balanceHex, 16)
          setSolBalance(balanceWei / 1e18) // ETH balance stored in solBalance for simplicity
          
          // Get USDC balance on Ethereum (ERC-20)
          const USDC_ETH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
          const balanceOfData = `0x70a08231000000000000000000000000${walletAddress.slice(2)}`
          const usdcBalanceHex = await ethereum.request({
            method: "eth_call",
            params: [{ to: USDC_ETH, data: balanceOfData }, "latest"],
          })
          const usdcBalanceWei = parseInt(usdcBalanceHex, 16)
          setUsdcBalance(usdcBalanceWei / 1e6) // USDC has 6 decimals
        }
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  const connect = async (type: string) => {
    try {
      if (type === "Phantom") {
        const phantom = (window as any).phantom?.solana
        if (!phantom) {
          window.open("https://phantom.app/", "_blank")
          return
        }
        const response = await phantom.connect()
        const address = response.publicKey.toString()
        setWalletAddress(address)
        setWalletType("Phantom")
        setIsConnected(true)
        // Persist to localStorage for cross-component access
        localStorage.setItem('walletAddress', address)
        // Immediately fetch balance with the address directly
        fetchSolanaBalance(address)
      } else if (type === "Solflare") {
        const solflare = (window as any).solflare
        if (!solflare) {
          window.open("https://solflare.com/", "_blank")
          return
        }
        await solflare.connect()
        const address = solflare.publicKey.toString()
        setWalletAddress(address)
        setWalletType("Solflare")
        setIsConnected(true)
        // Persist to localStorage for cross-component access
        localStorage.setItem('walletAddress', address)
        // Immediately fetch balance with the address directly
        fetchSolanaBalance(address)
      } else if (type === "MetaMask") {
        const ethereum = (window as any).ethereum
        if (!ethereum || !ethereum.isMetaMask) {
          window.open("https://metamask.io/", "_blank")
          return
        }
        const accounts = await ethereum.request({ method: "eth_requestAccounts" })
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0])
          setWalletType("MetaMask")
          setIsConnected(true)
          // Persist to localStorage for cross-component access
          localStorage.setItem('walletAddress', accounts[0])
          // Immediately fetch balance
          setTimeout(() => refreshBalance(), 100)
        }
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
    }
  }

  const disconnect = () => {
    setIsConnected(false)
    setWalletAddress("")
    setWalletType(null)
    setUsdcBalance(0)
    setSolBalance(0)
    localStorage.removeItem('walletAddress')
  }

  // Refresh balance when wallet connects
  useEffect(() => {
    if (isConnected && walletAddress) {
      refreshBalance()
      // Refresh every 30 seconds
      const interval = setInterval(refreshBalance, 30000)
      return () => clearInterval(interval)
    }
  }, [isConnected, walletAddress])

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        walletAddress,
        walletType,
        usdcBalance,
        solBalance,
        connect,
        disconnect,
        refreshBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}
