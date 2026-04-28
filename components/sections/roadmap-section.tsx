"use client"

import React, { useEffect, useRef, useState } from "react"
import { useLanguage } from "@/lib/language-context"

export function RoadmapSection() {
  const { t } = useLanguage()
  const sectionRef = useRef<HTMLElement>(null)
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  
  const roadmapItems = [
    {
      quarter: t("q1"),
      title: t("q1Title"),
      description: t("q1Desc"),
      icon: <AtomIcon />,
      position: "right",
    },
    {
      quarter: t("q2"),
      title: t("q2Title"),
      description: t("q2Desc"),
      icon: <BinocularsIcon />,
      position: "left",
    },
    {
      quarter: t("q3"),
      title: t("q3Title"),
      description: t("q3Desc"),
      icon: <PlanetIcon />,
      position: "right",
    },
    {
      quarter: t("q4"),
      title: t("q4Title"),
      description: t("q4Desc"),
      icon: <WavesIcon />,
      position: "left",
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Get the card index from the data attribute
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
            setVisibleCards((prev) => [...new Set([...prev, index])])
          } else {
            // Remove from visible when scrolling away
            const index = Number.parseInt(entry.target.getAttribute("data-index") || "0")
            setVisibleCards((prev) => prev.filter((i) => i !== index))
          }
        })
      },
      { threshold: 0.2 }
    )

    // Observe all cards
    const cards = sectionRef.current?.querySelectorAll("[data-roadmap-card]")
    cards?.forEach((card) => observer.observe(card))

    return () => {
      cards?.forEach((card) => observer.unobserve(card))
    }
  }, [])

  return (
    <section ref={sectionRef} className="min-h-screen bg-[#0a0a0a] py-20">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">{t("roadmapTitle")}</h2>
          <p className="text-gray-400">{t("roadmapSubtitle")}</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#2a2a2a] transform -translate-x-1/2" />

          {/* Year Badge */}
          <div className="relative flex justify-center mb-16">
            <div className="bg-white text-black px-6 py-2 rounded-full font-medium z-10">
              2025
            </div>
            {/* Glowing dot */}
            <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2">
              <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.8)]" />
            </div>
          </div>

          {/* Roadmap Items */}
          <div className="space-y-16">
            {roadmapItems.map((item, index) => {
              const isVisible = visibleCards.includes(index)
              const isRight = item.position === "right"
              
              return (
                <div key={index} className="relative" data-roadmap-card data-index={index}>
                  <div
                    className={`flex items-center ${
                      isRight ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`w-[45%] ${
                        isRight ? "ml-auto" : "mr-auto"
                      } transition-all duration-1000 ease-out ${
                        isVisible
                          ? "opacity-100 translate-x-0"
                          : isRight
                            ? "opacity-0 translate-x-20"
                            : "opacity-0 -translate-x-20"
                      }`}
                      style={{ transitionDelay: "200ms" }}
                    >
                      <RoadmapCard
                        quarter={item.quarter}
                        title={item.title}
                        description={item.description}
                        icon={item.icon}
                      />
                    </div>
                  </div>

                  {/* Connection dot */}
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

function RoadmapCard({
  quarter,
  title,
  description,
  icon,
}: {
  quarter: string
  title: string
  description: string
  icon: React.ReactNode
}) {
  return (
    <div className="relative group">
      {/* Glossy glass indicator - top left */}
      <div className="absolute -top-2 -left-2 w-12 h-12 bg-gradient-to-br from-white/80 to-white/40 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] z-20" />

      {/* Main card */}
      <div className="bg-[#1a1a1a] border border-[#333333] rounded-3xl p-8 relative overflow-hidden backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.1),inset_0_0_20px_rgba(255,255,255,0.05)]">
        {/* Subtle inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
        
        {/* Glass reflection effect */}
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />
        
        {/* Edge glow effect */}
        <div className="absolute inset-0 rounded-3xl shadow-[0_0_40px_rgba(255,255,255,0.15)] pointer-events-none" />

        <div className="relative z-10">
          {/* Icon - top right */}
          <div className="flex justify-end mb-8">
            <div className="text-white">{icon}</div>
          </div>

          {/* Quarter */}
          <h3 className="text-5xl font-bold text-white mb-6">{quarter}</h3>

          {/* Title */}
          <h4 className="text-xl font-medium text-white mb-3 leading-tight">{title}</h4>

          {/* Description */}
          <p className="text-gray-400 text-base">{description}</p>
        </div>
      </div>
    </div>
  )
}

function AtomIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="5" fill="white" />
      <ellipse cx="30" cy="30" rx="25" ry="10" stroke="white" strokeWidth="2" fill="none" transform="rotate(0 30 30)" />
      <ellipse cx="30" cy="30" rx="25" ry="10" stroke="white" strokeWidth="2" fill="none" transform="rotate(60 30 30)" />
      <ellipse cx="30" cy="30" rx="25" ry="10" stroke="white" strokeWidth="2" fill="none" transform="rotate(-60 30 30)" />
    </svg>
  )
}

function BinocularsIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="18" cy="35" r="12" stroke="white" strokeWidth="2" fill="none" />
      <circle cx="42" cy="35" r="12" stroke="white" strokeWidth="2" fill="none" />
      <path d="M18 23V15M42 23V15" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M30 30V25C30 23 28 20 26 20H34C32 20 30 23 30 25V30" stroke="white" strokeWidth="2" />
    </svg>
  )
}

function PlanetIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="30" r="15" stroke="white" strokeWidth="2" fill="none" />
      <ellipse cx="30" cy="30" rx="28" ry="8" stroke="white" strokeWidth="2" fill="none" transform="rotate(-30 30 30)" />
    </svg>
  )
}

function WavesIcon() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20C15 20 15 25 20 25C25 25 25 20 30 20C35 20 35 25 40 25C45 25 45 20 50 20" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 30C15 30 15 35 20 35C25 35 25 30 30 30C35 30 35 35 40 35C45 35 45 30 50 30" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 40C15 40 15 45 20 45C25 45 25 40 30 40C35 40 35 45 40 45C45 45 45 40 50 40" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
