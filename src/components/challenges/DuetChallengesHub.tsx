import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Calendar,
  Users,
  Eye,
  Heart,
  Star,
  Flame,
  Plus,
  Timer,
  Crown,
  Target,
  TrendingUp,
  Gift,
  Hash,
  Play,
  Award,
  Filter,
  Search,
  Clock,
  Zap,
  Coins,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Challenge {
  id: string;
  title: string;
  description: string;
  hashtag: string;
  originalPostId: string;
  createdBy: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'ended' | 'archived';
  isSponsored: boolean;
  isFeatured: boolean;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  participationReward: number;
  totalSubmissions: number;
  totalViews: number;
  totalLikes: number;
  bannerUrl?: string;
  rules: string;
  tags: string[];
}

interface ChallengeSubmission {
  id: string;
  challengeId: string;
  postId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified: boolean;
  };
  score: number;
  ranking: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  status: 'submitted' | 'qualified' | 'winner' | 'disqualified';
  rewardEarned: number;
  submittedAt: Date;
  videoUrl: string;
  thumbnailUrl: string;
}

interface DuetChallengesHubProps {
  userBalance: number;
  onCreateChallenge: () => void;
  onJoinChallenge: (challengeId: string) => void;
}

// Mock data for demonstration
const mockChallenges: Challenge[] = [
  {
    id: '1',
    title: 'Dance Fusion Challenge',
    description: 'Combine two different dance styles in one epic duet! Show us your creativity and skill.',
    hashtag: 'DanceFusionChallenge',
    originalPostId: 'post1',
    createdBy: {
      id: 'user1',
      username: 'dancemaster',
      displayName: 'DanceMaster Pro',
      avatar: '/api/placeholder/150/150',
      verified: true,
    },
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-02-15'),
    status: 'active',
    isSponsored: true,
    isFeatured: true,
    firstPrize: 1000,
    secondPrize: 500,
    thirdPrize: 250,
    participationReward: 25,
    totalSubmissions: 147,
    totalViews: 89420,
    totalLikes: 12340,
    bannerUrl: '/api/placeholder/400/200',
    rules: 'Must include two distinct dance styles. Original audio preferred. Clean content only.',
    tags: ['dance', 'fusion', 'creativity']
  },
  {
    id: '2',
    title: 'Comedy Sketch Duet',
    description: 'Create the funniest duet response! Make us laugh with your comedy skills.',
    hashtag: 'ComedyDuetChallenge',
    originalPostId: 'post2',
    createdBy: {
      id: 'user2',
      username: 'funnybone',
      displayName: 'Comedy Central',
      avatar: '/api/placeholder/150/150',
      verified: false,
    },
    startDate: new Date('2024-01-20'),
    endDate: new Date('2024-02-20'),
    status: 'active',
    isSponsored: false,
    isFeatured: false,
    firstPrize: 500,
    secondPrize: 250,
    thirdPrize: 100,
    participationReward: 10,
    totalSubmissions: 89,
    totalViews: 45230,
    totalLikes: 7890,
    rules: 'Keep it clean and funny. No offensive content.',
    tags: ['comedy', 'funny', 'entertainment']
  },
  {
    id: '3',
    title: 'Singing Harmony Challenge',
    description: 'Create beautiful harmonies with the original track. Show off your vocal skills!',
    hashtag: 'HarmonyChallenge',
    originalPostId: 'post3',
    createdBy: {
      id: 'user3',
      username: 'vocalguru',
      displayName: 'Vocal Harmony',
      avatar: '/api/placeholder/150/150',
      verified: true,
    },
    startDate: new Date('2024-01-10'),
    endDate: new Date('2024-01-31'),
    status: 'ended',
    isSponsored: false,
    isFeatured: true,
    firstPrize: 750,
    secondPrize: 375,
    thirdPrize: 150,
    participationReward: 15,
    totalSubmissions: 203,
    totalViews: 125680,
    totalLikes: 18940,
    rules: 'Must maintain harmony with original. Clear audio required.',
    tags: ['singing', 'harmony', 'music']
  }
];

const mockSubmissions: ChallengeSubmission[] = [
  {
    id: '1',
    challengeId: '1',
    postId: 'post_sub1',
    user: {
      id: 'user4',
      username: 'dancequeen',
      displayName: 'Dance Queen',
      avatar: '/api/placeholder/150/150',
      verified: false,
    },
    score: 9.2,
    ranking: 1,
    views: 12500,
    likes: 2340,
    comments: 156,
    shares: 89,
    status: 'qualified',
    rewardEarned: 0,
    submittedAt: new Date('2024-01-25'),
    videoUrl: '/api/placeholder/300/400',
    thumbnailUrl: '/api/placeholder/300/400'
  },
  {
    id: '2',
    challengeId: '1',
    postId: 'post_sub2',
    user: {
      id: 'user5',
      username: 'hiphopking',
      displayName: 'HipHop King',
      avatar: '/api/placeholder/150/150',
      verified: true,
    },
    score: 8.8,
    ranking: 2,
    views: 9800,
    likes: 1890,
    comments: 123,
    shares: 67,
    status: 'qualified',
    rewardEarned: 0,
    submittedAt: new Date('2024-01-26'),
    videoUrl: '/api/placeholder/300/400',
    thumbnailUrl: '/api/placeholder/300/400'
  }
];

