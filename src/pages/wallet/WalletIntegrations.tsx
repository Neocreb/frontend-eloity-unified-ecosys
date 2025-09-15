import { WalletProvider } from "@/contexts/WalletContext";
import IntegrationManager from "@/components/wallet/IntegrationManager";

const WalletIntegrations = () => (
  <WalletProvider>
    <div className="p-4 sm:p-6 space-y-6">
      <IntegrationManager />
    </div>
  </WalletProvider>
);

export default WalletIntegrations;
