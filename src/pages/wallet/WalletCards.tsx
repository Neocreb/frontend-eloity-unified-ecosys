import { WalletProvider } from "@/contexts/WalletContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { CreditCard, Shield, Snowflake, Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";

interface ManagedCard {
  id: string;
  brand: "Visa" | "Mastercard" | "Virtual";
  last4: string;
  balance: number;
  holder: string;
  isDefault: boolean;
  isFrozen: boolean;
}

const WalletCardsPage = () => {
  const [cards, setCards] = useState<ManagedCard[]>([
    { id: "1", brand: "Visa", last4: "4532", balance: 2450, holder: "Primary", isDefault: true, isFrozen: false },
    { id: "2", brand: "Mastercard", last4: "8901", balance: 550, holder: "Spending", isDefault: false, isFrozen: false },
  ]);
  const [open, setOpen] = useState(false);
  const [newCard, setNewCard] = useState({ brand: "Visa", holder: "", number: "", expiry: "", cvv: "" });

  const addCard = () => {
    if (!newCard.number || newCard.number.length < 12) return;
    const last4 = newCard.number.slice(-4);
    setCards(prev => [
      ...prev,
      { id: Date.now().toString(), brand: newCard.brand as ManagedCard["brand"], last4, balance: 0, holder: newCard.holder || "Personal", isDefault: prev.length === 0, isFrozen: false },
    ]);
    setOpen(false);
    setNewCard({ brand: "Visa", holder: "", number: "", expiry: "", cvv: "" });
  };

  const toggleFreeze = (id: string) => setCards(prev => prev.map(c => c.id === id ? { ...c, isFrozen: !c.isFrozen } : c));
  const makeDefault = (id: string) => setCards(prev => prev.map(c => ({ ...c, isDefault: c.id === id })));
  const removeCard = (id: string) => setCards(prev => prev.filter(c => c.id !== id));

  const GradientCard = ({ c }: { c: ManagedCard }) => (
    <div className={`rounded-xl p-5 text-white ${c.brand === "Visa" ? "bg-gradient-to-r from-indigo-500 to-purple-500" : "bg-gradient-to-r from-slate-700 to-slate-900"}`}>
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm opacity-90">{c.brand} •••• {c.last4}</div>
          <div className="mt-6 text-xs opacity-90">Balance</div>
          <div className="text-2xl font-semibold">${c.balance.toFixed(2)}</div>
        </div>
        <CreditCard className="h-5 w-5 opacity-80" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        {c.isDefault && <Badge className="bg-white/20">Default</Badge>}
        {c.isFrozen && <Badge variant="secondary" className="text-slate-900">Frozen</Badge>}
      </div>
    </div>
  );

  return (
    <WalletProvider>
      <div className="mobile-container mobile-space-y">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Cards</CardTitle>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Card</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Cardholder</Label>
                      <Input value={newCard.holder} onChange={e => setNewCard({ ...newCard, holder: e.target.value })} placeholder="Name on card" />
                    </div>
                    <div>
                      <Label>Brand</Label>
                      <select className="w-full h-10 border rounded-md px-3 bg-background" value={newCard.brand} onChange={e => setNewCard({ ...newCard, brand: e.target.value })}>
                        <option value="Visa">Visa</option>
                        <option value="Mastercard">Mastercard</option>
                        <option value="Virtual">Virtual</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <Label>Card Number</Label>
                    <Input value={newCard.number} onChange={e => setNewCard({ ...newCard, number: e.target.value.replace(/\D/g, "") })} placeholder="4242 4242 4242 4242" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Expiry</Label>
                      <Input value={newCard.expiry} onChange={e => setNewCard({ ...newCard, expiry: e.target.value })} placeholder="MM/YY" />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input value={newCard.cvv} onChange={e => setNewCard({ ...newCard, cvv: e.target.value })} placeholder="***" />
                    </div>
                  </div>
                  <Button className="w-full" onClick={addCard}>Save Card</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map(c => (
              <div key={c.id} className="space-y-3 border rounded-xl p-3">
                <GradientCard c={c} />
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => makeDefault(c.id)} disabled={c.isDefault}>
                    <Star className="h-4 w-4 mr-1" /> Set Default
                  </Button>
                  <Button size="sm" variant={c.isFrozen ? "destructive" : "outline"} onClick={() => toggleFreeze(c.id)}>
                    <Snowflake className="h-4 w-4 mr-1" /> {c.isFrozen ? "Unfreeze" : "Freeze"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => removeCard(c.id)}>
                    <Trash2 className="h-4 w-4 mr-1" /> Remove
                  </Button>
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4 text-green-600" />
                    Online payments enabled
                    <Switch checked={!c.isFrozen} onCheckedChange={() => toggleFreeze(c.id)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </WalletProvider>
  );
};

export default WalletCardsPage;
