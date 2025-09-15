import { WalletProvider } from "@/contexts/WalletContext";
import AdvancedTransactionManager from "@/components/wallet/AdvancedTransactionManager";

const WalletTransactions = () => (
  <WalletProvider>
    <div className="p-4 sm:p-6 space-y-6">
      <AdvancedTransactionManager />
    </div>
  </WalletProvider>
);

export default WalletTransactions;
