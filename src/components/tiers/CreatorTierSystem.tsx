// @ts-nocheck
import React, { useState, useEffect } from 'react';
import {
  Crown,
  Trophy,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Video,
  Heart,
  Zap,
  Gift,
  Medal,
  Target,
  Flame,
  Award,
  ChevronRight,
  Lock,
  Unlock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface CreatorTier {
  id: string;
  name: string;
  level: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  requirements: {
    duets?: number;
    battleWins?: number;
    views?: number;
    followers?: number;
    challengeWins?: number;
  };
  perks: string[];
  rewards: {
    softPointsBonus: number;
    monthlyBonus: number;
    specialFeatures: string[];
  };
}

export interface UserTierProgress {
  currentTier: string;
  tierPoints: number;
  stats: {
    totalViews: number;
    totalDuets: number;
    battlesWon: number;
    battlesLost: number;
    challengesWon: number;
    totalEarnings: number;
    followers: number;
  };
  badges: string[];
  nextTierProgress: number;
}

interface CreatorTierSystemProps {
  userProgress: UserTierProgress;
  onUpgrade?: (newTier: string) => void;
}

const tiers: CreatorTier[] = [
  {
    id: 'rising_star',
    name: 'Rising Star',
    level: 1,
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400',
    requirements: {
      duets: 5,
      battleWins: 1,
    },
    perks: [
      '+10 SP bonus per video',
      'Basic analytics access',
      'Standard support',
    ],
    rewards: {
      softPointsBonus: 10,
      monthlyBonus: 50,
      specialFeatures: ['Basic Analytics'],
    },
  },
  {
    id: 'pro_creator',
    name: 'Pro Creator',
    level: 2,
    icon: <Trophy className="w-5 h-5" />,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400',
    requirements: {
      views: 10000,
      battleWins: 5,
      followers: 1000,
    },
    perks: [
      '+25 SP bonus per video',
      'Featured feed access',
      'Advanced analytics',
      'Priority support',
      'Custom badges',
    ],
    rewards: {
      softPointsBonus: 25,
      monthlyBonus: 200,
      specialFeatures: ['Featured Feed', 'Advanced Analytics', 'Custom Badges'],
    },
  },
  {
    id: 'legend',
    name: 'Legend',
    level: 3,
    icon: <Crown className="w-5 h-5" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-400/10',
    borderColor: 'border-yellow-400',
    requirements: {
      views: 100000,
      battleWins: 25,
      followers: 10000,
      challengeWins: 3,
    },
    perks: [
      '+50 SP bonus per video',
      'Monthly SP prize (1000 SP)',
      'VIP creator access',
      'Personal manager',
      'Featured homepage',
      'Exclusive events',
      'Revenue sharing',
    ],
    rewards: {
      softPointsBonus: 50,
      monthlyBonus: 1000,
      specialFeatures: [
        'VIP Access',
        'Personal Manager',
        'Homepage Featured',
        'Revenue Sharing',
        'Exclusive Events',
      ],
    },
  },
];

const badges = {
  first_battle_win: { name: 'First Victory', icon: '🏆', description: 'Won your first battle' },
  viral_duet: { name: 'Viral Star', icon: '🌟', description: 'Duet reached 100K views' },
  challenge_master: { name: 'Challenge Master', icon: '🎯', description: 'Won 3 duet challenges' },
  gift_magnet: { name: 'Gift Magnet', icon: '🎁', description: 'Received 1000+ SP in gifts' },
  consistency_king: { name: 'Consistency King', icon: '📅', description: 'Posted for 30 days straight' },
  collaboration_expert: { name: 'Collab Expert', icon: '🤝', description: 'Created 50+ duets' },
};

const CreatorTierSystem: React.FC<CreatorTierSystemProps> = ({ userProgress, onUpgrade }) => {
  const [selectedTier, setSelectedTier] = useState<CreatorTier>(tiers[0]);
  const [showUpgradeAnimation, setShowUpgradeAnimation] = useState(false);

  const currentTier = tiers.find(tier => tier.id === userProgress.currentTier) || tiers[0];
  const nextTier = tiers.find(tier => tier.level === currentTier.level + 1);

  useEffect(() => {
    setSelectedTier(currentTier);
  }, [currentTier]);

  const calculateProgress = () => {
    if (!nextTier) return 100;

    const requirements = nextTier.requirements;
    const stats = userProgress.stats;
    
    const progressMetrics = [];
    
    if (requirements.duets) {
      progressMetrics.push(Math.min((stats.totalDuets / requirements.duets) * 100, 100));
    }
    if (requirements.battleWins) {
      progressMetrics.push(Math.min((stats.battlesWon / requirements.battleWins) * 100, 100));
    }
    if (requirements.views) {
      progressMetrics.push(Math.min((stats.totalViews / requirements.views) * 100, 100));
    }
    if (requirements.followers) {
      progressMetrics.push(Math.min((stats.followers / requirements.followers) * 100, 100));
    }
    if (requirements.challengeWins) {
      progressMetrics.push(Math.min((stats.challengesWon / requirements.challengeWins) * 100, 100));
    }

    return progressMetrics.length > 0 
      ? progressMetrics.reduce((sum, metric) => sum + metric, 0) / progressMetrics.length
      : 0;
  };

  const isRequirementMet = (requirement: keyof typeof nextTier.requirements, value: number) => {
    if (!nextTier || !nextTier.requirements[requirement]) return true;
    return value >= nextTier.requirements[requirement]!;
  };

  const canUpgrade = () => {
    if (!nextTier) return false;
    const progress = calculateProgress();
    return progress >= 100;
  };

  const handleUpgrade = () => {
    if (canUpgrade() && nextTier) {
      setShowUpgradeAnimation(true);
      setTimeout(() => {
        onUpgrade?.(nextTier.id);
        setShowUpgradeAnimation(false);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Tier Status */}
      <Card className={cn("border-2", currentTier.borderColor, currentTier.bgColor)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("p-3 rounded-full", currentTier.bgColor)}>
                <div className={currentTier.color}>{currentTier.icon}</div>
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {currentTier.name}
                  <Badge variant="secondary" className={cn("text-xs", currentTier.color)}>
                    Level {currentTier.level}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-400 mt-1">
                  {userProgress.tierPoints.toLocaleString()} tier points
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-white">
                +{currentTier.rewards.softPointsBonus} SP
              </div>
              <div className="text-sm text-gray-400">per video</div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {nextTier && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Progress to {nextTier.name}</span>
                  <span className="text-sm font-medium">{Math.round(calculateProgress())}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-2" />
              </div>

              {canUpgrade() && (
                <Button
                  onClick={handleUpgrade}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-bold"
                  disabled={showUpgradeAnimation}
                >
                  {showUpgradeAnimation ? (
                    <>
                      <Star className="w-4 h-4 mr-2 animate-spin" />
                      Upgrading...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Upgrade to {nextTier.name}!
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tier Overview */}
      <Tabs defaultValue="tiers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="tiers">Tiers</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <div className="grid gap-4">
            {tiers.map((tier) => {
              const isUnlocked = tier.level <= currentTier.level;
              const isCurrent = tier.id === currentTier.id;
              
              return (
                <Card
                  key={tier.id}
                  className={cn(
                    "cursor-pointer transition-all hover:bg-gray-800/50",
                    isCurrent && `border-2 ${tier.borderColor} ${tier.bgColor}`,
                    !isUnlocked && "opacity-50"
                  )}
                  onClick={() => setSelectedTier(tier)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className={cn("p-3 rounded-full", tier.bgColor)}>
                        <div className={tier.color}>
                          {isUnlocked ? tier.icon : <Lock className="w-5 h-5" />}
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{tier.name}</h3>
                          <Badge variant="outline" className="text-xs">
                            Level {tier.level}
                          </Badge>
                          {isCurrent && (
                            <Badge className="text-xs bg-green-600">CURRENT</Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-400 mb-2">
                          +{tier.rewards.softPointsBonus} SP bonus • Monthly: {tier.rewards.monthlyBonus} SP
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {tier.perks.slice(0, 3).map((perk, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {perk}
                            </Badge>
                          ))}
                          {tier.perks.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{tier.perks.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Selected Tier Details */}
          {selectedTier && (
            <Card className="bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={selectedTier.color}>{selectedTier.icon}</div>
                  {selectedTier.name} Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Requirements */}
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedTier.requirements).map(([key, value]) => {
                      const userValue = userProgress.stats[key as keyof typeof userProgress.stats] || 0;
                      const isMet = isRequirementMet(key as any, userValue);
                      
                      return (
                        <div key={key} className={cn("flex items-center gap-2", isMet ? "text-green-400" : "text-gray-400")}>
                          {isMet ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}: {userValue.toLocaleString()}/{value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Perks */}
                <div>
                  <h4 className="font-medium mb-2">Perks & Benefits</h4>
                  <div className="space-y-1">
                    {selectedTier.perks.map((perk, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <Star className="w-3 h-3 text-yellow-400" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Features */}
                <div>
                  <h4 className="font-medium mb-2">Special Features</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedTier.rewards.specialFeatures.map((feature, index) => (
                      <Badge key={index} className={cn("text-xs", selectedTier.color)}>
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(badges).map(([badgeId, badge]) => {
              const hasEarned = userProgress.badges.includes(badgeId);
              
              return (
                <Card
                  key={badgeId}
                  className={cn(
                    "text-center p-4",
                    hasEarned ? "border-yellow-400 bg-yellow-400/10" : "opacity-50"
                  )}
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <h3 className="font-medium mb-1">{badge.name}</h3>
                  <p className="text-xs text-gray-400">{badge.description}</p>
                  {hasEarned && (
                    <Badge className="mt-2 bg-yellow-600 text-black">
                      EARNED
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center p-4">
              <Video className="w-8 h-8 mx-auto mb-2 text-blue-400" />
              <div className="text-2xl font-bold">{userProgress.stats.totalViews.toLocaleString()}</div>
              <div className="text-xs text-gray-400">Total Views</div>
            </Card>
            
            <Card className="text-center p-4">
              <Users className="w-8 h-8 mx-auto mb-2 text-green-400" />
              <div className="text-2xl font-bold">{userProgress.stats.totalDuets}</div>
              <div className="text-xs text-gray-400">Duets Created</div>
            </Card>
            
            <Card className="text-center p-4">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
              <div className="text-2xl font-bold">{userProgress.stats.battlesWon}</div>
              <div className="text-xs text-gray-400">Battles Won</div>
            </Card>
            
            <Card className="text-center p-4">
              <Target className="w-8 h-8 mx-auto mb-2 text-purple-400" />
              <div className="text-2xl font-bold">{userProgress.stats.challengesWon}</div>
              <div className="text-xs text-gray-400">Challenges Won</div>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-medium mb-4">Performance Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Battle Win Rate</span>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={(userProgress.stats.battlesWon / (userProgress.stats.battlesWon + userProgress.stats.battlesLost)) * 100 || 0} 
                    className="w-20 h-2" 
                  />
                  <span className="text-sm font-medium">
                    {Math.round((userProgress.stats.battlesWon / (userProgress.stats.battlesWon + userProgress.stats.battlesLost)) * 100) || 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Earnings</span>
                <span className="text-sm font-medium text-green-400">
                  {userProgress.stats.totalEarnings.toLocaleString()} SP
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Followers</span>
                <span className="text-sm font-medium">
                  {userProgress.stats.followers.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Animation */}
      {showUpgradeAnimation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <div className="text-2xl font-bold mb-2">Tier Upgraded!</div>
            <div className="text-lg">Welcome to {nextTier?.name}!</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorTierSystem;
