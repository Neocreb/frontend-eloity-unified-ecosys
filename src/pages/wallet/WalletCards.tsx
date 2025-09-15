import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Plus, Trash2, CheckCircle } from "lucide-react";
import { useState } from "react";

interface PaymentCard { id: string; brand: 'visa'|'mastercard'; last4: string; balance: number; isDefault?: boolean; }

const WalletCards = () => {
  const [cards, setCards] = useState<PaymentCard[]>([
    { id:'1', brand:'visa', last4:'4532', balance:2450, isDefault:true },
    { id:'2', brand:'mastercard', last4:'8901', balance:550 },
  ]);

  const addCard = () => {
    const id = String(Date.now());
    setCards([...cards, { id, brand:'visa', last4:'0000', balance:0 }]);
  };
  const remove = (id:string)=> setCards(cards.filter(c=>c.id!==id));
  const makeDefault = (id:string)=> setCards(cards.map(c=> ({...c, isDefault: c.id===id})));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cards</h1>
        <Button onClick={addCard}><Plus className="h-4 w-4"/>Add Card</Button>
      </div>

      {cards.map(card=> (
        <Card key={card.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5"/> {card.brand === 'visa'? 'Visa' : 'Mastercard'} •••• {card.last4}
            </CardTitle>
            {card.isDefault && (
              <div className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="h-4 w-4"/> Default</div>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Balance</div>
            <div className="text-lg font-semibold">${card.balance.toFixed(2)}</div>
            <div className="flex gap-2">
              {!card.isDefault && <Button variant="outline" onClick={()=>makeDefault(card.id)}>Make Default</Button>}
              <Button variant="outline" onClick={()=>remove(card.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Add New Card</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="number">Card Number</Label>
            <Input id="number" placeholder="4242 4242 4242 4242" />
          </div>
          <div>
            <Label htmlFor="name">Name on Card</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
          <div>
            <Label htmlFor="exp">Expiry</Label>
            <Input id="exp" placeholder="12/26" />
          </div>
          <div>
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" placeholder="123" />
          </div>
          <Button className="sm:col-span-2 w-full">Save Card</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletCards;
