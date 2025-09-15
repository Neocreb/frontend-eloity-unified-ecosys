import { WalletProvider } from "@/contexts/WalletContext";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import CurrencyDemo from "@/components/currency/CurrencyDemo";

const WalletConvertPage = () => {
  return (
    <WalletProvider>
      <div className="mobile-container mobile-space-y">
        <Card>
          <CardHeader>
            <CardTitle>Convert Currency</CardTitle>
          </CardHeader>
        </Card>
        <CurrencyDemo />
      </div>
    </WalletProvider>
  );
};

export default WalletConvertPage;
