import { WalletProvider } from "@/lib/wallet-context"
import { LiveTradesTicker } from "@/components/larp/live-trades-ticker"
import { WhaleWatchToast } from "@/components/larp/whale-watch-toast"

export default function MemePerpsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WalletProvider>
      {children}
      <LiveTradesTicker />
      <WhaleWatchToast />
    </WalletProvider>
  )
}
