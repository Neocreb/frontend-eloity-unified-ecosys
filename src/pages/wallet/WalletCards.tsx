import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Plus, Trash2, CheckCircle, Lock, Unlock, AlertCircle, Eye, EyeOff, RotateCw, ShieldAlert, History, Send, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VirtualCard {
  id: string;
  nickname: string;
  currency: string;
  last4: string;
  cvv?: string;
  spendingLimit: number;
  isDefault?: boolean;
  isFrozen?: boolean;
  isVirtual: boolean;
  createdAt?: Date;
}

interface PhysicalCard {
  id: string;
  nickname: string;
  currency: string;
  last4: string;
  cardHolderName: string;
  status: 'ordered' | 'in-transit' | 'delivered' | 'active' | 'expired';
  deliveryAddress?: string;
  spendingLimit: number;
  isDefault?: boolean;
  isFrozen?: boolean;
  isVirtual: boolean;
  createdAt?: Date;
  deliveryDate?: Date;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: Date;
  merchant: string;
  status: 'completed' | 'pending' | 'declined';
}

const CardFlip3D = ({ card, isFront, setIsFront }: { card: VirtualCard; isFront: boolean; setIsFront: (v: boolean) => void }) => {
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handleMouseDown = () => {
    const timer = setTimeout(() => {
      setIsLongPressed(true);
      setIsFront(false);
    }, 500);
    
    return () => clearTimeout(timer);
  };

  const handleMouseUp = () => {
    setIsLongPressed(false);
  };

  return (
    <div
      className="relative w-full h-56 cursor-pointer perspective"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ perspective: '1000px' }}
    >
      <style>{`
        @keyframes flip {
          0% { transform: rotateY(0deg) rotateX(0deg); }
          100% { transform: rotateY(180deg) rotateX(5deg); }
        }

        .card-flip {
          animation: flip 0.6s ease-in-out;
          transform-style: preserve-3d;
        }

        .card-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .card-back {
          transform: rotateY(180deg);
        }
      `}</style>

      <div
        className={`absolute inset-0 rounded-2xl transition-transform duration-500 ${
          isFront ? '' : 'card-flip'
        }`}
        style={{
          transformStyle: 'preserve-3d',
          transform: isFront ? 'rotateY(0deg)' : 'rotateY(180deg)',
        }}
      >
        {/* Front of card */}
        <div
          className="card-face absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium opacity-90">{card.nickname}</span>
            {card.isFrozen && <Lock className="h-5 w-5 text-red-400" />}
          </div>
          <div>
            <div className="text-2xl font-bold tracking-wider mb-4">•••• {card.last4}</div>
            <div className="flex items-center justify-between opacity-95">
              <div className="text-sm">Balance</div>
              <div className="text-sm font-semibold">${(Math.random() * 5000).toFixed(2)}</div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs opacity-75">
            <span>{card.currency}</span>
            <span>Long press to reveal CVV</span>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="card-back card-face absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-5 text-white shadow-xl flex flex-col justify-between"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="h-12 bg-yellow-600 rounded w-full"></div>
          <div className="space-y-3">
            <div className="text-xs opacity-75">CVV</div>
            <div className="text-2xl font-bold tracking-widest">***</div>
            <button
              onClick={() => setIsFront(true)}
              className="w-full bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded font-medium transition-colors"
            >
              Return to Front
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhysicalCardPreview = ({ card }: { card: PhysicalCard }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'in-transit':
        return 'bg-blue-100 text-blue-700';
      case 'ordered':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ordered':
        return 'Order Placed';
      case 'in-transit':
        return 'In Transit';
      case 'delivered':
        return 'Delivered';
      case 'active':
        return 'Active';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <div className="relative w-full h-56 rounded-2xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-5 text-white shadow-xl flex flex-col justify-between overflow-hidden">
      {/* Card design pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="grid grid-cols-4 gap-2 p-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="w-8 h-8 border border-white rounded"></div>
          ))}
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="text-sm font-medium opacity-90">{card.nickname}</span>
        {card.isFrozen && <Lock className="h-5 w-5 text-red-400" />}
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="h-6 w-6" />
          <span className="text-lg font-semibold">{card.cardHolderName}</span>
        </div>
        <div className="text-2xl font-bold tracking-wider mb-3">•••• •••• •••• {card.last4}</div>
        <div className="flex items-center justify-between text-xs opacity-75">
          <span>{card.currency}</span>
          <span>Physical Card</span>
        </div>
      </div>
    </div>
  );
};

const WalletCards = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'virtual';
  const [cardType, setCardType] = useState<'virtual' | 'physical'>(initialType as 'virtual' | 'physical');

  const [virtualCards, setVirtualCards] = useState<VirtualCard[]>([
    {
      id: '1',
      nickname: 'Visa Debit',
      currency: 'USD',
      last4: '4532',
      cvv: '123',
      spendingLimit: 2450,
      isDefault: true,
      isFrozen: false,
      isVirtual: true,
    },
    {
      id: '2',
      nickname: 'Mastercard',
      currency: 'USD',
      last4: '8901',
      cvv: '456',
      spendingLimit: 550,
      isFrozen: false,
      isVirtual: true,
    },
  ]);

  const [physicalCards, setPhysicalCards] = useState<PhysicalCard[]>([
    {
      id: 'p1',
      nickname: 'Main Debit Card',
      currency: 'USD',
      last4: '1234',
      cardHolderName: 'John Doe',
      status: 'active',
      deliveryAddress: '123 Main St, City, State 12345',
      spendingLimit: 5000,
      isDefault: true,
      isFrozen: false,
      isVirtual: false,
      createdAt: new Date('2024-01-01'),
    },
  ]);

  const [nickname, setNickname] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [spendingLimit, setSpendingLimit] = useState<number | ''>('');
  const [cardHolderName, setCardHolderName] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);
  const [selectedCardForHistory, setSelectedCardForHistory] = useState<VirtualCard | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', description: 'Coffee Shop', amount: -5.50, date: new Date('2025-01-20'), merchant: 'Starbucks', status: 'completed' },
    { id: '2', description: 'Grocery Store', amount: -45.23, date: new Date('2025-01-19'), merchant: 'Whole Foods', status: 'completed' },
    { id: '3', description: 'Gas Station', amount: -52.00, date: new Date('2025-01-18'), merchant: 'Shell', status: 'pending' },
    { id: '4', description: 'Online Store', amount: -125.99, date: new Date('2025-01-17'), merchant: 'Amazon', status: 'declined' },
  ]);

  // Virtual Card Operations
  const createVirtualCard = () => {
    if (!nickname || !spendingLimit) {
      alert('Please fill in all fields');
      return;
    }
    const id = String(Date.now());
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    setVirtualCards(prev => [
      ...prev,
      {
        id,
        nickname: nickname || `Card ${prev.length + 1}`,
        currency,
        last4,
        cvv: String(Math.floor(100 + Math.random() * 900)),
        spendingLimit: Number(spendingLimit),
        isFrozen: false,
        isVirtual: true,
        createdAt: new Date(),
      }
    ]);
    setNickname('');
    setSpendingLimit('');
    setCurrency('USD');
  };

  // Physical Card Operations
  const orderPhysicalCard = () => {
    if (!nickname || !spendingLimit || !cardHolderName || !deliveryAddress) {
      alert('Please fill in all fields');
      return;
    }
    const id = `p${Date.now()}`;
    const last4 = Math.floor(1000 + Math.random() * 9000).toString();
    setPhysicalCards(prev => [
      ...prev,
      {
        id,
        nickname: nickname || `Physical Card ${prev.length + 1}`,
        currency,
        last4,
        cardHolderName,
        status: 'ordered',
        deliveryAddress,
        spendingLimit: Number(spendingLimit),
        isFrozen: false,
        isVirtual: false,
        createdAt: new Date(),
      }
    ]);
    setNickname('');
    setSpendingLimit('');
    setCurrency('USD');
    setCardHolderName('');
    setDeliveryAddress('');
  };

  const toggleFreeze = (id: string, isVirtual: boolean) => {
    if (isVirtual) {
      setVirtualCards(virtualCards.map(c => c.id === id ? { ...c, isFrozen: !c.isFrozen } : c));
    } else {
      setPhysicalCards(physicalCards.map(c => c.id === id ? { ...c, isFrozen: !c.isFrozen } : c));
    }
  };

  const updateSpendingLimit = (id: string, newLimit: number, isVirtual: boolean) => {
    if (isVirtual) {
      setVirtualCards(virtualCards.map(c => c.id === id ? { ...c, spendingLimit: newLimit } : c));
    } else {
      setPhysicalCards(physicalCards.map(c => c.id === id ? { ...c, spendingLimit: newLimit } : c));
    }
  };

  const removeCard = (id: string, isVirtual: boolean) => {
    if (isVirtual) {
      setVirtualCards(virtualCards.filter(c => c.id !== id));
    } else {
      setPhysicalCards(physicalCards.filter(c => c.id !== id));
    }
  };

  const makeDefault = (id: string, isVirtual: boolean) => {
    if (isVirtual) {
      setVirtualCards(virtualCards.map(c => ({ ...c, isDefault: c.id === id })));
    } else {
      setPhysicalCards(physicalCards.map(c => ({ ...c, isDefault: c.id === id })));
    }
  };

  const blockAndReplace = (id: string, last4: string) => {
    alert(`Card ${last4} has been blocked. A new card will be sent within 7-10 business days.`);
    removeCard(id, false);
  };

  const reportFraud = (id: string, last4: string) => {
    alert(`Fraud report submitted for card ending in ${last4}. We'll investigate within 24-48 hours.`);
  };

  // Common Card Actions Component
  const CardActions = ({ card, isVirtual }: { card: VirtualCard | PhysicalCard; isVirtual: boolean }) => {
    const physicalCard = card as PhysicalCard;
    return (
      <div className="grid grid-cols-2 gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <AlertCircle className="h-3 w-3 mr-1" />
              Set Limit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Set Spending Limit</DialogTitle>
              <DialogDescription>
                Set a monthly spending limit for {card.nickname}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="new-limit">New Spending Limit ($)</Label>
                <Input
                  id="new-limit"
                  type="number"
                  defaultValue={card.spendingLimit}
                  onBlur={(e) => {
                    const newLimit = Number(e.target.value);
                    if (newLimit > 0) {
                      updateSpendingLimit(card.id, newLimit, isVirtual);
                    }
                  }}
                  className="mt-1"
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  const input = document.getElementById('new-limit') as HTMLInputElement;
                  const newLimit = Number(input.value);
                  if (newLimit > 0) {
                    updateSpendingLimit(card.id, newLimit, isVirtual);
                  }
                }}
              >
                Update Limit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs">
              <History className="h-3 w-3 mr-1" />
              History
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{card.nickname} Transaction History</DialogTitle>
              <DialogDescription>
                Card ending in {card.last4}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              {transactions.map(tx => (
                <div
                  key={tx.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{tx.merchant}</span>
                    <span className={`font-bold ${tx.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.amount < 0 ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{tx.description}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-700' :
                      tx.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {tx.date.toLocaleDateString()} at {tx.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {!isVirtual && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
                <RotateCw className="h-3 w-3 mr-1" />
                Block & Replace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Block & Replace Card?</DialogTitle>
                <DialogDescription>
                  This will permanently block {card.nickname} ending in {card.last4}. A replacement card will arrive within 7-10 business days.
                </DialogDescription>
              </DialogHeader>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-yellow-800">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    const btn = document.querySelector('[data-cancel]') as HTMLButtonElement;
                    btn?.click();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    blockAndReplace(card.id, card.last4);
                    const btn = document.querySelector('[data-cancel]') as HTMLButtonElement;
                    btn?.click();
                  }}
                >
                  Block Card
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs text-orange-600 hover:text-orange-700 hover:bg-orange-50">
              <ShieldAlert className="h-3 w-3 mr-1" />
              Report Fraud
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Fraudulent Activity</DialogTitle>
              <DialogDescription>
                Card ending in {card.last4}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="fraud-reason" className="text-sm font-medium">What happened?</Label>
                <textarea
                  id="fraud-reason"
                  placeholder="Describe the unauthorized transaction or fraudulent activity..."
                  className="w-full mt-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={4}
                />
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-900">
                  We'll review your report within 24-48 hours and take appropriate action if fraud is confirmed.
                </p>
              </div>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => {
                  reportFraud(card.id, card.last4);
                  const btn = document.querySelector('[data-cancel]') as HTMLButtonElement;
                  btn?.click();
                }}
              >
                Submit Fraud Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Cards</h1>
      </div>

      {/* Card Type Tabs */}
      <Tabs value={cardType} onValueChange={(value) => setCardType(value as 'virtual' | 'physical')} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="virtual" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Virtual Cards
          </TabsTrigger>
          <TabsTrigger value="physical" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Physical Cards
          </TabsTrigger>
        </TabsList>

        {/* Virtual Cards Tab */}
        <TabsContent value="virtual" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">Manage your instant digital payment cards</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Virtual Card</DialogTitle>
                  <DialogDescription>
                    Create a new virtual card with custom spending limits and controls.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  <div>
                    <Label htmlFor="nickname" className="text-sm font-medium">Card Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="e.g., Business, Travel, Shopping"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                    <Input
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="limit" className="text-sm font-medium">Spending Limit ($)</Label>
                    <Input
                      id="limit"
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(e.target.value ? Number(e.target.value) : '')}
                      placeholder="5000"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={createVirtualCard}
                    >
                      Create Card
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Virtual Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {virtualCards.map(card => (
              <Card key={card.id} className="overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Zap className="h-5 w-5 text-yellow-500" />
                      {card.nickname}
                    </CardTitle>
                    {card.isDefault && (
                      <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                        <CheckCircle className="h-4 w-4" />
                        Default
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <CardFlip3D
                    card={card}
                    isFront={flippedCardId !== card.id}
                    setIsFront={(isFront) => setFlippedCardId(isFront ? null : card.id)}
                  />

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 font-medium">Last 4</div>
                      <div className="font-semibold text-lg">•••• {card.last4}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 font-medium">Currency</div>
                      <div className="font-semibold">{card.currency}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-600 font-medium mb-1">Spending Limit</div>
                      <div className="text-2xl font-bold text-blue-600">${card.spendingLimit.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className={`p-3 rounded-lg flex items-center justify-between ${card.isFrozen ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                    <div className="flex items-center gap-2">
                      {card.isFrozen ? (
                        <>
                          <Lock className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-red-900">Card Frozen</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">Card Active</span>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFreeze(card.id, true)}
                      className={card.isFrozen ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                    >
                      {card.isFrozen ? (
                        <>
                          <Unlock className="h-3 w-3 mr-1" />
                          Unfreeze
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Freeze
                        </>
                      )}
                    </Button>
                  </div>

                  <CardActions card={card} isVirtual={true} />

                  <div className="flex gap-2 pt-2 border-t">
                    {!card.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => makeDefault(card.id, true)}
                        className="flex-1 text-xs"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Make Default
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeCard(card.id, true)}
                      className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Physical Cards Tab */}
        <TabsContent value="physical" className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-600 text-sm">Your physical debit and credit cards</p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Order Card
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Order Physical Card</DialogTitle>
                  <DialogDescription>
                    Order a new physical debit or credit card.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                  <div>
                    <Label htmlFor="phys-nickname" className="text-sm font-medium">Card Nickname</Label>
                    <Input
                      id="phys-nickname"
                      placeholder="e.g., Main Card"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phys-currency" className="text-sm font-medium">Currency</Label>
                    <Input
                      id="phys-currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="cardholder" className="text-sm font-medium">Cardholder Name</Label>
                    <Input
                      id="cardholder"
                      placeholder="Full name on card"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="delivery" className="text-sm font-medium">Delivery Address</Label>
                    <Input
                      id="delivery"
                      placeholder="Full delivery address"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="phys-limit" className="text-sm font-medium">Spending Limit ($)</Label>
                    <Input
                      id="phys-limit"
                      type="number"
                      value={spendingLimit}
                      onChange={(e) => setSpendingLimit(e.target.value ? Number(e.target.value) : '')}
                      placeholder="5000"
                      className="mt-1"
                    />
                  </div>
                  <div className="sm:col-span-2 flex gap-2">
                    <Button
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                      onClick={orderPhysicalCard}
                    >
                      Order Card
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Physical Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {physicalCards.map(card => {
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'delivered':
                  case 'active':
                    return 'bg-green-100 text-green-700 border-green-300';
                  case 'in-transit':
                    return 'bg-blue-100 text-blue-700 border-blue-300';
                  case 'ordered':
                    return 'bg-yellow-100 text-yellow-700 border-yellow-300';
                  case 'expired':
                    return 'bg-red-100 text-red-700 border-red-300';
                  default:
                    return 'bg-gray-100 text-gray-700 border-gray-300';
                }
              };

              const getStatusDisplay = (status: string) => {
                switch (status) {
                  case 'ordered':
                    return 'Order Placed';
                  case 'in-transit':
                    return 'In Transit';
                  case 'delivered':
                    return 'Delivered';
                  case 'active':
                    return 'Active';
                  case 'expired':
                    return 'Expired';
                  default:
                    return status;
                }
              };

              return (
                <Card key={card.id} className="overflow-hidden border-2 border-gray-200 hover:border-slate-300 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="h-5 w-5 text-slate-600" />
                        {card.nickname}
                      </CardTitle>
                      {card.isDefault && (
                        <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium">
                          <CheckCircle className="h-4 w-4" />
                          Default
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <PhysicalCardPreview card={card} />

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-600 font-medium">Last 4</div>
                        <div className="font-semibold text-lg">•••• {card.last4}</div>
                      </div>
                      <div>
                        <div className="text-gray-600 font-medium">Currency</div>
                        <div className="font-semibold">{card.currency}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-gray-600 font-medium mb-1">Spending Limit</div>
                        <div className="text-2xl font-bold text-blue-600">${card.spendingLimit.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className={`p-3 rounded-lg border ${getStatusColor(card.status)} text-sm font-medium`}>
                      {getStatusDisplay(card.status)}
                    </div>

                    {card.deliveryAddress && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                        <div className="text-gray-600 font-medium mb-1">Delivery Address</div>
                        <div className="text-gray-800">{card.deliveryAddress}</div>
                      </div>
                    )}

                    <div className={`p-3 rounded-lg flex items-center justify-between ${card.isFrozen ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center gap-2">
                        {card.isFrozen ? (
                          <>
                            <Lock className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-red-900">Card Frozen</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-900">Card Active</span>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFreeze(card.id, false)}
                        className={card.isFrozen ? 'border-red-300 text-red-600 hover:bg-red-50' : 'border-green-300 text-green-600 hover:bg-green-50'}
                      >
                        {card.isFrozen ? (
                          <>
                            <Unlock className="h-3 w-3 mr-1" />
                            Unfreeze
                          </>
                        ) : (
                          <>
                            <Lock className="h-3 w-3 mr-1" />
                            Freeze
                          </>
                        )}
                      </Button>
                    </div>

                    <CardActions card={card} isVirtual={false} />

                    <div className="flex gap-2 pt-2 border-t">
                      {!card.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => makeDefault(card.id, false)}
                          className="flex-1 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Make Default
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WalletCards;
