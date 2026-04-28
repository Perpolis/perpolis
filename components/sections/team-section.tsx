"use client"

import { useLanguage } from "@/lib/language-context"

const companies = [
  { name: "BINANCE", logo: <BinanceLogo /> },
  { name: "BARCLAYS", logo: <BarclaysLogo /> },
  { name: "Morgan Stanley", logo: <MorganStanleyLogo /> },
  { name: "Bloomberg", logo: <BloombergLogo /> },
  { name: "BYBIT", logo: <BybitLogo /> },
  { name: "DeFi", logo: <DeFiLogo /> },
]

export function TeamSection() {
  const { t } = useLanguage()
  
  return (
    <section className="bg-[#0a0a0a] py-32">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-28">
          {t("teamTitle")}
        </h2>

        {/* Logo Marquee */}
        <div className="relative overflow-hidden">
          <div className="flex items-center gap-16 animate-marquee">
            {/* First set */}
            {companies.map((company, index) => (
              <div
                key={index}
                className="flex items-center justify-center min-w-[200px] opacity-50 hover:opacity-100 transition-opacity"
              >
                {company.logo}
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {companies.map((company, index) => (
              <div
                key={`dup-${index}`}
                className="flex items-center justify-center min-w-[200px] opacity-50 hover:opacity-100 transition-opacity"
              >
                {company.logo}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function BinanceLogo() {
  return (
    <div className="flex items-center gap-2 text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L6.5 7.5L8.5 9.5L12 6L15.5 9.5L17.5 7.5L12 2Z" />
        <path d="M2 12L4 10L6 12L4 14L2 12Z" />
        <path d="M6.5 16.5L12 22L17.5 16.5L15.5 14.5L12 18L8.5 14.5L6.5 16.5Z" />
        <path d="M18 12L20 10L22 12L20 14L18 12Z" />
        <path d="M14.5 12L12 9.5L9.5 12L12 14.5L14.5 12Z" />
      </svg>
      <span className="text-2xl font-bold tracking-wider">BINANCE</span>
    </div>
  )
}

function BarclaysLogo() {
  return (
    <div className="flex items-center gap-2 text-white">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6z" />
        <path d="M16 8c-4.418 0-8 3.582-8 8s3.582 8 8 8 8-3.582 8-8-3.582-8-8-8zm0 2c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6z" />
      </svg>
      <span className="text-2xl font-bold">BARCLAYS</span>
    </div>
  )
}

function MorganStanleyLogo() {
  return (
    <span className="text-2xl font-serif text-gray-400">Morgan Stanley</span>
  )
}

function BloombergLogo() {
  return (
    <span className="text-2xl font-bold tracking-wide text-white">Bloomberg</span>
  )
}

function BybitLogo() {
  return (
    <div className="flex items-center text-white">
      <span className="text-2xl font-bold">BYB</span>
      <span className="text-2xl font-bold text-orange-500">I</span>
      <span className="text-2xl font-bold">T</span>
    </div>
  )
}

function DeFiLogo() {
  return (
    <div className="flex items-center gap-1 text-white">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <rect x="4" y="4" width="16" height="16" rx="2" />
      </svg>
      <span className="text-2xl font-bold">DeFi</span>
    </div>
  )
}
