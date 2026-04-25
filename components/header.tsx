"use client"

import { useState, useRef, useEffect } from "react"
import { LanguageSwitcher } from "./language-switcher"
import { TraderTierBadge } from "./larp/trader-tier-badge"
import { useLanguage } from "@/lib/language-context"

function XIcon() {
  return (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 1226.37 1226.37" xmlns="http://www.w3.org/2000/svg">
      <path d="m727.348 519.284 446.727-519.284h-105.86l-387.893 450.887-309.809-450.887h-357.328l468.492 681.821-468.492 544.549h105.866l409.625-476.152 327.181 476.152h357.328l-485.863-707.086zm-144.998 168.544-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721h-162.604l-323.311-462.446z"/>
    </svg>
  )
}

export function Header() {
  const { t } = useLanguage()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [lastActiveIndex, setLastActiveIndex] = useState<number>(2)
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number } | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)
  const [hidden, setHidden] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const navItemRefs = useRef<(HTMLElement | null)[]>([])

  // Update indicator position
  const updateIndicatorPosition = (index: number) => {
    const item = navItemRefs.current[index]
    if (item && navRef.current) {
      const navRect = navRef.current.getBoundingClientRect()
      const itemRect = item.getBoundingClientRect()
      // 4px horizontal inset on each side to match the vertical top-1/bottom-1 spacing
      const horizontalInset = 4
      setIndicatorStyle({
        left: itemRect.left - navRect.left + horizontalInset,
        width: itemRect.width - horizontalInset * 2,
      })
    }
  }

  // Handle mouse enter on nav item
  const handleMouseEnter = (index: number) => {
    setHoveredIndex(index)
    setLastActiveIndex(index)
    updateIndicatorPosition(index)
  }

  // Handle mouse leave from entire nav - return to last active
  const handleMouseLeave = () => {
    setHoveredIndex(null)
    updateIndicatorPosition(lastActiveIndex)
  }

  // Set initial indicator position to Launch App (index 2)
  useEffect(() => {
    const timer = setTimeout(() => {
      updateIndicatorPosition(2)
      requestAnimationFrame(() => {
        setIsInitialized(true)
      })
    }, 50)
    return () => clearTimeout(timer)
  }, [])

  // Recalculate indicator position when language changes (button sizes change)
  useEffect(() => {
    if (!isInitialized) return
    const timer = setTimeout(() => {
      updateIndicatorPosition(lastActiveIndex)
    }, 50)
    return () => clearTimeout(timer)
  }, [t])

  // Hide header when not at the very top
  useEffect(() => {
    const handleScroll = () => {
      setHidden(window.scrollY > 60)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 grid grid-cols-[1fr_auto_1fr] items-center px-6 py-4 lg:px-12 bg-white/5 backdrop-blur-md border-b border-white/10 transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      {/* Logo */}
      <div className="flex items-center gap-5">
        <a href="/" className="flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80">
          <img
            src="/logo.png"
            alt="Perpolis"
            width="48"
            height="48"
            className="rounded-xl"
          />
          <span className="text-xl font-semibold text-white">Perpolis</span>
        </a>
      </div>

      {/* Navigation */}
      <nav 
        ref={navRef} 
        className="hidden md:flex items-center gap-1 bg-[#1a1a1a] rounded-full p-1 relative"
        onMouseLeave={handleMouseLeave}
      >
        {/* Sliding indicator */}
        {indicatorStyle && (
          <div
            className={`absolute top-1 bottom-1 bg-[#A3FF12] rounded-full pointer-events-none ${isInitialized ? 'transition-all duration-200 ease-out' : ''}`}
            style={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
          />
        )}
        
        <a
          ref={(el) => { navItemRefs.current[0] = el }}
          href="https://x.com/perpolis"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => handleMouseEnter(0)}
          className={`relative z-10 px-4 py-2 transition-colors flex items-center ${
            (hoveredIndex ?? lastActiveIndex) === 0 ? "text-black" : "text-gray-300"
          }`}
        >
          <XIcon />
        </a>

        <a
          ref={(el) => { navItemRefs.current[1] = el }}
          href="/meme-perps"
          onMouseEnter={() => handleMouseEnter(1)}
          className={`relative z-10 px-4 py-2 text-sm transition-colors ${
            (hoveredIndex ?? lastActiveIndex) === 1 ? "text-black" : "text-gray-300 hover:text-white"
          }`}
        >
          {t("memePerps")}
        </a>

        <a
          ref={(el) => { navItemRefs.current[2] = el }}
          href="https://app.perpolis.xyz"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => handleMouseEnter(2)}
          className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors ${
            (hoveredIndex ?? lastActiveIndex) === 2 ? "text-black" : "text-gray-300 hover:text-white"
          }`}
        >
          {t("launchApp")}
        </a>
      </nav>

      {/* Right side icons */}
      <div className="flex items-center gap-3 justify-self-end">
        <TraderTierBadge />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
