"use client"

import { useRef, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"

export function FeaturesSection() {
  const { t } = useLanguage()
  
  const features = [
    {
      title: t("ultraDeepLiquidity"),
      description: t("ultraDeepDesc"),
      icon: <LiquidityIcon />,
    },
    {
      title: t("highPerformance"),
      description: t("highPerformanceDesc"),
      icon: <PerformanceIcon />,
    },
    {
      title: t("oneAppUnlimited"),
      description: t("oneAppDesc"),
      icon: <AppIcon />,
    },
  ]

  return (
    <section className="min-h-screen bg-[#0a0a0a] py-20">
      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {t("featuresTitle")}
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card group relative rounded-3xl p-[1.5px] transition-all duration-600 ease-out"
            >
              <div className="relative overflow-hidden rounded-[22.5px]">
                <div className="flex h-[500px] lg:h-[513px] w-full flex-col justify-between rounded-3xl bg-[#101010] p-8 lg:p-6 transition-all duration-600 ease-out group-hover:bg-black">
                  <div className="flex flex-col gap-4 text-center">
                    <h3 className="text-2xl font-medium leading-[1.5] text-[#929292] group-hover:text-white transition-colors duration-600 ease-out">
                      {feature.title}
                    </h3>
                    <p className="text-base font-normal leading-[1.5] text-[#929292] group-hover:text-white transition-colors duration-600 ease-out">
                      {feature.description}
                    </p>
                  </div>

                  <div className="flex h-[240px] w-[240px] items-center justify-center self-center transition-all duration-600 ease-out">
                    {feature.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function LiquidityIcon() {
  const ellipseRefs = useRef<(SVGEllipseElement | null)[]>([])
  const animationsRef = useRef<Animation[]>([])

  useEffect(() => {
    // Start animations immediately on mount
    ellipseRefs.current.forEach((ellipse, index) => {
      if (!ellipse) return
      
      const animation = ellipse.animate(
        [
          { transform: 'translateY(0px)' },
          { transform: 'translateY(-8px)' },
          { transform: 'translateY(0px)' }
        ],
        {
          duration: 1800,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: index * 150
        }
      )
      
      animationsRef.current[index] = animation
    })

    // Cleanup on unmount
    return () => {
      animationsRef.current.forEach((animation) => {
        if (animation) {
          animation.cancel()
        }
      })
    }
  }, [])

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse ref={(el) => { ellipseRefs.current[0] = el }} cx="120" cy="180" rx="70" ry="20" stroke="#A3FF12" strokeWidth="3" fill="none" />
      <ellipse ref={(el) => { ellipseRefs.current[1] = el }} cx="120" cy="156" rx="70" ry="20" stroke="#A3FF12" strokeWidth="3" fill="none" />
      <ellipse ref={(el) => { ellipseRefs.current[2] = el }} cx="120" cy="132" rx="70" ry="20" stroke="#A3FF12" strokeWidth="3" fill="none" />
      <ellipse ref={(el) => { ellipseRefs.current[3] = el }} cx="120" cy="108" rx="70" ry="20" stroke="#A3FF12" strokeWidth="3" fill="none" />
      <ellipse cx="120" cy="84" rx="70" ry="20" stroke="#444" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      <ellipse cx="120" cy="60" rx="70" ry="20" stroke="#333" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
    </svg>
  )
}

function PerformanceIcon() {
  const dotRefs = useRef<(SVGCircleElement | null)[]>([])
  const animationsRef = useRef<Animation[]>([])

  useEffect(() => {
    // Start animations immediately on mount
    dotRefs.current.forEach((dot, index) => {
      if (!dot) return
      
      const animation = dot.animate(
        [
          { transform: 'translateX(0px)', opacity: 1 },
          { transform: 'translateX(40px)', opacity: 0 },
          { transform: 'translateX(0px)', opacity: 1 }
        ],
        {
          duration: 1500,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: index * 300
        }
      )
      
      animationsRef.current[index] = animation
    })

    // Cleanup on unmount
    return () => {
      animationsRef.current.forEach((animation) => {
        if (animation) {
          animation.cancel()
        }
      })
    }
  }, [])

  return (
    <svg width="240" height="120" viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle ref={(el) => { dotRefs.current[0] = el }} cx="30" cy="60" r="18" stroke="#444" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      <circle ref={(el) => { dotRefs.current[1] = el }} cx="70" cy="60" r="18" stroke="#444" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      <circle ref={(el) => { dotRefs.current[2] = el }} cx="110" cy="60" r="18" fill="#A3FF12" />
      <circle ref={(el) => { dotRefs.current[3] = el }} cx="150" cy="60" r="18" stroke="#444" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      <circle ref={(el) => { dotRefs.current[4] = el }} cx="190" cy="60" r="18" stroke="#444" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
    </svg>
  )
}

function SecurityIcon() {
  const groupRef = useRef<SVGGElement>(null)
  const animationRef = useRef<Animation | null>(null)

  useEffect(() => {
    const startAnimation = () => {
      if (!groupRef.current) return
      
      animationRef.current = groupRef.current.animate(
        [
          { transform: 'rotate(0deg)' },
          { transform: 'rotate(360deg)' }
        ],
        {
          duration: 3000,
          iterations: Infinity,
          easing: 'linear'
        }
      )
    }

    const stopAnimation = () => {
      if (animationRef.current && groupRef.current) {
        animationRef.current.commitStyles()
        animationRef.current.cancel()
        
        groupRef.current.animate(
          [
            { transform: groupRef.current.style.transform || 'rotate(0deg)' },
            { transform: 'rotate(0deg)' }
          ],
          {
            duration: 1500,
            easing: 'cubic-bezier(0.33, 1, 0.68, 1)',
            fill: 'forwards'
          }
        )
        animationRef.current = null
      }
    }

    const card = groupRef.current?.closest('.feature-card')
    if (card) {
      card.addEventListener('mouseenter', startAnimation)
      card.addEventListener('mouseleave', stopAnimation)
      
      return () => {
        card.removeEventListener('mouseenter', startAnimation)
        card.removeEventListener('mouseleave', stopAnimation)
        stopAnimation()
      }
    }
  }, [])

  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g ref={groupRef} style={{ transformOrigin: '120px 140px' }}>
        <path d="M80 180L120 100L160 180H80Z" stroke="#A3FF12" strokeWidth="3" fill="none" />
        <path d="M100 140L140 140L120 100" fill="#A3FF12" />
        <path d="M110 170L150 90L190 170H110Z" stroke="white" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      </g>
    </svg>
  )
}

function AppIcon() {
  const barRefs = useRef<(SVGRectElement | null)[]>([])
  const animationsRef = useRef<Animation[]>([])

  useEffect(() => {
    // Start animations immediately on mount
    barRefs.current.forEach((bar, index) => {
      if (!bar) return
      
      const animation = bar.animate(
        [
          { width: '88px' },
          { width: '44px' },
          { width: '88px' }
        ],
        {
          duration: 1500,
          iterations: Infinity,
          easing: 'ease-in-out',
          delay: index * 300
        }
      )
      
      animationsRef.current[index] = animation
    })

    // Cleanup on unmount
    return () => {
      animationsRef.current.forEach((animation) => {
        if (animation) {
          animation.cancel()
        }
      })
    }
  }, [])

  return (
    <svg width="160" height="240" viewBox="0 0 160 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="20" y="20" width="120" height="200" rx="16" stroke="white" strokeWidth="3" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12]" />
      <rect x="36" y="60" width="88" height="20" rx="4" fill="#A3FF12" />
      <rect ref={(el) => { barRefs.current[0] = el }} x="36" y="96" width="88" height="20" rx="4" fill="#A3FF12" />
      <rect ref={(el) => { barRefs.current[1] = el }} x="36" y="132" width="88" height="20" rx="4" stroke="white" strokeWidth="2" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12] group-hover:fill-[#A3FF12]" />
      <rect x="36" y="168" width="88" height="20" rx="4" stroke="white" strokeWidth="2" fill="none" className="transition-all duration-500 group-hover:stroke-[#A3FF12] group-hover:fill-[#A3FF12]" />
    </svg>
  )
}
