// @ts-nocheck
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeedUserCard, FeedGroupCard, FeedPageCard } from '@/components/feed/FeedEntityCards';
import { useEntityFollowHandlers } from '@/components/feed/UnifiedFeedHandlers';
import { useQuery } from '@tanstack/react-query';
import { exploreService } from '@/services/exploreService';
import { Users, Building, UserPlus } from 'lucide-react';

const FeedWithFollowDemo: React.FC = () => {
  const { handleUserFollow, handleGroupJoin, handlePageFollow } = useEntityFollowHandlers();
  
  // Fetch real data using exploreService
  const { data: groupsData = [] } = useQuery({
    queryKey: ['demo-groups'],
    queryFn: () => exploreService.getGroups(6),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: pagesData = [] } = useQuery({
    queryKey: ['demo-pages'],
    queryFn: () => exploreService.getPages(6),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get sample data - using real data instead of mockUsers
  const { data: usersData = [] } = useQuery({
    queryKey: ['demo-users'],
    queryFn: () => exploreService.getSuggestedUsers(6),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const sampleUsers = usersData.map(user => ({
    id: user.id,
    username: user.username,
    full_name: user.full_name,
    avatar_url: user.avatar_url,
    isFollowing: false,
    followers: user.followers_count,
    mutualConnections: 0, // Would need to calculate this in a real implementation
    bio: user.bio || "",
    location: user.location || "",
    isOnline: user.is_online,
  }));

  const sampleGroups = groupsData.slice(0, 3).map(group => ({
    ...group,
    isJoined: false,
    recentActivity: [
      "15 new posts today",
      "New challenge started", 
      "Weekly meetup announced"
    ][Math.floor(Math.random() * 3)]
  }));

  const samplePages = pagesData.slice(0, 3).map(page => ({
    ...page,
    isFollowing: false,
    pageType: page.category === 'brand' ? 'brand' : 
               page.category === 'business' ? 'business' : 
               page.category === 'organization' ? 'organization' : 'public_figure'
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-6 w-6 text-blue-600" />
              Feed with Follow/Join Demo
            </CardTitle>
            <p className="text-muted-foreground">
              Interactive demo showcasing follow buttons and clickable profiles for users, groups, and pages in the feed.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-sm">Users</p>
                  <p className="text-xs text-muted-foreground">Follow/Unfollow</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-sm">Groups</p>
                  <p className="text-xs text-muted-foreground">Join/Leave</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                <Building className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-sm">Pages</p>
                  <p className="text-xs text-muted-foreground">Follow/Unfollow</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Suggested Users</h2>
            <Badge variant="outline">Interactive</Badge>
          </div>
          <div className="space-y-4">
            {sampleUsers.map((user, index) => (
              <FeedUserCard
                key={`user-${index}`}
                user={user}
                onToggleFollow={handleUserFollow}
              />
            ))}
          </div>
        </div>

        {/* Groups Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="text-xl font-semibold">Suggested Groups</h2>
            <Badge variant="outline">Interactive</Badge>
          </div>
          <div className="space-y-4">
            {sampleGroups.map((group) => (
              <FeedGroupCard
                key={group.id}
                group={group}
                onToggleJoin={handleGroupJoin}
              />
            ))}
          </div>
        </div>

        {/* Pages Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building className="h-5 w-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Suggested Pages</h2>
            <Badge variant="outline">Interactive</Badge>
          </div>
          <div className="space-y-4">
            {samplePages.map((page) => (
              <FeedPageCard
                key={page.id}
                page={page}
                onToggleFollow={handlePageFollow}
              />
            ))}
          </div>
        </div>

        {/* Integration Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Real-time Integration Ready</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Database Integration</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Real data from database instead of mock data</li>
                  <li>✅ Follow/join handlers ready for real API calls</li>
                  <li>✅ Optimistic UI updates implemented</li>
                  <li>✅ Error handling with user feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Navigation & UX</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Clickable avatars and usernames</li>
                  <li>✅ Proper profile routing (/app/profile/username)</li>
                  <li>✅ Group and page routing ready</li>
                  <li>✅ Consistent UI patterns across entity types</li>
                </ul>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Next Steps:</strong> Connect to real database APIs by replacing the mock handlers in 
                <code className="mx-1 px-2 py-1 bg-blue-100 rounded">UnifiedFeedHandlers.tsx</code> 
                with actual service calls to your backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FeedWithFollowDemo;