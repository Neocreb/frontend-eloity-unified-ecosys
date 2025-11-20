import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Swords, 
  Users, 
  Trophy, 
  Settings,
  Crown,
  Zap,
  Search,
  X,
  ChevronLeft,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { liveStreamService } from '@/services/liveStreamService';
import { UserService, UserWithProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const CreateBattle: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [battleTitle, setBattleTitle] = useState('');
  const [battleDescription, setBattleDescription] = useState('');
  const [battleType, setBattleType] = useState('general');
  const [duration, setDuration] = useState(300);
  const [allowVoting, setAllowVoting] = useState(true);
  const [allowGifting, setAllowGifting] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  
  const [selectedOpponent, setSelectedOpponent] = useState<UserWithProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserWithProfile[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
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
  
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.trim() === '') {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await UserService.searchUsers(searchQuery, 10);
        const filteredResults = results.filter(u => u.id !== user?.id);
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error searching users:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };
    
    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, user?.id]);
  
  const handleCreateBattle = async () => {
    if (!battleTitle.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your battle.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedOpponent) {
      toast({
        title: "Opponent Required",
        description: "Please select an opponent for the battle.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const stream = await liveStreamService.createLiveStream({
        title: battleTitle,
        description: battleDescription,
        category: 'battle',
      });
      
      const battle = await liveStreamService.createBattle({
        liveStreamId: stream.id,
        battleType: battleType as any,
        opponentId: selectedOpponent.id,
      });
      
      toast({
        title: "Battle Created!",
        description: "Your creator battle is ready to start.",
      });
      
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
  
  const handleSelectOpponent = (user: UserWithProfile) => {
    setSelectedOpponent(user);
    setShowUserSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleRemoveOpponent = () => {
    setSelectedOpponent(null);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b p-4 z-10">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-0 h-auto"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-purple-600" />
            <h1 className="text-xl font-bold">Start Battle</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Battle Preview */}
          <div className="relative bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg overflow-hidden aspect-video border">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Swords className="w-12 h-12 mx-auto mb-2 text-purple-600" />
                <p className="text-sm">Battle arena preview</p>
              </div>
            </div>
            
            <div className="absolute bottom-2 left-2 right-2">
              <div className="bg-black/50 rounded-lg p-2">
                <div className="flex items-center gap-2">
                  <Badge className="bg-purple-600 text-white text-xs">
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
          
          {/* Opponent Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select Opponent *
            </label>
            {selectedOpponent ? (
              <div className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedOpponent.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedOpponent.username?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">@{selectedOpponent.username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveOpponent}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start text-gray-600"
                onClick={() => setShowUserSearch(true)}
              >
                <Users className="w-4 h-4 mr-2" />
                Select opponent
              </Button>
            )}
            {!selectedOpponent && (
              <p className="text-xs text-red-600">You must select an opponent to start a battle</p>
            )}
          </div>

          {/* User Search */}
          {showUserSearch && (
            <div className="bg-white rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Select Opponent</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUserSearch(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {isSearching ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                      onClick={() => handleSelectOpponent(user)}
                    >
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {user.username?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">
                          {user.full_name || user.username}
                        </div>
                        <div className="text-xs text-gray-600">
                          @{user.username}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchQuery.trim() !== '' ? (
                <div className="text-center py-4 text-gray-600">
                  No users found
                </div>
              ) : null}
            </div>
          )}
          
          {/* Battle Information */}
          <div className="bg-white rounded-lg border p-4 space-y-4">
            <h3 className="font-medium">Battle Details</h3>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Battle Title *
              </label>
              <Input
                value={battleTitle}
                onChange={(e) => setBattleTitle(e.target.value)}
                placeholder="What's your battle challenge?"
                maxLength={100}
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
                className="resize-none"
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
            
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Voting</div>
                  <div className="text-xs text-gray-600">Allow viewers to vote for creators</div>
                </div>
                <Switch
                  checked={allowVoting}
                  onCheckedChange={setAllowVoting}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Enable Gifting</div>
                  <div className="text-xs text-gray-600">Allow viewers to send gifts</div>
                </div>
                <Switch
                  checked={allowGifting}
                  onCheckedChange={setAllowGifting}
                />
              </div>
            </div>
          </div>

          {/* Battle Features */}
          <div className="bg-purple-50 rounded-lg border border-purple-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-purple-900">Battle Features</span>
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
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t p-4">
        <div className="max-w-2xl mx-auto flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBattle}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            disabled={!battleTitle.trim() || !selectedOpponent || isCreating}
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
    </div>
  );
};

export default CreateBattle;
