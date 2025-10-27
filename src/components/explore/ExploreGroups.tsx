import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import { Post } from "@/types/post";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { exploreService } from "@/services/exploreService";

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: 'public' | 'private';
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  location?: string;
  createdAt?: string;
}

interface GroupPost extends Post {
  groupId: string;
  groupName: string;
  groupAvatar: string;
}

interface ExploreGroupsProps {
  groups: Group[];
}

const ExploreGroups = ({ groups }: ExploreGroupsProps) => {
  const [groupPosts, setGroupPosts] = useState<GroupPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const { toast } = useToast();

  // Load group posts on component mount
  useEffect(() => {
    loadGroupPosts();
    loadJoinedGroups();
  }, []);

  const loadJoinedGroups = async () => {
    try {
      // In a real implementation, this would fetch the user's joined groups
      // For now, we'll use an empty array
      setJoinedGroups([]);
    } catch (error) {
      console.error("Error loading joined groups:", error);
    }
  };

  const loadGroupPosts = async () => {
    setLoading(true);
    try {
      // Fetch real group posts using exploreService
      const suggestedGroups = await exploreService.getSuggestedGroups(10);
      
      // For now, we'll create mock posts based on real groups
      // In a full implementation, we would fetch actual posts from each group
      const mockGroupPosts: GroupPost[] = suggestedGroups.slice(0, 4).map((group, index) => ({
        id: `group-post-${index + 1}`,
        author: {
          name: `Member of ${group.name}`,
          username: group.name.toLowerCase().replace(/\s+/g, ''),
          avatar: group.avatar_url || `https://images.unsplash.com/photo-${index + 1}?w=100`,
          verified: false
        },
        content: `Discussion in ${group.name}: ${group.description || 'Join our community to participate in discussions!'}`,
        image: index % 2 === 0 ? `https://images.unsplash.com/photo-${index + 10}?w=500` : undefined,
        createdAt: `${index + 1} hour${index + 1 > 1 ? 's' : ''} ago`,
        likes: Math.floor(Math.random() * 100),
        comments: Math.floor(Math.random() * 30),
        shares: Math.floor(Math.random() * 20),
        liked: index % 3 === 0,
        groupId: group.id,
        groupName: group.name,
        groupAvatar: group.avatar_url || `https://images.unsplash.com/photo-${index + 1}?w=100`
      }));

      setGroupPosts(mockGroupPosts);
    } catch (error) {
      console.error("Error loading group posts:", error);
      toast({
        title: "Error",
        description: "Failed to load group posts",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Posts from Groups</h3>
          {groupPosts.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {groupPosts.length} posts
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Showing posts from popular groups
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadGroupPosts}
            disabled={loading}
            className="text-xs"
          >
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : groupPosts.length > 0 ? (
        <div className="space-y-4">
          {groupPosts.map((post) => (
            <div key={post.id} className="space-y-2">
              {/* Group context header */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground px-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={post.groupAvatar} alt={post.groupName} />
                    <AvatarFallback>{post.groupName.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">Posted in</span>
                  <span className="sm:hidden">From</span>
                  <span className="font-semibold text-primary truncate max-w-[200px]">{post.groupName}</span>
                </div>
                {joinedGroups.some(g => g.id === post.groupId) && (
                  <Badge variant="secondary" className="text-xs">Joined</Badge>
                )}
              </div>
              <EnhancedPostCard post={post} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-2">No group posts found</p>
          <p className="text-sm text-muted-foreground mb-4">
            Join some groups to see posts from communities you're interested in
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.href = '/groups'}
          >
            Browse Groups
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExploreGroups;