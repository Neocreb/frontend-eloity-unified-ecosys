import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Users,
  Clock,
  Target,
  Search,
  X,
  ArrowRight,
  Crown,
  Zap,
  Settings,
  Gift,
  Play,
  Calendar,
  Globe,
  Lock,
  Trophy,
  Flame,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Creator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  tier: 'rising_star' | 'pro_creator' | 'legend';
  followers: number;
  battlesWon: number;
  battlesLost: number;
  isOnline: boolean;
  lastSeen?: string;
}

interface BattleSetupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBattleStart: (battleConfig: BattleConfig) => void;
}

interface BattleConfig {
  title: string;
  description: string;
  duration: number;
  battleType: 'instant' | 'scheduled';
  inviteeId?: string;
  allowVoting: boolean;
  isPublic: boolean;
  scheduledFor?: Date;
  tags: string[];
}

const mockCreators: Creator[] = [
  {
    id: '1',
    username: 'dancemaster',
    displayName: 'Dance Master',
    avatar: 'https://i.pravatar.cc/150?img=3',
    verified: true,
    tier: 'legend',
    followers: 892000,
    battlesWon: 45,
    battlesLost: 12,
    isOnline: true,
  },
  {
    id: '2',
    username: 'singer_star',
    displayName: 'Melody Queen',
    avatar: 'https://i.pravatar.cc/150?img=5',
    verified: true,
    tier: 'pro_creator',
    followers: 234000,
    battlesWon: 23,
    battlesLost: 8,
    isOnline: true,
  },
  {
    id: '3',
    username: 'comedykid',
    displayName: 'Comedy Kid',
    avatar: 'https://i.pravatar.cc/150?img=7',
    verified: false,
    tier: 'rising_star',
    followers: 45000,
    battlesWon: 8,
    battlesLost: 3,
    isOnline: false,
    lastSeen: '2 hours ago',
  },
];

