import { WalletProvider } from "@/contexts/WalletContext";
import WalletAnalyticsDashboard from "@/components/wallet/WalletAnalyticsDashboard";

const WalletAnalytics = () => (
  <WalletProvider>
    <div className="p-4 sm:p-6 space-y-6">
      <WalletAnalyticsDashboard />
    </div>
  </WalletProvider>
);

export default WalletAnalytics;
