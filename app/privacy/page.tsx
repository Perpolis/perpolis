"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useLanguage } from "@/lib/language-context"

export default function PrivacyPage() {
  const { t } = useLanguage()
  
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">{t("privacyTitle")}</h1>
          
          <div className="prose prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyCollection")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyCollectionText")}
              </p>
              <h3 className="text-xl font-semibold text-white mb-3 mt-6">{t("privacyPersonalData")}</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyPersonalDataText")}
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("privacyDataList1")}</li>
                <li>{t("privacyDataList2")}</li>
                <li>{t("privacyDataList3")}</li>
                <li>{t("privacyDataList4")}</li>
                <li>{t("privacyDataList5")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyUsage")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">{t("privacyUsageText")}</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("privacyUsageList1")}</li>
                <li>{t("privacyUsageList2")}</li>
                <li>{t("privacyUsageList3")}</li>
                <li>{t("privacyUsageList4")}</li>
                <li>{t("privacyUsageList5")}</li>
                <li>{t("privacyUsageList6")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacySecurity")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacySecurityText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">{t("privacySecurityText2")}</p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("privacySecurityList1")}</li>
                <li>{t("privacySecurityList2")}</li>
                <li>{t("privacySecurityList3")}</li>
                <li>{t("privacySecurityList4")}</li>
                <li>{t("privacySecurityList5")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyCookies")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyCookiesText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyCookiesText2")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyThirdParty")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyThirdPartyText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyThirdPartyText2")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyRetention")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyRetentionText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyRights")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyRightsText")}
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 mb-4">
                <li>{t("privacyRightsList1")}</li>
                <li>{t("privacyRightsList2")}</li>
                <li>{t("privacyRightsList3")}</li>
                <li>{t("privacyRightsList4")}</li>
                <li>{t("privacyRightsList5")}</li>
                <li>{t("privacyRightsList6")}</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyTransfers")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyTransfersText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyChildren")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyChildrenText")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyChanges")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyChangesText1")}
              </p>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyChangesText2")}
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-4">{t("privacyContactTitle")}</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                {t("privacyContactText")}
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