const DuetChallengesHub: React.FC<DuetChallengesHubProps> = ({
  userBalance,
  onCreateChallenge,
  onJoinChallenge,
}) => {
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submissions, setSubmissions] = useState<ChallengeSubmission[]>(mockSubmissions);
  const [activeTab, setActiveTab] = useState('browse');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popularity');

  const { toast } = useToast();

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'ended':
        return 'bg-gray-500';
      case 'draft':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.hashtag.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || challenge.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const sortedChallenges = [...filteredChallenges].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.totalSubmissions - a.totalSubmissions;
      case 'prize':
        return b.firstPrize - a.firstPrize;
      case 'recent':
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      case 'ending':
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      default:
        return 0;
    }
  });

  const handleJoinChallenge = (challenge: Challenge) => {
    if (challenge.status !== 'active') {
      toast({
        title: 'Challenge Not Active',
        description: 'This challenge is not currently accepting submissions',
        variant: 'destructive',
      });
      return;
    }

    onJoinChallenge(challenge.id);
    toast({
      title: 'Joining Challenge! 🎯',
      description: `Creating your duet for ${challenge.title}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Duet Challenges</h1>
          <p className="text-gray-400">Compete, create, and earn rewards in epic duet challenges!</p>
        </div>
        
        <Button 
          onClick={onCreateChallenge}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Challenge
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="my-challenges">My Challenges</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters and Search */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search challenges..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>
                
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-40 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-40 bg-gray-700 border-gray-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="prize">Highest Prize</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="ending">Ending Soon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Featured Challenges */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Featured Challenges
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedChallenges
                .filter(challenge => challenge.isFeatured)
                .map((challenge) => (
                <Card key={challenge.id} className="bg-gray-800 border-gray-700 overflow-hidden group hover:border-purple-500 transition-colors">
                  {challenge.bannerUrl && (
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={challenge.bannerUrl} 
                        alt={challenge.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                      
                      <div className="absolute top-2 left-2 flex gap-2">
                        {challenge.isSponsored && (
                          <Badge className="bg-yellow-500 text-black">
                            <Crown className="w-3 h-3 mr-1" />
                            Sponsored
                          </Badge>
                        )}
                        {challenge.isFeatured && (
                          <Badge className="bg-purple-500">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>

                      <div className="absolute top-2 right-2">
                        <Badge className={cn('text-white', getStatusColor(challenge.status))}>
                          {challenge.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  )}

                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-white text-lg">{challenge.title}</h3>
                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{challenge.description}</p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-blue-400">
                        <Hash className="w-3 h-3" />
                        {challenge.hashtag}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {challenge.totalSubmissions}
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {challenge.totalViews.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {challenge.totalLikes.toLocaleString()}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-gray-400">Prize Pool:</span>
                          <span className="text-yellow-400 font-bold ml-1">
                            {challenge.firstPrize + challenge.secondPrize + challenge.thirdPrize} SP
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          <Clock className="w-3 h-3 inline mr-1" />
                          {getTimeRemaining(challenge.endDate)}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={challenge.createdBy.avatar} />
                          <AvatarFallback>{challenge.createdBy.displayName[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">by {challenge.createdBy.displayName}</span>
                        {challenge.createdBy.verified && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        )}
                      </div>

                      <Button
                        onClick={() => handleJoinChallenge(challenge)}
                        disabled={challenge.status !== 'active'}
                        className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                      >
                        {challenge.status === 'active' ? (
                          <>
                            <Play className="w-4 h-4 mr-2" />
                            Join Challenge
                          </>
                        ) : challenge.status === 'ended' ? (
                          'Challenge Ended'
                        ) : (
                          'Not Available'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Challenges */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">All Challenges</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {sortedChallenges
                .filter(challenge => !challenge.isFeatured)
                .map((challenge) => (
                <Card key={challenge.id} className="bg-gray-800 border-gray-700 hover:border-purple-500 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {challenge.bannerUrl && (
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={challenge.bannerUrl} 
                            alt={challenge.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-white">{challenge.title}</h3>
                            <p className="text-gray-400 text-sm line-clamp-1">{challenge.description}</p>
                          </div>
                          <Badge className={cn('text-white ml-2', getStatusColor(challenge.status))}>
                            {challenge.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {challenge.totalSubmissions}
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="w-3 h-3" />
                            {challenge.firstPrize} SP
                          </div>
                          <div className="flex items-center gap-1">
                            <Timer className="w-3 h-3" />
                            {getTimeRemaining(challenge.endDate)}
                          </div>
                        </div>

                        <Button
                          onClick={() => handleJoinChallenge(challenge)}
                          disabled={challenge.status !== 'active'}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                        >
                          {challenge.status === 'active' ? 'Join' : 'Ended'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          {selectedChallenge ? (
            <ChallengeLeaderboard 
              challenge={selectedChallenge}
              submissions={submissions.filter(sub => sub.challengeId === selectedChallenge.id)}
              onBack={() => setSelectedChallenge(null)}
            />
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Challenge Leaderboards</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenges.map((challenge) => (
                  <Card 
                    key={challenge.id} 
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:border-purple-500 transition-colors"
                    onClick={() => setSelectedChallenge(challenge)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-bold text-white">{challenge.title}</h3>
                          <Badge className={cn('text-white mt-1', getStatusColor(challenge.status))}>
                            {challenge.status.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="text-gray-400">Submissions:</div>
                          <div className="text-white">{challenge.totalSubmissions}</div>
                          <div className="text-gray-400">Top Prize:</div>
                          <div className="text-yellow-400">{challenge.firstPrize} SP</div>
                        </div>

                        <Button size="sm" className="w-full">
                          View Leaderboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-6">
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold text-gray-300 mb-2">Your Challenges</h3>
            <p className="text-gray-400 mb-4">
              Track your submitted challenges and winnings
            </p>
            <Button onClick={onCreateChallenge}>
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Challenge
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <RewardsSummary userBalance={userBalance} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for individual challenge leaderboard
const ChallengeLeaderboard: React.FC<{
  challenge: Challenge;
  submissions: ChallengeSubmission[];
  onBack: () => void;
}> = ({ challenge, submissions, onBack }) => {
  const sortedSubmissions = [...submissions].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          ← Back to Challenges
        </Button>
        <Badge className={cn('text-white', challenge.status === 'active' ? 'bg-green-500' : 'bg-gray-500')}>
          {challenge.status.toUpperCase()}
        </Badge>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            {challenge.title} - Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedSubmissions.map((submission, index) => (
              <div 
                key={submission.id} 
                className={cn(
                  "flex items-center gap-4 p-3 rounded-lg",
                  index === 0 && "bg-yellow-400/10 border border-yellow-400",
                  index === 1 && "bg-gray-400/10 border border-gray-400",
                  index === 2 && "bg-amber-600/10 border border-amber-600",
                  index > 2 && "bg-gray-700/50"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                  index === 0 && "bg-yellow-400 text-black",
                  index === 1 && "bg-gray-400 text-black",
                  index === 2 && "bg-amber-600 text-white",
                  index > 2 && "bg-gray-600 text-white"
                )}>
                  {index + 1}
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarImage src={submission.user.avatar} />
                  <AvatarFallback>{submission.user.displayName[0]}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{submission.user.displayName}</span>
                    {submission.user.verified && <div className="w-3 h-3 bg-blue-500 rounded-full" />}
                  </div>
                  <div className="text-sm text-gray-400">@{submission.user.username}</div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-yellow-400">{submission.score}</div>
                  <div className="text-xs text-gray-400">score</div>
                </div>

                <div className="text-right">
                  <div className="text-sm text-gray-300">{submission.views.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">views</div>
                </div>

                {index < 3 && challenge.status === 'ended' && (
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-400">
                      {index === 0 ? challenge.firstPrize : 
                       index === 1 ? challenge.secondPrize : 
                       challenge.thirdPrize} SP
                    </div>
                    <div className="text-xs text-gray-400">prize</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Rewards summary component
const RewardsSummary: React.FC<{ userBalance: number }> = ({ userBalance }) => {
  const mockEarnings = {
    totalEarned: 1250,
    challengesWon: 3,
    participationRewards: 15,
    pendingRewards: 75,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Rewards Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-600">
          <CardContent className="p-4 text-center">
            <Coins className="w-8 h-8 mx-auto text-yellow-400 mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{mockEarnings.totalEarned}</div>
            <div className="text-sm text-gray-400">Total Earned (SP)</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-600">
          <CardContent className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-purple-400 mb-2" />
            <div className="text-2xl font-bold text-purple-400">{mockEarnings.challengesWon}</div>
            <div className="text-sm text-gray-400">Challenges Won</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-600">
          <CardContent className="p-4 text-center">
            <Award className="w-8 h-8 mx-auto text-green-400 mb-2" />
            <div className="text-2xl font-bold text-green-400">{mockEarnings.participationRewards}</div>
            <div className="text-sm text-gray-400">Participation Rewards</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-600">
          <CardContent className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto text-blue-400 mb-2" />
            <div className="text-2xl font-bold text-blue-400">{mockEarnings.pendingRewards}</div>
            <div className="text-sm text-gray-400">Pending Rewards (SP)</div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle>Recent Challenge Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { challenge: 'Dance Fusion Challenge', action: 'Submitted entry', reward: 25, date: '2 hours ago' },
              { challenge: 'Comedy Sketch Duet', action: 'Won 2nd place', reward: 250, date: '1 day ago' },
              { challenge: 'Singing Harmony Challenge', action: 'Participation reward', reward: 15, date: '3 days ago' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">{activity.challenge}</div>
                  <div className="text-sm text-gray-400">{activity.action}</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+{activity.reward} SP</div>
                  <div className="text-xs text-gray-400">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DuetChallengesHub;