const BattleSetup: React.FC<BattleSetupProps> = ({ open, onOpenChange, onBattleStart }) => {
  const [step, setStep] = useState(1);
  const [battleConfig, setBattleConfig] = useState<BattleConfig>({
    title: '',
    description: '',
    duration: 300, // 5 minutes default
    battleType: 'instant',
    allowVoting: true,
    isPublic: true,
    tags: [],
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStartBattle = async () => {
    if (!battleConfig.title.trim()) {
      toast({
        title: 'Title Required',
        description: 'Please enter a title for your battle',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const finalConfig = {
        ...battleConfig,
        inviteeId: selectedCreator?.id,
      };
      
      onBattleStart(finalConfig);
      onOpenChange(false);
      setIsLoading(false);
      setStep(1);
      setBattleConfig({
        title: '',
        description: '',
        duration: 300,
        battleType: 'instant',
        allowVoting: true,
        isPublic: true,
        tags: [],
      });
      setSelectedCreator(null);
    }, 2000);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'legend':
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'pro_creator':
        return <Trophy className="w-4 h-4 text-purple-400" />;
      case 'rising_star':
        return <Sparkles className="w-4 h-4 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'legend':
        return 'border-yellow-400 bg-yellow-400/10';
      case 'pro_creator':
        return 'border-purple-400 bg-purple-400/10';
      case 'rising_star':
        return 'border-blue-400 bg-blue-400/10';
      default:
        return 'border-gray-400 bg-gray-400/10';
    }
  };

  const filteredCreators = mockCreators.filter(creator =>
    creator.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    creator.displayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            Start Live Battle
            <Badge variant="secondary" className="ml-2">
              Step {step} of 3
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="flex gap-2">
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={cn(
                  "flex-1 h-2 rounded-full transition-colors",
                  stepNum <= step ? "bg-yellow-400" : "bg-gray-700"
                )}
              />
            ))}
          </div>

          {/* Step 1: Battle Details */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Battle Configuration</h3>
                <p className="text-gray-400 text-sm">Set up your live battle details</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Battle Title *</Label>
                  <Input
                    id="title"
                    value={battleConfig.title}
                    onChange={(e) => setBattleConfig({ ...battleConfig, title: e.target.value })}
                    placeholder="Epic Dance Battle 🔥"
                    className="bg-gray-800 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={battleConfig.description}
                    onChange={(e) => setBattleConfig({ ...battleConfig, description: e.target.value })}
                    placeholder="Show your best moves and let the audience decide!"
                    className="bg-gray-800 border-gray-600 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Battle Duration: {formatDuration(battleConfig.duration)}</Label>
                  <div className="mt-2">
                    <Slider
                      value={[battleConfig.duration]}
                      onValueChange={([value]) => setBattleConfig({ ...battleConfig, duration: value })}
                      min={60}
                      max={900}
                      step={30}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1 min</span>
                      <span>5 min</span>
                      <span>15 min</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="voting">Allow Voting</Label>
                    <Switch
                      id="voting"
                      checked={battleConfig.allowVoting}
                      onCheckedChange={(checked) => setBattleConfig({ ...battleConfig, allowVoting: checked })}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="public">Public Battle</Label>
                    <Switch
                      id="public"
                      checked={battleConfig.isPublic}
                      onCheckedChange={(checked) => setBattleConfig({ ...battleConfig, isPublic: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto p-4",
                      battleConfig.battleType === 'instant' && "border-yellow-400 bg-yellow-400/10"
                    )}
                    onClick={() => setBattleConfig({ ...battleConfig, battleType: 'instant' })}
                  >
                    <div className="text-center">
                      <Zap className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Instant Battle</div>
                      <div className="text-xs text-gray-400">Start immediately</div>
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className={cn(
                      "h-auto p-4",
                      battleConfig.battleType === 'scheduled' && "border-yellow-400 bg-yellow-400/10"
                    )}
                    onClick={() => setBattleConfig({ ...battleConfig, battleType: 'scheduled' })}
                  >
                    <div className="text-center">
                      <Calendar className="w-6 h-6 mx-auto mb-2" />
                      <div className="font-medium">Scheduled</div>
                      <div className="text-xs text-gray-400">Set a time</div>
                    </div>
                  </Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleNext} className="bg-yellow-600 hover:bg-yellow-700">
                  Next: Choose Opponent
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Opponent */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Choose Your Opponent</h3>
                <p className="text-gray-400 text-sm">Invite a creator or auto-match with someone online</p>
              </div>

              <Tabs defaultValue="invite" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger value="invite">Invite Creator</TabsTrigger>
                  <TabsTrigger value="automatch">Auto Match</TabsTrigger>
                </TabsList>

                <TabsContent value="invite" className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search creators..."
                      className="pl-10 bg-gray-800 border-gray-600"
                    />
                  </div>

                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {filteredCreators.map((creator) => (
                        <Card
                          key={creator.id}
                          className={cn(
                            "cursor-pointer transition-all hover:bg-gray-700/50",
                            selectedCreator?.id === creator.id && "border-yellow-400 bg-yellow-400/10",
                            getTierColor(creator.tier)
                          )}
                          onClick={() => setSelectedCreator(creator)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={creator.avatar} />
                                  <AvatarFallback>{creator.displayName[0]}</AvatarFallback>
                                </Avatar>
                                {creator.isOnline && (
                                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" />
                                )}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{creator.displayName}</span>
                                  {creator.verified && (
                                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                      <div className="w-2 h-2 bg-white rounded-full" />
                                    </div>
                                  )}
                                  {getTierIcon(creator.tier)}
                                </div>
                                <div className="text-sm text-gray-400">
                                  @{creator.username} • {creator.followers.toLocaleString()} followers
                                </div>
                                <div className="flex gap-4 text-xs text-gray-500 mt-1">
                                  <span>🏆 {creator.battlesWon} wins</span>
                                  <span>💔 {creator.battlesLost} losses</span>
                                  {!creator.isOnline && creator.lastSeen && (
                                    <span>Last seen {creator.lastSeen}</span>
                                  )}
                                </div>
                              </div>

                              {creator.isOnline && (
                                <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                                  Online
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="automatch" className="space-y-4">
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-10 h-10 text-yellow-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Smart Auto-Match</h4>
                    <p className="text-gray-400 text-sm mb-4">
                      We'll find a creator with similar skills and tier level who's ready to battle
                    </p>
                    <Button variant="outline" className="border-yellow-400 text-yellow-400">
                      <Zap className="w-4 h-4 mr-2" />
                      Find Match
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleNext} 
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={!selectedCreator}
                >
                  Next: Review & Start
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Start */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Ready to Battle!</h3>
                <p className="text-gray-400 text-sm">Review your battle setup and start when ready</p>
              </div>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Battle Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="font-medium text-yellow-400">{battleConfig.title}</div>
                    {battleConfig.description && (
                      <div className="text-sm text-gray-400 mt-1">{battleConfig.description}</div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400">Duration</div>
                      <div className="font-medium">{formatDuration(battleConfig.duration)}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Type</div>
                      <div className="font-medium capitalize">{battleConfig.battleType}</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {battleConfig.allowVoting && (
                      <Badge variant="secondary" className="bg-green-600/20 text-green-400">
                        <Gift className="w-3 h-3 mr-1" />
                        Voting Enabled
                      </Badge>
                    )}
                    <Badge variant="secondary" className={battleConfig.isPublic ? "bg-blue-600/20 text-blue-400" : "bg-gray-600/20 text-gray-400"}>
                      {battleConfig.isPublic ? <Globe className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                      {battleConfig.isPublic ? 'Public' : 'Private'}
                    </Badge>
                  </div>

                  {selectedCreator && (
                    <div>
                      <div className="text-gray-400 text-sm mb-2">Opponent</div>
                      <div className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={selectedCreator.avatar} />
                          <AvatarFallback>{selectedCreator.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{selectedCreator.displayName}</span>
                            {selectedCreator.verified && (
                              <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            )}
                            {getTierIcon(selectedCreator.tier)}
                          </div>
                          <div className="text-xs text-gray-400">
                            @{selectedCreator.username}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={handleBack}>
                  Back
                </Button>
                <Button 
                  onClick={handleStartBattle} 
                  className="bg-yellow-600 hover:bg-yellow-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Starting Battle...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Start Battle!
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BattleSetup;
