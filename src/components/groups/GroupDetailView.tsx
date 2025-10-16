import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { formatNumber } from "@/utils/formatters";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Lock,
  Globe,
  Crown,
  Shield,
  UserPlus,
  UserMinus,
  Settings,
  Plus,
  Heart,
  MessageSquare,
  Share2,
  MoreHorizontal,
  ImageIcon,
  Video,
  Calendar,
  MapPin,
  ThumbsUp,
  Send,
  Bookmark,
  Flag,
  Edit,
  Trash2,
  Camera,
  Paperclip,
  Smile,
  Search,
  Filter,
  SortDesc,
  Pin,
  Star,
  Clock,
  FolderOpen,
  Upload
} from "lucide-react";

// Import the real group service instead of mock data generator
import GroupService from "@/services/groupService";
import { eventSyncService, SyncEvent } from "@/services/eventSyncService";
import { chatInitiationService } from "@/services/chatInitiationService";
import { QuickMessageButton } from "@/components/chat/QuickMessageButton";
import { useAuth } from "@/contexts/AuthContext";

interface Group {
  id: string;
  name: string;
  member_count: number;
  privacy: "public" | "private";
  is_joined?: boolean;
  is_owner?: boolean;
  is_admin?: boolean;
  created_at?: string;
  rules?: string[];
  description?: string;
  cover_url?: string;
  creator_id: string;
}

