import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VirtualCard { id: string; nickname: string; currency: string; last4: string; spendingLimit: number; isDefault?: boolean }

const WalletCards = () => {
  const [cards, setCards] = useState<VirtualCard[]>([
    { id: '1', nickname: 'Business Card', currency: 'USD', last4: '4532', spendingLimit: 2000, isDefault: true },
  ]);

  const [nickname, setNickname] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [spendingLimit, setSpendingLimit] = useState<number | ''>('');

  const createVirtualCard = () => {
    const id = String(Date.now());
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    setCards(prev => [
      ...prev,
      { id, nickname: nickname || `Card ${prev.length + 1}`, currency, last4, spendingLimit: Number(spendingLimit) || 0 }
    ]);
    setNickname(''); setSpendingLimit(''); setCurrency('USD');
  };

  const remove = (id:string)=> setCards(cards.filter(c=>c.id!==id));
  const makeDefault = (id:string)=> setCards(cards.map(c=> ({...c, isDefault: c.id===id})));

  return (
    <div className="p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Virtual Cards</h1>
        <Button onClick={createVirtualCard}><Plus className="h-4 w-4"/>Create Card</Button>
      </div>

      {cards.map(card=> (
        <Card key={card.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5"/> {card.nickname} •••• {card.last4}
            </CardTitle>
            {card.isDefault && (
              <div className="flex items-center gap-1 text-emerald-600 text-sm"><CheckCircle className="h-4 w-4"/> Default</div>
            )}
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground">Currency</div>
              <div className="font-semibold">{card.currency}</div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground">Spending Limit</div>
              <div className="font-semibold">${card.spendingLimit.toFixed(2)}</div>
            </div>

            <div className="flex gap-2">
              {!card.isDefault && <Button variant="outline" onClick={()=>makeDefault(card.id)}>Make Default</Button>}
              <Button variant="outline" onClick={()=>remove(card.id)}><Trash2 className="h-4 w-4"/></Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>Create Virtual Card</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nickname">Card Nickname</Label>
            <Input id="nickname" placeholder="e.g. Business Card" value={nickname} onChange={(e)=>setNickname(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" value={currency} onChange={(e)=>setCurrency(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="limit">Spending Limit</Label>
            <Input id="limit" type="number" value={spendingLimit} onChange={(e)=>setSpendingLimit(e.target.value ? Number(e.target.value) : '')} placeholder="1000" />
          </div>

          <div>
            <Label htmlFor="controls">Controls</Label>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={createVirtualCard}>Create Card</Button>
              <Button variant="outline" className="flex-1" onClick={()=>{ setNickname(''); setSpendingLimit(''); setCurrency('USD'); }}>Cancel</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletCards;
