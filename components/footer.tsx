"use client"

import { Send, MessageCircle } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

function XIcon() {
  return (
    <svg className="w-5 h-5 fill-current" viewBox="0 0 1226.37 1226.37" xmlns="http://www.w3.org/2000/svg">
      <path d="m727.348 519.284 446.727-519.284h-105.86l-387.893 450.887-309.809-450.887h-357.328l468.492 681.821-468.492 544.549h105.866l409.625-476.152 327.181 476.152h357.328l-485.863-707.086zm-144.998 168.544-47.468-67.894-377.686-540.24h162.604l304.797 435.991 47.468 67.894 396.2 566.721h-162.604l-323.311-462.446z"/>
    </svg>
  )
}

export function Footer() {
  const { t } = useLanguage()
  return (
    <footer className="bg-[#0a0a0a] border-t border-[#1a1a1a] py-16">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between gap-12">
          {/* Logo & Description */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-4">
              <img
                src="/logo.png"
                alt="Perpolis"
                width="48"
                height="48"
                className="rounded-xl"
              />
              <span className="text-xl font-semibold text-white">Perpolis</span>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              {t("footerTagline")}
            </p>
            <div className="flex items-center gap-4">
              <a href="https://x.com/perpolis" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-white transition-colors">
                <XIcon />
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                
              </a>
              <a href="#" className="text-gray-500 hover:text-white transition-colors">
                
              </a>
            </div>
          </div>

          {/* Legal - Right aligned */}
          <div>
            <h4 className="text-white font-semibold mb-4">{t("legal")}</h4>
            <ul className="space-y-3">
              <li><a href="/terms" className="text-gray-500 hover:text-white text-sm transition-colors">{t("termsOfService")}</a></li>
              <li><a href="/privacy" className="text-gray-500 hover:text-white text-sm transition-colors">{t("privacyPolicy")}</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1a1a1a] mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">{t("copyright")}</p>
          <p className="text-gray-500 text-sm">{t("builtForTraders")}</p>
        </div>
      </div>
    </footer>
  )
}
