import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeedUserCard, FeedGroupCard, FeedPageCard } from '@/components/feed/FeedEntityCards';
import { useEntityFollowHandlers } from '@/components/feed/UnifiedFeedHandlers';
const groups: any[] = [];
const pages: any[] = [];
const sampleUsers: any[] = [];
import { Users, Building, UserPlus } from 'lucide-react';

const FeedWithFollowDemo: React.FC = () => {
  const { handleUserFollow, handleGroupJoin, handlePageFollow } = useEntityFollowHandlers();
  
  // Placeholder sample data until real APIs are connected
  const sampleUsersLocal = sampleUsers;
  const sampleGroups = groups.slice(0, 3);
  const samplePages = pages.slice(0, 3);

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
            {sampleUsersLocal.map((user, index) => (
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
                  <li>✅ Mock data structure matches expected API</li>
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
