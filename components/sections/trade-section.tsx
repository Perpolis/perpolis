"use client"

import { useEffect, useRef, useState } from "react"
import { Apple, Play, Smartphone, Monitor } from "lucide-react"
import { ParallaxElement } from "@/components/parallax-element"
import { useLanguage } from "@/lib/language-context"

export function TradeSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Toggle visibility based on whether element is in viewport
        setIsVisible(entry.isIntersecting)
      },
      { threshold: 0.2 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  return (
    <section ref={sectionRef} className="min-h-screen bg-[#0a0a0a] py-20 relative overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div
            className={`max-w-lg transition-all duration-1200 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-20"
            }`}
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t("tradeTitle")}
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {t("tradeDescription")}
            </p>

            {/* Download buttons */}
            
          </div>

          {/* Right Content - Phone Mockup */}
          <div
            className={`relative flex items-center justify-center transition-all duration-1200 ease-out ${
              isVisible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-20"
            }`}
            style={{ height: '600px' }}
          >
            <img
              src="/mobile-Photoroom.png"
              alt="Perpolis Mobile App"
              style={{ width: '320px', height: 'auto', paddingRight: '20px' }}
              className="drop-shadow-[0_0_60px_rgba(163,255,18,0.15)]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
