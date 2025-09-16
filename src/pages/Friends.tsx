import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';

const Friends: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const friends = [
    {
      id: '1',
      username: 'alice_johnson',
      displayName: 'Alice Johnson',
      avatar: '/placeholder.svg',
      bio: 'Digital artist and designer',
      mutualFriends: 12,
      status: 'online',
      lastActive: '2 min ago',
      verified: true
    },
    {
      id: '2',
      username: 'bob_smith',
      displayName: 'Bob Smith',
      avatar: '/placeholder.svg',
      bio: 'Software developer and tech enthusiast',
      mutualFriends: 8,
      status: 'offline',
      lastActive: '1 hour ago',
      verified: false
    },
    {
      id: '3',
      username: 'sarah_wilson',
      displayName: 'Sarah Wilson',
      avatar: '/placeholder.svg',
      bio: 'Content creator and influencer',
      mutualFriends: 25,
      status: 'online',
      lastActive: 'Active now',
      verified: true
    }
  ];

  const friendRequests = [
    {
      id: '4',
      username: 'new_user_1',
      displayName: 'New User',
      avatar: '/placeholder.svg',
      bio: 'New to the platform',
      mutualFriends: 3,
      requestDate: '2024-01-15'
    },
    {
      id: '5',
      username: 'potential_friend',
      displayName: 'Potential Friend',
      avatar: '/placeholder.svg',
      bio: 'Looking to connect with like-minded people',
      mutualFriends: 7,
      requestDate: '2024-01-14'
    }
  ];

  const suggestions = [
    {
      id: '6',
      username: 'suggested_user1',
      displayName: 'Suggested User 1',
      avatar: '/placeholder.svg',
      bio: 'Photographer and visual artist',
      mutualFriends: 15,
      reason: 'Followed by people you know'
    },
    {
      id: '7',
      username: 'suggested_user2',
      displayName: 'Suggested User 2',
      avatar: '/placeholder.svg',
      bio: 'Music producer and DJ',
      mutualFriends: 9,
      reason: 'Popular in your area'
    }
  ];

  const filteredFriends = friends.filter(friend =>
    friend.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FriendCard = ({ friend, showActions = true, actionType = 'friend' }) => (
    <Card key={friend.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative">
              <Avatar className="w-12 h-12">
                <AvatarImage src={friend.avatar} />
                <AvatarFallback>
                  {friend.displayName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {friend.status === 'online' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{friend.displayName}</h3>
                {friend.verified && (
                  <Badge variant="secondary" className="text-xs">Verified</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">@{friend.username}</p>
              <p className="text-sm text-muted-foreground truncate">{friend.bio}</p>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-muted-foreground">
                  {friend.mutualFriends} mutual connections
                </span>
                {friend.lastActive && (
                  <>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {friend.lastActive}
                    </span>
                  </>
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
                  <Button size="sm" variant="outline">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </>
              )}
              {actionType === 'request' && (
                <>
                  <Button size="sm" variant="outline">
                    <UserX className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
                    <UserCheck className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                </>
              )}
              {actionType === 'suggestion' && (
                <>
                  <Button size="sm" variant="outline">
                    <UserX className="w-4 h-4" />
                  </Button>
                  <Button size="sm">
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
            <div className="text-2xl font-bold text-primary">{friends.length}</div>
            <div className="text-sm text-muted-foreground">Total Connections</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{friendRequests.length}</div>
            <div className="text-sm text-muted-foreground">Connection Requests</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{friends.filter(f => f.status === 'online').length}</div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full overflow-x-auto whitespace-nowrap md:grid md:grid-cols-3">
          <TabsTrigger value="all">All Connections ({friends.length})</TabsTrigger>
          <TabsTrigger value="requests">
            Requests ({friendRequests.length})
            {friendRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1 min-w-[1.25rem] h-5">
                {friendRequests.length}
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
    </div>
  );
};

export default Friends;
