import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { SuggestedUsers } from '@/components/gifts/SuggestedUsers';
import { VirtualGift } from '@/types/gifts';
import { 
  Gift, 
  Search, 
  User, 
  Heart, 
  Clock, 
  Send, 
  Plus,
  Sparkles
} from 'lucide-react';

interface QuickSendTabProps {
  onGiftSent: () => void;
}

const QuickSendTab = ({ onGiftSent }: QuickSendTabProps) => {
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedGift, setSelectedGift] = useState<VirtualGift | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Sample popular gifts for quick send
  const popularGifts = [
    {
      id: '1',
      name: 'Rose',
      price: 1.99,
      emoji: '🌹',
      category: 'flowers',
      rarity: 'common'
    },
    {
      id: '2',
      name: 'Chocolate',
      price: 2.99,
      emoji: '🍫',
      category: 'food',
      rarity: 'common'
    },
    {
      id: '3',
      name: 'Diamond Ring',
      price: 9.99,
      emoji: '💍',
      category: 'jewelry',
      rarity: 'rare'
    },
    {
      id: '4',
      name: 'Crown',
      price: 19.99,
      emoji: '👑',
      category: 'royal',
      rarity: 'epic'
    }
  ];

  const handleSendGift = async () => {
    if (!selectedUser || !selectedGift) {
      toast({
        title: 'Missing Information',
        description: 'Please select both a recipient and a gift.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSending(true);
      
      // Simulate gift sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Gift Sent!',
        description: `Successfully sent ${quantity}x ${selectedGift.name} to ${selectedUser.username}`,
      });
      
      // Reset form
      setSelectedUser(null);
      setSelectedGift(null);
      setQuantity(1);
      setMessage('');
      
      // Notify parent to refresh data
      onGiftSent();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send gift. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            Quick Send Gift
          </CardTitle>
          <CardDescription>
            Send a gift instantly with our 3-step process
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Step 1: Select Recipient */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Step 1: Select Recipient
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for a creator..."
                className="pl-10 text-sm"
              />
            </div>
          </div>

          {/* Suggested Users */}
          <div className="pt-2">
            <SuggestedUsers
              maxUsers={4}
              showGiftButton={false}
              variant="grid"
            />
          </div>

          {selectedUser && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <img 
                src={selectedUser.avatar_url || '/placeholder-user.jpg'} 
                alt={selectedUser.username} 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium">{selectedUser.username}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedUser(null)}
                className="ml-auto h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          )}

          {/* Step 2: Choose Gift */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Step 2: Choose Gift
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {popularGifts.map((gift) => (
                <Button
                  key={gift.id}
                  variant={selectedGift?.id === gift.id ? "default" : "outline"}
                  className="flex flex-col items-center justify-center h-20 sm:h-24 p-2 text-center"
                  onClick={() => setSelectedGift(gift)}
                >
                  <span className="text-lg sm:text-xl mb-1">{gift.emoji}</span>
                  <span className="text-xs font-medium truncate w-full">{gift.name}</span>
                  <span className="text-xs text-muted-foreground">${gift.price}</span>
                </Button>
              ))}
            </div>
          </div>

          {selectedGift && (
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <span className="text-lg">{selectedGift.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{selectedGift.name}</p>
                <p className="text-xs text-muted-foreground">${selectedGift.price} each</p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </Button>
                <span className="text-sm w-6 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  +
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedGift(null)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          )}

          {/* Step 3: Add Message */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Step 3: Add Message (Optional)
            </Label>
            <Textarea
              placeholder="Add a personal message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-sm"
              rows={3}
            />
          </div>

          {/* Send Button */}
          <Button
            className="w-full"
            size="lg"
            disabled={!selectedUser || !selectedGift || isSending}
            onClick={handleSendGift}
          >
            {isSending ? (
              <>
                <Clock className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send {quantity}x {selectedGift?.name || 'Gift'} for ${(selectedGift ? (selectedGift.price * quantity).toFixed(2) : '0.00')}
              </>
            )}
          </Button>

          <Alert className="text-sm">
            <Heart className="h-4 w-4" />
            <AlertDescription>
              Your gift will be delivered instantly and appear on the creator's profile.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickSendTab;
