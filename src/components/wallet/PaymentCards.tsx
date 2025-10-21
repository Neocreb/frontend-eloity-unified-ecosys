import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard } from "lucide-react";
import { Link } from "react-router-dom";

const GradientCard = ({
  title,
  number,
  balance,
  gradient,
}: {
  title: string;
  number: string;
  balance: number;
  gradient: string;
}) => (
  <div className={`rounded-2xl p-5 text-white ${gradient} shadow-md`}>
    <div className="flex items-center justify-between">
      <div className="text-sm opacity-90">{title}</div>
      <CreditCard className="h-5 w-5 opacity-90" />
    </div>
    <div className="mt-4 text-3xl font-bold tracking-wider">•••• {number}</div>
    <div className="mt-6 flex items-center justify-between opacity-95">
      <div className="text-sm">Balance</div>
      <div className="text-xl font-semibold">${balance.toFixed(2)}</div>
    </div>
  </div>
);

const PaymentCards = () => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Cards</CardTitle>
        <Button asChild variant="link" className="p-0">
          <Link to="/app/wallet/cards">Manage</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <GradientCard
          title="Visa Debit"
          number="4532"
          balance={2450}
          gradient="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
        />
        <GradientCard
          title="Mastercard"
          number="8901"
          balance={550}
          gradient="bg-gradient-to-r from-slate-800 to-slate-900"
        />
      </CardContent>
    </Card>
  );
};

export default PaymentCards;
