"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

// Breakpoint for desktop vs mobile/tablet - parallax disabled below this
const DESKTOP_BREAKPOINT = 1024

interface ParallaxElementProps {
  children: ReactNode
  speed?: number // Multiplier for scroll speed (0.5 = slower, 2 = faster)
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function ParallaxElement({
  children,
  speed = 0.5,
  direction = "up",
  className = "",
}: ParallaxElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(true)

  // Check screen size
  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_BREAKPOINT)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // Disable parallax on mobile/tablet
    if (!isDesktop) {
      element.style.transform = ''
      return
    }

    const handleScroll = () => {
      const rect = element.getBoundingClientRect()
      const scrollPercent = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      
      // Only apply parallax when element is in viewport
      if (scrollPercent >= 0 && scrollPercent <= 1) {
        const movement = (scrollPercent - 0.5) * 100 * speed
        
        let transform = ""
        switch (direction) {
          case "up":
            transform = `translateY(${-movement}px)`
            break
          case "down":
            transform = `translateY(${movement}px)`
            break
          case "left":
            transform = `translateX(${-movement}px)`
            break
          case "right":
            transform = `translateX(${movement}px)`
            break
        }
        
        element.style.transform = transform
      }
    }

    // Initial call
    handleScroll()

    // Throttled scroll listener
    let ticking = false
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [speed, direction, isDesktop])

  return (
    <div ref={elementRef} className={`will-change-transform ${className}`}>
      {children}
    </div>
  )
}
