import { WalletProvider } from "@/contexts/WalletContext";
import WalletAnalyticsDashboard from "@/components/wallet/WalletAnalyticsDashboard";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const WalletAnalyticsPage = () => {
  return (
    <WalletProvider>
      <div className="mobile-container mobile-space-y">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Analytics</CardTitle>
          </CardHeader>
        </Card>
        <WalletAnalyticsDashboard />
      </div>
    </WalletProvider>
  );
};

export default WalletAnalyticsPage;
