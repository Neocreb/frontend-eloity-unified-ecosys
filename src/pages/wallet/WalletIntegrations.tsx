import { WalletProvider } from "@/contexts/WalletContext";
import IntegrationManager from "@/components/wallet/IntegrationManager";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const WalletIntegrationsPage = () => {
  return (
    <WalletProvider>
      <div className="mobile-container mobile-space-y">
        <Card>
          <CardHeader>
            <CardTitle>Wallet Integrations</CardTitle>
          </CardHeader>
        </Card>
        <IntegrationManager />
      </div>
    </WalletProvider>
  );
};

export default WalletIntegrationsPage;
