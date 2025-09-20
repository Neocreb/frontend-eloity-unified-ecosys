import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  UserPlus, 
  Search, 
  MoreHorizontal,
  Heart,
  MessageCircle,
  UserCheck,
  UserX,
  Filter,
  Loader2
} from 'lucide-react';
import { friendsService, Friend, FriendRequest, FriendSuggestion } from '@/services/friendsService';
import { useToast } from '@/hooks/use-toast';

const Friends: React.FC = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [suggestions, setSuggestions] = useState<FriendSuggestion[]>([]);
  const [stats, setStats] = useState({ totalFriends: 0, onlineFriends: 0, friendRequests: 0 });

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch real data from the API
      const [friendsData, requestsData, suggestionsData] = await Promise.all([
        friendsService.getFriends(),
        friendsService.getFriendRequests(),
        friendsService.getFriendSuggestions()
      ]);

      setFriends(friendsData);
      setFriendRequests(requestsData);
      setSuggestions(suggestionsData);
      setStats({
        totalFriends: friendsData.length,
        onlineFriends: friendsData.filter(f => f.status === 'online').length,
        friendRequests: requestsData.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load friends data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAcceptRequest = async (requestId: string) => {
    try {
      // Call the API to accept the friend request
      await friendsService.acceptFriendRequest(requestId);
      
      // Update state
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      setStats(prev => ({
        ...prev,
        friendRequests: prev.friendRequests - 1,
        totalFriends: prev.totalFriends + 1
      }));
      
      toast({
        title: 'Success',
        description: 'Friend request accepted'
      });
    } catch (error) {
      console.error('Error accepting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to accept friend request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      // Call the API to reject the friend request
      await friendsService.rejectFriendRequest(requestId);
      
      // Update state
      setFriendRequests(prev => prev.filter(req => req.id !== requestId));
      setStats(prev => ({
        ...prev,
        friendRequests: prev.friendRequests - 1
      }));
      
      toast({
        title: 'Success',
        description: 'Friend request rejected'
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject friend request',
        variant: 'destructive'
      });
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      // Call the API to send a friend request
      await friendsService.sendFriendRequest(userId);
      
      toast({
        title: 'Success',
        description: 'Friend request sent'
      });
    } catch (error) {
      console.error('Error sending request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send friend request',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveFriend = async (userId: string) => {
    try {
      // Call the API to remove a friend
      await friendsService.removeFriend(userId);
      
      // Update state
      setFriends(prev => prev.filter(friend => friend.id !== userId));
      setStats(prev => ({
        ...prev,
        totalFriends: prev.totalFriends - 1
      }));
      
      toast({
        title: 'Success',
        description: 'Friend removed'
      });
    } catch (error) {
      console.error('Error removing friend:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove friend',
        variant: 'destructive'
      });
    }
  };

  const FriendCard = ({ friend, showActions = true, actionType = 'friend' }: { 
    friend: Friend | FriendRequest | FriendSuggestion; 
    showActions?: boolean; 
    actionType?: 'friend' | 'request' | 'suggestion';
  }) => (
    <Card key={friend.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={(friend as Friend).avatar || (friend as FriendRequest).avatar || (friend as FriendSuggestion).avatar} />
                <AvatarFallback>
                  {friend.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {'status' in friend && friend.status === 'online' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{friend.displayName}</h3>
                {'verified' in friend && friend.verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{friend.username}</p>
              {'bio' in friend && friend.bio && (
                <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-1">
                {'mutualFriends' in friend && (
                  <span className="text-xs text-muted-foreground">
                    {friend.mutualFriends} mutual connections
                  </span>
                )}
                {'lastActive' in friend && friend.lastActive && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {friend.lastActive}
                    </span>
                  </>
                )}
                {'reason' in friend && (
                  <span className="text-xs text-muted-foreground">
                    {friend.reason}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center gap-2">
              {actionType === 'friend' && (
                <>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Message
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRemoveFriend(friend.id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                </>
              )}
              {actionType === 'request' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleRejectRequest(friend.id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleAcceptRequest(friend.id)}
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </>
              )}
              {actionType === 'suggestion' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => 'id' in friend && handleRemoveFriend(friend.id)}
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleSendRequest(friend.id)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Connect
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start md:items-center justify-between mb-6 flex-col md:flex-row gap-4">
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <Users className="w-8 h-8 text-primary flex-shrink-0" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Connections</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Manage your connections and discover new people
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto justify-end md:justify-start flex-wrap">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Find Connections
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search connections by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalFriends}</div>
            <div className="text-sm text-muted-foreground">Total Connections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.friendRequests}</div>
            <div className="text-sm text-muted-foreground">Connection Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.onlineFriends}</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full overflow-x-auto whitespace-nowrap md:grid md:grid-cols-3">
            <TabsTrigger value="all">All Connections ({stats.totalFriends})</TabsTrigger>
            <TabsTrigger value="requests">
              Requests ({stats.friendRequests})
              {stats.friendRequests > 0 && (
                <Badge variant="destructive" className="ml-2 px-1 min-w-[1.25rem] h-5">
                  {stats.friendRequests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions ({suggestions.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-6">
            {filteredFriends.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {searchQuery ? 'No connections found' : 'No connections yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery 
                      ? 'Try searching with a different name or username'
                      : 'Start connecting with people to build your network'
                    }
                  </p>
                  {!searchQuery && (
                    <Button>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Find Connections
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFriends.map(friend => 
                  <FriendCard key={friend.id} friend={friend} actionType="friend" />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="requests" className="space-y-4 mt-6">
            {friendRequests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No connection requests</h3>
                  <p className="text-muted-foreground">
                    When people send you connection requests, they'll appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {friendRequests.map(request => 
                  <FriendCard key={request.id} friend={request} actionType="request" />
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-4 mt-6">
            {suggestions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No suggestions available</h3>
                  <p className="text-muted-foreground">
                    Check back later for new friend suggestions
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {suggestions.map(suggestion => 
                  <FriendCard key={suggestion.id} friend={suggestion} actionType="suggestion" />
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default Friends;