interface Member {
  id: string;
  user_id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface Post {
  id: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  content: string;
  media_urls?: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Comment {
  id: string;
  author: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Event {
  id: string;
  title: string;
  description: string;
  start_date: string;
  location?: string;
  attendee_count: number;
  is_attending: boolean;
}

const GroupDetailView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("posts");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [newComment, setNewComment] = useState("");
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  // Find the specific group based on the route parameter
  const [group, setGroup] = useState<Group | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || !user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch group details with all related data
        const groupData = await GroupService.getGroupById(groupId, user.id);
        
        if (!groupData) {
          setError("Group not found");
          return;
        }
        
        // Transform group data to match component interface
        const transformedGroup: Group = {
          id: groupData.id,
          name: groupData.name,
          member_count: groupData.member_count,
          privacy: groupData.privacy as "public" | "private",
          is_joined: await GroupService.isGroupMember(groupId, user.id),
          is_owner: groupData.creator_id === user.id,
          is_admin: false, // This would need to be determined from the group data
          created_at: groupData.created_at,
          description: groupData.description || undefined,
          cover_url: groupData.cover_url || undefined,
          creator_id: groupData.creator_id,
          rules: [
            "Be respectful to all members",
            "No spam or self-promotion without permission",
            "Share knowledge and help others learn",
            "Keep discussions relevant to the group topic",
            "No harassment or offensive content"
          ]
        };
        
        setGroup(transformedGroup);
        
        // Transform posts data
        const transformedPosts: Post[] = groupData.posts.map((post: any) => ({
          id: post.id,
          author: post.author,
          content: post.content || "",
          media_urls: post.media_urls || [],
          timestamp: post.created_at,
          likes: post.like_count,
          comments: [], // Comments would need to be fetched separately
          isLiked: post.is_liked || false,
          isPinned: post.pinned || false,
          isEdited: post.updated_at !== post.created_at
        }));
        
        setPosts(transformedPosts);
        
        // Transform events data
        const transformedEvents: Event[] = groupData.events.map((event: any) => ({
          id: event.id,
          title: event.title,
          description: event.description || "",
          start_date: event.start_date,
          location: event.location || undefined,
          attendee_count: event.attendee_count,
          is_attending: event.is_attending || false
        }));
        
        setEvents(transformedEvents);
        
        // Fetch members separately as they weren't included in the group data
        const membersData = await GroupService.getGroupMembers(groupId);
        const transformedMembers: Member[] = membersData.map(member => ({
          id: member.id,
          user_id: member.user_id,
          name: member.user.full_name || member.user.username || "Unknown User",
          avatar: member.user.avatar_url || "",
          role: member.role as "owner" | "admin" | "member",
          joinedAt: member.joined_at
        }));
        
        setMembers(transformedMembers);
        
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to fetch group data");
        toast({
          title: "Error",
          description: "Failed to fetch group data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, user, toast]);

  // If group not found, redirect or show error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error Loading Group</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate("/app/groups")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading group data...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Group Not Found</h2>
          <p className="text-muted-foreground mb-4">The group you're looking for doesn't exist.</p>
          <Button onClick={() => navigate("/app/groups")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user) {
      toast({
        title: "Error",
        description: "Please write something to post",
        variant: "destructive"
      });
      return;
    }

    try {
      const newPost = await GroupService.createGroupPost(
        group.id,
        user.id,
        newPostContent,
        newPostImages
      );

      if (newPost) {
        // Transform the new post to match component interface
        const transformedPost: Post = {
          id: newPost.id,
          author: newPost.author,
          content: newPost.content || "",
          media_urls: newPost.image_url ? [newPost.image_url] : [],
          timestamp: newPost.created_at,
          likes: newPost.like_count,
          comments: [],
          isLiked: false,
          isPinned: false,
          isEdited: false
        };

        setPosts(prev => [transformedPost, ...prev]);
        setNewPostContent("");
        setNewPostImages([]);
        setShowCreatePost(false);

        toast({
          title: "Post Created",
          description: "Your post has been shared with the group!"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;
    
    try {
      const result = await GroupService.likeGroupPost(postId, user.id);
      
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likes: result ? post.likes + 1 : post.likes - 1,
              isLiked: result
            }
          : post
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to like post",
        variant: "destructive"
      });
    }
  };

  const handleJoinGroup = async () => {
    if (!user) return;
    
    try {
      const result = await GroupService.joinGroup(group.id, user.id);
      
      if (result) {
        if (group.privacy === "private") {
          toast({
            title: "Join Request Sent",
            description: "Your request to join this private group has been sent to the admins"
          });
        } else {
          toast({
            title: "Joined Group",
            description: `You've successfully joined ${group.name}!`
          });
          // Update group state
          setGroup(prev => prev ? {
            ...prev,
            is_joined: true,
            member_count: prev.member_count + 1
          } : null);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join group",
        variant: "destructive"
      });
    }
  };

  const handleLeaveGroup = async () => {
    if (!user) return;
    
    try {
      const result = await GroupService.leaveGroup(group.id, user.id);
      
      if (result) {
        toast({
          title: "Left Group",
          description: `You've left ${group.name}`
        });
        // Update group state
        setGroup(prev => prev ? {
          ...prev,
          is_joined: false,
          member_count: prev.member_count - 1
        } : null);
        navigate('/app/groups');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to leave group",
        variant: "destructive"
      });
    }
  };

  const handleManageGroup = () => {
    if (!group.is_owner && !group.is_admin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage this group",
        variant: "destructive"
      });
      return;
    }

    // Navigate to group management page with proper admin interface
    navigate(`/app/groups/${groupId}/manage`);

    toast({
      title: "Group Management",
      description: "Opening group management interface..."
    });
  };

  const handleJoinEvent = async (eventId: string) => {
    // This would need to be implemented with a proper event RSVP service
    toast({
      title: "Feature Coming Soon",
      description: "Event RSVP functionality will be available soon!"
    });
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      // This would need to be implemented with a proper event creation service
      toast({
        title: "Feature Coming Soon",
        description: "Event creation functionality will be available soon!"
      });
      setShowCreateEvent(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    toast({
      title: "Feature Coming Soon",
      description: "Comment functionality will be available soon!"
    });

    setNewComment("");
  };

  const renderPost = (post: Post) => (
    <Card key={post.id} className="w-full">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar_url || ""} alt={post.author.full_name} />
              <AvatarFallback>{post.author.full_name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{post.author.full_name}</h4>
                {group.is_owner && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
                {group.is_admin && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString()}
                {post.isEdited && " (edited)"}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
          
          {/* Post Images */}
          {post.media_urls && post.media_urls.length > 0 && (
            <div className="grid gap-2 mb-3">
              {post.media_urls.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt="Post content"
                  className="rounded-lg max-h-96 w-full object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Post Actions */}
        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikePost(post.id)}
              className={`gap-2 ${post.isLiked ? 'text-blue-600' : ''}`}
            >
              <ThumbsUp className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.likes}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              {post.comments.length}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>

        {/* Comments Section */}
        {expandedPost === post.id && (
          <div className="mt-4 space-y-3 border-t pt-3">
            {/* Add Comment */}
            <div className="flex gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.profile?.avatar_url || ""} alt="You" />
                <AvatarFallback>YO</AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                  className="flex-1"
                />
                <Button size="icon" onClick={() => handleAddComment(post.id)}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {post.comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.author.avatar_url || ""} alt={comment.author.full_name} />
                  <AvatarFallback>{comment.author.full_name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{comment.author.full_name}</h5>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                    <span>{new Date(comment.timestamp).toLocaleDateString()}</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Like ({comment.likes})
                    </Button>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      Reply
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderEvent = (event: Event) => (
    <Card key={event.id} className="w-full">
      <div className="relative h-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-3 left-3 text-white">
          <h3 className="font-bold text-lg">{event.title}</h3>
        </div>
      </div>
      <CardContent className="p-4">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{event.description}</p>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(event.start_date).toLocaleDateString()}
            </div>
            {event.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {event.location}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm">{event.attendee_count} attending</span>
            </div>
            <Button
              size="sm"
              variant={event.is_attending ? "outline" : "default"}
              onClick={() => handleJoinEvent(event.id)}
            >
              {event.is_attending ? "Can't Go" : "Attend"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Group Header */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={group.cover_url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200"}
          alt={group.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            className="gap-2 text-sm sm:text-base"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{group.name}</h1>
                {group.privacy === "private" ? (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                ) : (
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{formatNumber(group.member_count)} members</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              {!group.is_joined ? (
                <Button className="gap-2 text-sm sm:text-base" onClick={handleJoinGroup}>
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{group.privacy === "private" ? "Request to Join" : "Join Group"}</span>
                  <span className="sm:hidden">{group.privacy === "private" ? "Request" : "Join"}</span>
                </Button>
              ) : (
                <>
                  {(group.is_owner || group.is_admin) && (
                    <Button variant="secondary" className="gap-2 text-sm sm:text-base" onClick={handleManageGroup}>
                      <Settings className="w-4 h-4" />
                      Manage
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="gap-2 bg-white/20 border-white/30 text-white hover:bg-white/30 text-sm sm:text-base"
                    onClick={handleLeaveGroup}
                  >
                    <UserMinus className="w-4 h-4" />
                    Leave
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* About Section */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">About</h3>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{group.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{formatNumber(group.member_count)} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Created {new Date(group.created_at!).toLocaleDateString()}</span>
                  </div>
                  {group.privacy === "public" ? (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-green-600" />
                      <span>Public group</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-600" />
                      <span>Private group</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Group Rules */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Group Rules</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.rules?.map((rule, index) => (
                    <div key={index} className="flex gap-2 text-sm">
                      <span className="font-semibold text-muted-foreground">{index + 1}.</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Members */}
            <Card>
              <CardHeader>
                <h3 className="font-semibold">Recent Members</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {members.slice(0, 5).map((member) => (
                    <div key={member.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{member.name}</p>
                          {member.role === "owner" && (
                            <Crown className="w-3 h-3 text-yellow-600" />
                          )}
                          {member.role === "admin" && (
                            <Shield className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    View All Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Create Post Section */}
            {group.is_joined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user?.profile?.avatar_url || ""} alt="You" />
                      <AvatarFallback>YO</AvatarFallback>
                    </Avatar>
                    <Dialog open={showCreatePost} onOpenChange={setShowCreatePost}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 justify-start text-muted-foreground">
                          What's on your mind?
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Create Post</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="What would you like to share with the group?"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            rows={4}
                          />
                          <div className="flex justify-between items-center">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <ImageIcon className="w-4 h-4 mr-2" />
                                Photo
                              </Button>
                              <Button variant="outline" size="sm">
                                <Video className="w-4 h-4 mr-2" />
                                Video
                              </Button>
                              <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Event
                              </Button>
                            </div>
                            <Button onClick={handleCreatePost}>
                              Post
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="files">Files</TabsTrigger>
              </TabsList>

              <TabsContent value="posts" className="space-y-4">
                {/* Posts Filter */}
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                    <Button variant="outline" size="sm">
                      <SortDesc className="w-4 h-4 mr-2" />
                      Recent
                    </Button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>

                {/* Posts Feed */}
                <div className="space-y-4">
                  {posts.map(renderPost)}
                </div>
              </TabsContent>

              <TabsContent value="events" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Upcoming Events</h3>
                  {(group.is_owner || group.is_admin) && (
                    <Button onClick={() => setShowCreateEvent(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  )}
                </div>
                <div className="grid gap-4">
                  {events.map(renderEvent)}
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Members ({formatNumber(group.member_count)})</h3>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search members..."
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
                <div className="grid gap-3">
                  {members.map((member) => (
                    <Card key={member.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{member.name}</h4>
                              {member.role === "owner" && (
                                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                  <Crown className="w-3 h-3 mr-1" />
                                  Owner
                                </Badge>
                              )}
                              {member.role === "admin" && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                  <Shield className="w-3 h-3 mr-1" />
                                  Admin
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Message
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="files" className="space-y-4">
                <div className="text-center py-12">
                  <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No files shared yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Files shared in this group will appear here
                  </p>
                  {group.is_joined && (
                    <Button>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </Button>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupDetailView;