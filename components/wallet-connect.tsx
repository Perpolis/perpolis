"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/wallet-context"
import { X, ChevronDown, Wallet, ExternalLink, Copy, Check } from "lucide-react"

interface WalletOption {
  name: string
  icon: string
  detected: boolean
}

const walletOptions: WalletOption[] = [
  {
    name: "Phantom",
    icon: "/wallets/phantom.svg",
    detected: true,
  },
  {
    name: "Solflare",
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 50 50'%3E%3Crect fill='%23ffef46' width='50' height='50' rx='12' ry='12'/%3E%3Cpath fill='%2302050a' d='M24.23,26.42l2.46-2.38,4.59,1.5c3.01,1,4.51,2.84,4.51,5.43,0,1.96-.75,3.26-2.25,4.93l-.46.5.17-1.17c.67-4.26-.58-6.09-4.72-7.43l-4.3-1.38h0ZM18.05,11.85l12.52,4.17-2.71,2.59-6.51-2.17c-2.25-.75-3.01-1.96-3.3-4.51v-.08h0ZM17.3,33.06l2.84-2.71,5.34,1.75c2.8.92,3.76,2.13,3.46,5.18l-11.65-4.22h0ZM13.71,20.95c0-.79.42-1.54,1.13-2.17.75,1.09,2.05,2.05,4.09,2.71l4.42,1.46-2.46,2.38-4.34-1.42c-2-.67-2.84-1.67-2.84-2.96M26.82,42.87c9.18-6.09,14.11-10.23,14.11-15.32,0-3.38-2-5.26-6.43-6.72l-3.34-1.13,9.14-8.77-1.84-1.96-2.71,2.38-12.81-4.22c-3.97,1.29-8.97,5.09-8.97,8.89,0,.42.04.83.17,1.29-3.3,1.88-4.63,3.63-4.63,5.8,0,2.05,1.09,4.09,4.55,5.22l2.75.92-9.52,9.14,1.84,1.96,2.96-2.71,14.73,5.22h0Z'/%3E%3C/svg%3E",
    detected: true,
  },
  {
    name: "MetaMask",
    icon: "/wallets/metamask.svg",
    detected: true,
  },
]

interface WalletConnectProps {
  className?: string
}

export function WalletConnect({ className = "" }: WalletConnectProps) {
  const router = useRouter()
  const { isConnected, walletAddress, connect, disconnect } = useWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  // Fetch the user's demo (Devnet) USDC balance — same number the trading
  // panel uses. Shown here so the dropdown is consistent with the header.
  const [demoBalance, setDemoBalance] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!walletAddress) {
      setDemoBalance(0)
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const res = await fetch(`/api/demo-balance?wallet=${walletAddress}`)
        const data = await res.json()
        if (!cancelled) setDemoBalance(Number(data?.balance) || 0)
      } catch {
        if (!cancelled) setDemoBalance(0)
      }
    }
    load()
    // Refresh whenever dropdown opens / wallet changes.
    return () => { cancelled = true }
  }, [walletAddress, isDropdownOpen])

  // For portal - ensure we're on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Update dropdown position when opened
  const handleToggleDropdown = () => {
    if (!isDropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right
      })
    }
    setIsDropdownOpen(!isDropdownOpen)
  }

  const handleConnectWallet = async (walletName: string) => {
    await connect(walletName)
    setIsModalOpen(false)
  }

  const handleDisconnect = () => {
    disconnect()
    setIsDropdownOpen(false)
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const abbreviateAddress = (address: string) => {
    if (address.length <= 10) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* Connect/Connected Button */}
      {isConnected ? (
        <div className={`relative ${className}`}>
          <button
            ref={buttonRef}
            onClick={handleToggleDropdown}
            className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-white hover:bg-[#222] transition-colors"
          >
            <div className="w-2 h-2 rounded-full bg-green-400" />
            <span className="font-mono text-sm">{abbreviateAddress(walletAddress)}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Dropdown Menu - rendered via portal */}
          {mounted && isDropdownOpen && createPortal(
            <div 
              ref={dropdownRef}
              className="fixed w-64 bg-[#111] border border-[#2a2a2a] rounded-xl shadow-2xl overflow-hidden"
              style={{ 
                zIndex: 99998,
                top: dropdownPosition.top,
                right: dropdownPosition.right
              }}
            >
              {/* Full Address */}
              <div className="px-4 py-3 border-b border-[#2a2a2a] bg-[#111]">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-mono truncate flex-1">
                    {walletAddress}
                  </span>
                  <button
                    onClick={copyAddress}
                    className="ml-2 p-1 text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                {/* Devnet (demo) balance — matches the header pill */}
                <div className="mt-2 pt-2 border-t border-[#2a2a2a]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Devnet Balance</span>
                    <span className="text-white font-mono">{(Number(demoBalance) || 0).toFixed(2)} USDC</span>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2 bg-[#111]">
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false)
                    router.push("/meme-perps?tab=positions")
                  }}
                  className="w-full px-4 py-2.5 text-left text-white hover:bg-[#222] transition-colors flex items-center gap-3 bg-[#111]"
                >
                  <Wallet className="w-4 h-4 text-gray-400" />
                  My Positions
                </button>
                <button 
                  onClick={() => {
                    setIsDropdownOpen(false)
                    router.push("/meme-perps?tab=markets")
                  }}
                  className="w-full px-4 py-2.5 text-left text-white hover:bg-[#222] transition-colors flex items-center gap-3 bg-[#111]"
                >
                  <ExternalLink className="w-4 h-4 text-gray-400" />
                  My Markets
                </button>
              </div>

              {/* Disconnect */}
              <div className="border-t border-[#2a2a2a] py-2 bg-[#111]">
                <button
                  onClick={handleDisconnect}
                  className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-[#222] transition-colors bg-[#111]"
                >
                  Disconnect
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 bg-[#A3FF12] hover:bg-[#A3FF12]/80 rounded-xl text-black font-semibold transition-colors ${className}`}
        >
          <Wallet className="w-4 h-4" />
          Connect Wallet
        </button>
      )}

      {/* Connection Modal - rendered via portal to body */}
      {mounted && isModalOpen && createPortal(
        <div className="fixed inset-0" style={{ zIndex: 99999 }}>
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal Container */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* Modal */}
            <div className="relative w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Header */}
              <div className="px-6 pt-8 pb-6 text-center bg-[#111]">
                <h2 className="text-2xl font-semibold text-white mb-2">
                  Connect a wallet on
                </h2>
                <p className="text-2xl font-semibold text-white">
                  Solana to continue
                </p>
              </div>

              {/* Wallet Options */}
              <div className="px-4 pb-6 bg-[#111]">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.name}
                    onClick={() => handleConnectWallet(wallet.name)}
                    className="w-full flex items-center justify-between px-4 py-4 hover:bg-[#222] transition-colors border-t border-[#2a2a2a] first:border-t-0 bg-[#111]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#2a2a2a] flex items-center justify-center overflow-hidden">
                        <img
                          src={wallet.icon}
                          alt={wallet.name}
                          className="w-6 h-6"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      </div>
                      <span className="text-white font-medium">{wallet.name}</span>
                    </div>
                    {wallet.detected && (
                      <span className="text-gray-500 text-sm">Detected</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
