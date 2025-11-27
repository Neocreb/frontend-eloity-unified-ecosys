import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Gift, 
  DollarSign, 
  Users, 
  Calendar,
  RefreshCw,
  Crown,
  Heart,
  Zap
} from 'lucide-react';

interface AnalyticsTabProps {
  onRefresh: () => void;
}

const AnalyticsTab = ({ onRefresh }: AnalyticsTabProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');

  // Mock data for analytics
  const spendingData = [
    { day: 'Mon', gifts: 4, tips: 2, total: 6 },
    { day: 'Tue', gifts: 3, tips: 1, total: 4 },
    { day: 'Wed', gifts: 6, tips: 3, total: 9 },
    { day: 'Thu', gifts: 2, tips: 4, total: 6 },
    { day: 'Fri', gifts: 8, tips: 5, total: 13 },
    { day: 'Sat', gifts: 5, tips: 7, total: 12 },
    { day: 'Sun', gifts: 7, tips: 6, total: 13 },
  ];

  const giftDistribution = [
    { name: 'Flowers', value: 35 },
    { name: 'Food', value: 25 },
    { name: 'Jewelry', value: 20 },
    { name: 'Royal', value: 15 },
    { name: 'Other', value: 5 },
  ];

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe'];

  const topRecipients = [
    { id: '1', username: 'CreatorOne', avatar: '/placeholder-user.jpg', gifts: 12, tips: 8, total: 20 },
    { id: '2', username: 'ArtistPro', avatar: '/placeholder-user.jpg', gifts: 9, tips: 15, total: 24 },
    { id: '3', username: 'StreamKing', avatar: '/placeholder-user.jpg', gifts: 15, tips: 5, total: 20 },
    { id: '4', username: 'MusicMaster', avatar: '/placeholder-user.jpg', gifts: 7, tips: 12, total: 19 },
  ];

  const stats = {
    totalGifts: 45,
    totalTips: 38,
    totalSpent: 127.45,
    topGift: 'Golden Crown',
    favoriteCreator: 'ArtistPro',
    avgGiftValue: 2.83,
  };

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      onRefresh();
      toast({
        title: 'Analytics Updated',
        description: 'Your analytics data has been refreshed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh analytics. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/20 border-purple-500/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-purple-300">Total Gifts</p>
                <p className="text-lg sm:text-xl font-bold text-purple-50">{stats.totalGifts}</p>
              </div>
              <Gift className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-blue-300">Total Tips</p>
                <p className="text-lg sm:text-xl font-bold text-blue-50">{stats.totalTips}</p>
              </div>
              <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/20 border-green-500/30">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-green-300">Total Spent</p>
                <p className="text-lg sm:text-xl font-bold text-green-50">${stats.totalSpent.toFixed(2)}</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Spending Over Time */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                  Spending Over Time
                </CardTitle>
                <CardDescription>
                  Your gift and tip activity over the past week
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="gifts" name="Gifts" fill="#8884d8" />
                <Bar dataKey="tips" name="Tips" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gift Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Gift className="h-4 w-4 sm:h-5 sm:w-5" />
              Gift Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of gifts by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={giftDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {giftDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Recipients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            Top Recipients
          </CardTitle>
          <CardDescription>
            Creators you've supported the most
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topRecipients.map((recipient) => (
              <div key={recipient.id} className="flex items-center justify-between p-3 hover:bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <img 
                    src={recipient.avatar} 
                    alt={recipient.username} 
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-medium">{recipient.username}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        {recipient.gifts} gifts
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {recipient.tips} tips
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{recipient.total}</p>
                  <p className="text-xs text-muted-foreground">total interactions</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-full">
                <Crown className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Top Gift Sent</p>
                <p className="font-medium">{stats.topGift}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/10 rounded-full">
                <Heart className="h-5 w-5 text-pink-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Favorite Creator</p>
                <p className="font-medium">{stats.favoriteCreator}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsTab;