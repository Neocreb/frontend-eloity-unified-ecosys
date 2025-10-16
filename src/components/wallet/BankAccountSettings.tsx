// @ts-nocheck
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const BankAccountSettings = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [accountNumber, setAccountNumber] = useState(user?.profile?.bank_account_number || "");
  const [accountName, setAccountName] = useState(user?.profile?.bank_account_name || "");
  const [bankName, setBankName] = useState(user?.profile?.bank_name || "");
  const [routingNumber, setRoutingNumber] = useState(user?.profile?.routing_number || "");
  const [sortCode, setSortCode] = useState(user?.profile?.sort_code || "");
  const [swiftCode, setSwiftCode] = useState(user?.profile?.swift_code || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Update the user's bank account information
      await updateProfile({
        bank_account_number: accountNumber,
        bank_account_name: accountName,
        bank_name: bankName,
        routing_number: routingNumber,
        sort_code: sortCode,
        swift_code: swiftCode,
      });

      toast({
        title: "Bank account updated",
        description: "Your bank account information has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "There was an error updating your bank account information.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Account Settings</CardTitle>
        <CardDescription>
          Add or update your bank account information for withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Select value={bankName} onValueChange={setBankName} required>
              <SelectTrigger id="bankName">
                <SelectValue placeholder="Select your bank" />
              </SelectTrigger>
              <SelectContent>
                {/* US Banks */}
                <SelectItem value="chase">Chase Bank</SelectItem>
                <SelectItem value="bankofamerica">Bank of America</SelectItem>
                <SelectItem value="wellsfargo">Wells Fargo</SelectItem>
                <SelectItem value="citibank">Citibank</SelectItem>

                {/* Nigerian Banks */}
                <SelectItem value="access_bank">Access Bank Nigeria</SelectItem>
                <SelectItem value="zenith_bank">Zenith Bank</SelectItem>
                <SelectItem value="first_bank">First Bank Nigeria</SelectItem>
                <SelectItem value="gtbank">Guaranty Trust Bank (GTBank)</SelectItem>
                <SelectItem value="uba">United Bank for Africa (UBA)</SelectItem>
                <SelectItem value="fidelity_bank">Fidelity Bank Nigeria</SelectItem>
                <SelectItem value="sterling_bank">Sterling Bank</SelectItem>
                <SelectItem value="union_bank">Union Bank Nigeria</SelectItem>
                <SelectItem value="wema_bank">Wema Bank</SelectItem>
                <SelectItem value="polaris_bank">Polaris Bank</SelectItem>
                <SelectItem value="stanbic_ibtc">Stanbic IBTC Bank</SelectItem>
                <SelectItem value="ecobank_nigeria">Ecobank Nigeria</SelectItem>
                <SelectItem value="fcmb">First City Monument Bank (FCMB)</SelectItem>
                <SelectItem value="keystone_bank">Keystone Bank</SelectItem>
                <SelectItem value="unity_bank">Unity Bank</SelectItem>

                {/* South African Banks */}
                <SelectItem value="standard_bank_sa">Standard Bank South Africa</SelectItem>
                <SelectItem value="absa_bank">ABSA Bank</SelectItem>
                <SelectItem value="fnb_sa">First National Bank (FNB)</SelectItem>
                <SelectItem value="nedbank">Nedbank</SelectItem>
                <SelectItem value="capitec_bank">Capitec Bank</SelectItem>
                <SelectItem value="african_bank">African Bank</SelectItem>

                {/* Kenyan Banks */}
                <SelectItem value="kcb_kenya">KCB Bank Kenya</SelectItem>
                <SelectItem value="equity_bank_kenya">Equity Bank Kenya</SelectItem>
                <SelectItem value="coop_bank_kenya">Cooperative Bank of Kenya</SelectItem>
                <SelectItem value="stanchart_kenya">Standard Chartered Kenya</SelectItem>
                <SelectItem value="ncba_kenya">NCBA Bank Kenya</SelectItem>

                {/* Ghanaian Banks */}
                <SelectItem value="gcb_ghana">GCB Bank Ghana</SelectItem>
                <SelectItem value="ecobank_ghana">Ecobank Ghana</SelectItem>
                <SelectItem value="stanchart_ghana">Standard Chartered Ghana</SelectItem>
                <SelectItem value="zenith_ghana">Zenith Bank Ghana</SelectItem>
                <SelectItem value="access_ghana">Access Bank Ghana</SelectItem>

                {/* Digital/Mobile Banks */}
                <SelectItem value="kuda_bank">Kuda Bank (Nigeria)</SelectItem>
                <SelectItem value="vbank">VBank (Nigeria)</SelectItem>
                <SelectItem value="opay">Opay (Nigeria)</SelectItem>
                <SelectItem value="palmpay">PalmPay (Nigeria)</SelectItem>
                <SelectItem value="tymebank">TymeBank (South Africa)</SelectItem>

                {/* Mobile Money */}
                <SelectItem value="mtn_momo">MTN Mobile Money</SelectItem>
                <SelectItem value="airtel_money">Airtel Money</SelectItem>
                <SelectItem value="mpesa">Vodacom M-Pesa</SelectItem>
                <SelectItem value="orange_money">Orange Money</SelectItem>

                <SelectItem value="other">Other Bank</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountName">Account Name</Label>
            <Input
              id="accountName"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input
              id="accountNumber"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="000123456789"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="routingNumber">Routing Number (US Banks)</Label>
            <Input
              id="routingNumber"
              value={routingNumber}
              onChange={(e) => setRoutingNumber(e.target.value)}
              placeholder="021000021"
              maxLength={9}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sortCode">Sort Code (UK/SA Banks)</Label>
            <Input
              id="sortCode"
              value={sortCode}
              onChange={(e) => setSortCode(e.target.value)}
              placeholder="12-34-56"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="swiftCode">SWIFT/BIC Code (International)</Label>
            <Input
              id="swiftCode"
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value)}
              placeholder="ABNANL2A"
              maxLength={11}
            />
            <p className="text-xs text-gray-500">
              Required for international transfers and most African banks
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Bank Information"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BankAccountSettings;
