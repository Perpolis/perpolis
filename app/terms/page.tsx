"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"

export default function TermsPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{t("termsTitle")}</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsAcceptance")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsAcceptanceText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsLicense")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsLicenseText")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">{t("termsLicenseRestrictions")}</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("termsLicenseList1")}</li>
                <li>{t("termsLicenseList2")}</li>
                <li>{t("termsLicenseList3")}</li>
                <li>{t("termsLicenseList4")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsRisks")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsRisksText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsRisksText2")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsAccounts")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsAccountsText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsAccountsText2")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsProhibited")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">{t("termsProhibitedText")}</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("termsProhibitedList1")}</li>
                <li>{t("termsProhibitedList2")}</li>
                <li>{t("termsProhibitedList3")}</li>
                <li>{t("termsProhibitedList4")}</li>
                <li>{t("termsProhibitedList5")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsLiability")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsLiabilityText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsModifications")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsModificationsText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("termsContact")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("termsContactText")}
              </p>
            </section>

            <p className="text-gray-500 text-sm mt-12">{t("lastUpdated")}</p>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
