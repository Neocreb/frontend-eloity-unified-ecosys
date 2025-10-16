import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import { Post } from "@/types/post";
import { Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [joinedGroups] = useState<Group[]>([]);
  const { toast } = useToast();

  // Mock user groups data
  const mockJoinedGroups: any[] = [
    {
      id: 'joined-1',
      name: 'Tech Enthusiasts',
      members: 15420,
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400',
      isJoined: true,
      description: 'Discussion about latest tech trends',
      privacy: 'public'
    },
    {
      id: 'joined-2',
      name: 'Crypto Traders',
      members: 8340,
      category: 'Finance',
      cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      isJoined: true,
      description: 'Cryptocurrency trading strategies and tips',
      privacy: 'public'
    }
  ];

  const mockMyGroups: any[] = [
    {
      id: 'my-1',
      name: 'Web3 Developers',
      members: 2350,
      category: 'Technology',
      cover: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400',
      isOwner: true,
      description: 'Building decentralized applications',
      privacy: 'public'
    }
  ];

  // Load group posts on component mount
  useEffect(() => {
    loadGroupPosts();
  }, []);

  const loadGroupPosts = async () => {
    setLoading(true);

    // Mock group posts data - in real app, this would come from API
    const mockGroupPosts: GroupPost[] = [
      {
        id: "group-post-1",
        author: {
          name: "Alex Chen",
          username: "alexchen",
          avatar: "https://randomuser.me/api/portraits/men/1.jpg",
          verified: false
        },
        content: "Just deployed my first dApp on Ethereum! The future of decentralized applications is here. Who else is building on web3? 🚀",
        image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=500",
        createdAt: "2 hours ago",
        likes: 45,
        comments: 12,
        shares: 8,
        liked: false,
        groupId: "joined-1",
        groupName: "Tech Enthusiasts",
        groupAvatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=100"
      },
      {
        id: "group-post-2",
        author: {
          name: "Sarah Williams",
          username: "sarahw",
          avatar: "https://randomuser.me/api/portraits/women/2.jpg",
          verified: true
        },
        content: "Bitcoin hits new resistance level. Technical analysis suggests a potential breakout incoming. What are your thoughts on the current market trend? 📈",
        createdAt: "4 hours ago",
        likes: 78,
        comments: 23,
        shares: 15,
        liked: true,
        groupId: "joined-2",
        groupName: "Crypto Traders",
        groupAvatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100"
      },
      {
        id: "group-post-3",
        author: {
          name: "Mike Johnson",
          username: "mikej",
          avatar: "https://randomuser.me/api/portraits/men/3.jpg",
          verified: false
        },
        content: "Amazing conference today! Learned so much about the latest ML algorithms and their real-world applications. The AI revolution is accelerating faster than ever.",
        image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=500",
        createdAt: "6 hours ago",
        likes: 34,
        comments: 7,
        shares: 4,
        liked: false,
        groupId: "1",
        groupName: "Web Development Hub",
        groupAvatar: "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=100"
      },
      {
        id: "group-post-4",
        author: {
          name: "Emma Davis",
          username: "emmad",
          avatar: "https://randomuser.me/api/portraits/women/4.jpg",
          verified: false
        },
        content: "Check out this amazing traditional recipe I tried from my grandmother's cookbook! The flavors are absolutely incredible. Food truly brings people together ❤️",
        image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500",
        createdAt: "8 hours ago",
        likes: 67,
        comments: 18,
        shares: 12,
        liked: true,
        groupId: "joined-4",
        groupName: "Foodies United",
        groupAvatar: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100"
      }
    ];

    // Sort posts: prioritize joined groups first, then by engagement
    const joinedGroupIds = [...mockJoinedGroups, ...joinedGroups].map(g => g.id);
    const sortedPosts = mockGroupPosts.sort((a, b) => {
      const aIsJoined = joinedGroupIds.includes(a.groupId);
      const bIsJoined = joinedGroupIds.includes(b.groupId);

      if (aIsJoined && !bIsJoined) return -1;
      if (!aIsJoined && bIsJoined) return 1;

      // If both are joined or both are not joined, sort by engagement
      return (b.likes + b.comments + b.shares) - (a.likes + a.comments + a.shares);
    });

    setGroupPosts(sortedPosts);
    setLoading(false);
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
            Showing posts from your joined groups first
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
                {[...mockJoinedGroups, ...joinedGroups].some(g => g.id === post.groupId) && (
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
