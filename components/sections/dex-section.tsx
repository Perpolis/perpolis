"use client"

import React, { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"

// Breakpoint for desktop vs mobile/tablet
const DESKTOP_BREAKPOINT = 1024

export function DexSection() {
  const { t } = useLanguage()
  const [isDesktop, setIsDesktop] = useState(true)
  const sceneRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)
  const cardLtRef = useRef<HTMLDivElement>(null)
  const cardLbRef = useRef<HTMLDivElement>(null)
  const cardRtRef = useRef<HTMLDivElement>(null)
  const cardRbRef = useRef<HTMLDivElement>(null)

  // Check screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Desktop scroll animation
  useEffect(() => {
    if (!isDesktop) return

    const scene = sceneRef.current
    const title = titleRef.current
    const deck = deckRef.current
    const cardLt = cardLtRef.current
    const cardLb = cardLbRef.current
    const cardRt = cardRtRef.current
    const cardRb = cardRbRef.current

    if (!scene || !title || !deck || !cardLt || !cardLb || !cardRt || !cardRb) return

    // Set initial states - deck very large and centered, title hidden, cards hidden
    title.style.opacity = '0'
    title.style.transform = 'translateY(30px)'
    deck.style.transform = 'scale(1.6) translateY(0px)'
    deck.style.transformOrigin = 'center center'
    
    cardLt.style.opacity = '0'
    cardLt.style.transform = 'translateX(80px) translateY(30px)'
    cardLb.style.opacity = '0'
    cardLb.style.transform = 'translateX(80px) translateY(-30px)'
    cardRt.style.opacity = '0'
    cardRt.style.transform = 'translateX(-80px) translateY(30px)'
    cardRb.style.opacity = '0'
    cardRb.style.transform = 'translateX(-80px) translateY(-30px)'

    const handleScroll = () => {
      const rect = scene.getBoundingClientRect()
      const windowHeight = window.innerHeight
      
      const sectionHeight = rect.height - windowHeight
      const scrolled = -rect.top
      const progress = Math.max(0, Math.min(1, scrolled / sectionHeight))

      // Phase A: Title appears + Deck shrinks (0% to 40% progress)
      const phase1Progress = Math.min(progress / 0.40, 1)
      
      title.style.opacity = String(phase1Progress)
      title.style.transform = `translateY(${30 * (1 - phase1Progress)}px)`
      
      const deckScale = 1.6 - (phase1Progress * 0.5)
      const deckY = 0 - (phase1Progress * 30)
      deck.style.transform = `scale(${deckScale}) translateY(${deckY}px)`

      // Phase B: Cards appear (40% to 100% progress)
      const topCardsStart = 0.40
      const topCardsEnd = 0.75
      const topProgress = Math.max(0, Math.min(1, (progress - topCardsStart) / (topCardsEnd - topCardsStart)))
      
      const bottomCardsStart = 0.50
      const bottomCardsEnd = 0.90
      const bottomProgress = Math.max(0, Math.min(1, (progress - bottomCardsStart) / (bottomCardsEnd - bottomCardsStart)))

      cardLt.style.opacity = String(topProgress)
      cardLt.style.transform = `translateX(${80 * (1 - topProgress)}px) translateY(${30 * (1 - topProgress)}px)`
      
      cardRt.style.opacity = String(topProgress)
      cardRt.style.transform = `translateX(${-80 * (1 - topProgress)}px) translateY(${30 * (1 - topProgress)}px)`
      
      cardLb.style.opacity = String(bottomProgress)
      cardLb.style.transform = `translateX(${80 * (1 - bottomProgress)}px) translateY(${-30 * (1 - bottomProgress)}px)`
      
      cardRb.style.opacity = String(bottomProgress)
      cardRb.style.transform = `translateX(${-80 * (1 - bottomProgress)}px) translateY(${-30 * (1 - bottomProgress)}px)`
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [isDesktop])

  // Mobile/Tablet - simple static layout
  if (!isDesktop) {
    return (
      <section className="relative bg-[#0a0a0a] py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white text-center mb-8 md:mb-12 leading-tight text-balance">
            {t("dexTitle")}
          </h2>
          
          <div className="flex justify-center">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl w-full max-w-[95vw] bg-[#0d1117]">
              <img 
                src="/graph.png" 
                alt="Perpolis Trading Platform"
                className="w-full h-auto object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Desktop - full animation with cards
  return (
    <section 
      ref={sceneRef}
      className="deckScene relative bg-[#0a0a0a]"
      style={{ height: '250vh' }}
    >
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="container mx-auto px-6">
          <h2 
            ref={titleRef}
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-20 leading-tight text-balance max-w-5xl mx-auto"
          >
            {t("dexTitle")}
          </h2>

          <div className="relative flex items-center justify-center max-w-[1400px] mx-auto">
            {/* Left Feature Cards - fixed distance from center */}
            <div className="flex absolute left-0 flex-col gap-4 md:gap-6 z-0">
              <div ref={cardLtRef} className="card--lt">
                <FeatureCard icon={<LowFeesIcon />} title={t("lowFees")} />
              </div>
              <div ref={cardLbRef} className="card--lb">
                <FeatureCard icon={<MinimalSlippageIcon />} title={t("minimalSlippage")} />
              </div>
            </div>

            {/* Center - Trading Platform (Deck) - fixed margins */}
            <div ref={deckRef} className="deck relative z-10 mx-[220px]">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-[#0d1117]">
                <img 
                  src="/graph.png" 
                  alt="Perpolis Trading Platform"
                  className="w-[280px] sm:w-[380px] md:w-[480px] lg:w-[600px] xl:w-[700px] h-auto object-contain rounded-2xl"
                />
              </div>
            </div>

            {/* Right Feature Cards - fixed distance from center */}
            <div className="flex absolute right-0 flex-col gap-4 md:gap-6 z-0">
              <div ref={cardRtRef} className="card--rt">
                <FeatureCard icon={<SelfCustodyIcon />} title={t("selfCustody")} />
              </div>
              <div ref={cardRbRef} className="card--rb">
                <FeatureCard icon={<LightningIcon />} title={t("lightningFast")} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FeatureCard({
  icon,
  title,
}: {
  icon: React.ReactNode
  title: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 md:gap-4 w-[100px] h-[90px] sm:w-[140px] sm:h-[120px] md:w-[180px] md:h-[140px] xl:w-[200px] xl:h-[160px] bg-[#101010] rounded-xl md:rounded-2xl p-3 md:p-5">
      <div className="w-6 h-6 md:w-8 md:h-8 xl:w-10 xl:h-10 flex items-center justify-center text-[#22fd73]">
        {icon}
      </div>
      <span className="text-white text-xs md:text-sm text-center leading-tight">{title}</span>
    </div>
  )
}

function LowFeesIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 6.25V33.75M16.25 33.75H23.75M8.75 13.75L31.25 8.75M3.75 26.25C3.75 29.016 6.875 30 8.75 30C10.625 30 13.75 29.016 13.75 26.25L8.75 13.75L3.75 26.25ZM26.25 21.25C26.25 24.016 29.375 25 31.25 25C33.125 25 36.25 24.016 36.25 21.25L31.25 8.75L26.25 21.25Z"
        stroke="#A3FF12"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MinimalSlippageIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" className="h-10 w-10">
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M15 18.75c6.904 0 12.5-2.518 12.5-5.625S21.904 7.5 15 7.5 2.5 10.018 2.5 13.125 8.096 18.75 15 18.75"></path>
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M2.5 13.125v6.25C2.5 22.485 8.094 25 15 25s12.5-2.516 12.5-5.625v-6.25M10 18.281v6.25"></path>
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M27.5 15.11c5.703.53 10 2.796 10 5.515 0 3.11-5.594 5.625-12.5 5.625-3.062 0-5.875-.5-8.047-1.312"></path>
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M12.5 24.89v1.985c0 3.11 5.594 5.625 12.5 5.625s12.5-2.516 12.5-5.625v-6.25M30 25.781v6.25M20 18.281v13.75"></path>
    </svg>
  )
}

function SelfCustodyIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" className="h-10 w-10">
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M14.563 19.188A11 11 0 0 1 13.75 15 11.25 11.25 0 1 1 25 26.25a11 11 0 0 1-4.187-.812L18.75 27.5H15v3.75h-3.75V35H5v-6.25z"></path>
      <path fill="#A3FF12" stroke="#A3FF12" strokeWidth="2.4" d="M28.125 10.575a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"></path>
    </svg>
  )
}

function LightningIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" className="h-10 w-10">
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M11.25 15.625H5c-.69 0-1.25.56-1.25 1.25v6.25c0 .69.56 1.25 1.25 1.25h6.25c.69 0 1.25-.56 1.25-1.25v-6.25c0-.69-.56-1.25-1.25-1.25M33.75 6.25h-7.5c-.69 0-1.25.56-1.25 1.25V15c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V7.5c0-.69-.56-1.25-1.25-1.25M33.75 23.75h-7.5c-.69 0-1.25.56-1.25 1.25v7.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V25c0-.69-.56-1.25-1.25-1.25M12.5 20h6.25"></path>
      <path stroke="#A3FF12" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M25 28.75h-2.5A3.734 3.734 0 0 1 18.75 25V15a3.736 3.736 0 0 1 3.75-3.75H25"></path>
    </svg>
  )
}
