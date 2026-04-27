"use client"

import { useEffect } from "react"

// Breakpoint for desktop vs mobile/tablet - parallax disabled below this
const DESKTOP_BREAKPOINT = 1024

export function LenisScroll() {
  useEffect(() => {
    // Pre-initialize CSS variables at 0 to avoid first-frame jank
    document.documentElement.style.setProperty('--hero-y', '0')
    document.documentElement.style.setProperty('--content-margin', '0')
    
    let lenis: any = null
    
    // Dynamically import lenis to avoid SSR issues
    import('lenis').then((Lenis) => {
      lenis = new Lenis.default({
        lerp: 0.05,
        smoothWheel: true,
        wheelMultiplier: 0.6,
        duration: 1.5,
      })
      
      // Start the RAF loop
      function raf(time: number) {
        if (lenis) {
          lenis.raf(time)
          requestAnimationFrame(raf)
        }
      }
      requestAnimationFrame(raf)
    }).catch(() => {
      // Silently fail if lenis doesn't load
    })
    
    // Set up scroll handler without lenis dependency
    const handleScroll = () => {
      const scroll = window.scrollY
      const isDesktop = () => window.innerWidth >= DESKTOP_BREAKPOINT
      const heroHeight = window.innerHeight

      // Disable parallax on mobile/tablet
      if (!isDesktop()) {
        document.documentElement.style.setProperty('--hero-y', '0')
        document.documentElement.style.setProperty('--content-margin', '0')
        return
      }
      
      // Only apply parallax while scrolling through hero (first 100vh)
      if (scroll <= heroHeight) {
        // Hero moves at 50% speed (slower)
        const heroY = scroll * 0.5
        document.documentElement.style.setProperty('--hero-y', String(-heroY))
        
        // Content uses negative margin (55% boost) - removes space faster
        const contentMargin = scroll * 0.55
        document.documentElement.style.setProperty('--content-margin', String(-contentMargin))
      } else {
        // After hero is scrolled past, lock both at their final values
        const finalHeroY = heroHeight * 0.5
        const finalContentMargin = heroHeight * 0.55
        document.documentElement.style.setProperty('--hero-y', String(-finalHeroY))
        document.documentElement.style.setProperty('--content-margin', String(-finalContentMargin))
      }
    }
    
    // Use regular scroll event as fallback
    window.addEventListener('scroll', handleScroll)

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null
}
