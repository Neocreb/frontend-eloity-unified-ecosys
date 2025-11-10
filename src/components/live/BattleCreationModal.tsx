import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Swords, 
  Users, 
  Trophy, 
  Settings,
  Crown,
  Zap
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { liveStreamService } from '@/services/liveStreamService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface BattleCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBattleStart?: (battleId: string) => void;
}

const BattleCreationModal: React.FC<BattleCreationModalProps> = ({ 
  open, 
  onOpenChange,
  onBattleStart
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [battleTitle, setBattleTitle] = useState('');
  const [battleDescription, setBattleDescription] = useState('');
  const [battleType, setBattleType] = useState('general');
  const [duration, setDuration] = useState(300); // 5 minutes default
  const [allowVoting, setAllowVoting] = useState(true);
  const [allowGifting, setAllowGifting] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const battleTypes = [
    { value: 'general', label: 'General Challenge' },
    { value: 'dance', label: 'Dance Battle' },
    { value: 'rap', label: 'Rap Battle' },
    { value: 'comedy', label: 'Comedy Showdown' },
    { value: 'gaming', label: 'Gaming Contest' },
    { value: 'music', label: 'Music Duel' },
    { value: 'art', label: 'Art Competition' },
    { value: 'cooking', label: 'Cooking Challenge' },
  ];
  
  const durations = [
    { value: 180, label: '3 minutes' },
    { value: 300, label: '5 minutes' },
    { value: 600, label: '10 minutes' },
    { value: 900, label: '15 minutes' },
    { value: 1800, label: '30 minutes' },
  ];
  
  const handleCreateBattle = async () => {
    if (!battleTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your battle.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      // First create a live stream for the battle
      const stream = await liveStreamService.createLiveStream({
        title: battleTitle,
        description: battleDescription,
        category: 'battle',
      });
      
      // Then create the battle
      const battle = await liveStreamService.createBattle({
        liveStreamId: stream.id,
        battleType: battleType as any,
      });
      
      toast({
        title: "Battle Created!",
        description: "Your creator battle is ready to start.",
      });
      
      onOpenChange(false);
      onBattleStart?.(battle.id);
      navigate(`/app/battle/${battle.id}`);
    } catch (error) {
      console.error("Error creating battle:", error);
      toast({
        title: "Error",
        description: "Failed to create battle. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[90vw] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-500" />
            Start Battle
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          {/* Battle Preview */}
          <div className="relative bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg overflow-hidden aspect-video">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <Swords className="w-12 h-12 mx-auto mb-2" />
                <p className="text-sm">Battle arena preview</p>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-500 text-white text-xs">
                    BATTLE PREVIEW
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {battleTitle || 'Untitled Battle'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Battle Information */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Battle Title *
              </label>
              <Input
                value={battleTitle}
                onChange={(e) => setBattleTitle(e.target.value)}
                placeholder="What's your battle challenge?"
                maxLength={100}
                className="text-base"
              />
              <p className="text-xs text-gray-500 mt-1">
                {battleTitle.length}/100
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Description
              </label>
              <Textarea
                value={battleDescription}
                onChange={(e) => setBattleDescription(e.target.value)}
                placeholder="Describe the battle rules and challenge..."
                rows={3}
                maxLength={500}
                className="text-base resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                {battleDescription.length}/500
              </p>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Battle Type
              </label>
              <Select value={battleType} onValueChange={setBattleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select battle type" />
                </SelectTrigger>
                <SelectContent>
                  {battleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">
                Duration
              </label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((dur) => (
                    <SelectItem key={dur.value} value={dur.value.toString()}>
                      {dur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Voting</div>
                  <div className="text-xs text-gray-500">Allow viewers to vote for creators</div>
                </div>
                <Switch
                  checked={allowVoting}
                  onCheckedChange={setAllowVoting}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Gifting</div>
                  <div className="text-xs text-gray-500">Allow viewers to send gifts</div>
                </div>
                <Switch
                  checked={allowGifting}
                  onCheckedChange={setAllowGifting}
                />
              </div>
            </div>
            
            {/* Battle Features */}
            <div className="bg-purple-900/20 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-purple-300">Battle Features</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Badge variant="secondary" className="text-xs justify-center">
                  <Trophy className="w-3 h-3 mr-1" />
                  Score Tracking
                </Badge>
                <Badge variant="secondary" className="text-xs justify-center">
                  <Users className="w-3 h-3 mr-1" />
                  Live Chat
                </Badge>
                <Badge variant="secondary" className="text-xs justify-center">
                  <Zap className="w-3 h-3 mr-1" />
                  Real-time Voting
                </Badge>
                <Badge variant="secondary" className="text-xs justify-center">
                  <Swords className="w-3 h-3 mr-1" />
                  Winner Announcement
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateBattle}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              disabled={!battleTitle.trim() || isCreating}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Swords className="w-4 h-4 mr-2" />
                  Start Battle
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleCreationModal;