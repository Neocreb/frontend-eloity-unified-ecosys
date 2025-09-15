import { WalletProvider } from "@/contexts/WalletContext";
import AdvancedTransactionManager from "@/components/wallet/AdvancedTransactionManager";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

const WalletTransactionsPage = () => {
  return (
    <WalletProvider>
      <div className="mobile-container mobile-space-y">
        <Card>
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
          </CardHeader>
        </Card>
        <AdvancedTransactionManager />
      </div>
    </WalletProvider>
  );
};

export default WalletTransactionsPage;
