import { Header } from "@/components/header"
import { HeroSection } from "@/components/sections/hero-section"
import { TradeSection } from "@/components/sections/trade-section"
import { DexSection } from "@/components/sections/dex-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { TeamSection } from "@/components/sections/team-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      {/* Hero - sticky on desktop (lg+), normal on mobile/tablet */}
      <div className="relative">
        <div className="lg:sticky lg:top-0 z-10">
          <HeroSection />
        </div>

        {/* Dark sections - scroll faster over hero via JS parallax (desktop only) */}
        <div className="parallax-content relative z-20 bg-[#0a0a0a]">
          <DexSection />
          <TradeSection />
          <FeaturesSection />
          <TeamSection />
          <Footer />
        </div>
      </div>
    </main>
  )
}
