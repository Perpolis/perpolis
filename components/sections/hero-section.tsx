"use client";

import { Sparkles } from "lucide-react";
import { InteractiveGridOverlay } from "@/components/interactive-grid-overlay";
import { useLanguage } from "@/lib/language-context";

export function HeroSection() {
  const { t } = useLanguage();

  return (
    <section 
      className="h-screen bg-gradient-to-br from-[#0a0a0a] via-[#0a0e08] to-[#050505] relative z-10" 
      id="hero-section"
    >
      {/* Interactive Grid Background */}
      <InteractiveGridOverlay className="pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 h-full flex items-start pt-40">
        <div className="max-w-2xl">
          <p className="text-white/80 text-lg mb-4">{t("heroSubtitle")}</p>
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-12 leading-tight lg:text-7xl">
            {t("heroTitle")}
          </h1>

          <div className="flex items-center gap-4 mt-6 mb-12">
            <a
              href="/meme-perps"
              className="inline-flex items-center gap-2 bg-[#A3FF12] text-black px-6 py-3 rounded-full text-sm font-semibold hover:bg-[#8AE000] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t("memePerps")}
            </a>
            <a
              href="https://app.perpolis.xyz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white border border-white/20 px-6 py-3 rounded-full text-sm font-medium hover:bg-[#2a2a2a] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t("tradePerps")}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
