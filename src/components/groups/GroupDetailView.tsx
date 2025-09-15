import React, { useState } from "react";
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
  Image as ImageIcon,
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
} from "lucide-react";

import { groups } from "@/data/mockExploreData";
import { generateMockPosts, generateMockEvents, generateMockMembers } from "@/utils/mockDataGenerator";
import { eventSyncService, SyncEvent } from "@/services/eventSyncService";
import { chatInitiationService } from "@/services/chatInitiationService";
import { QuickMessageButton } from "@/components/chat/QuickMessageButton";

interface Group {
  id: string;
  name: string;
  members: number;
  category: string;
  cover: string;
  description?: string;
  privacy: "public" | "private";
  isJoined?: boolean;
  isOwner?: boolean;
  isAdmin?: boolean;
  location?: string;
  createdAt?: string;
  admins?: Member[];
  rules?: string[];
}

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
}

interface Post {
  id: string;
  author: Member;
  content: string;
  images?: string[];
  video?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  isLiked: boolean;
  isPinned?: boolean;
  isEdited?: boolean;
}

interface Comment {
  id: string;
  author: Member;
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
  date: string;
  time: string;
  location?: string;
  attendees: number;
  isAttending: boolean;
  cover?: string;
}

const GroupDetailView = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
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
  const group = groups.find(g => g.id === groupId);

  // If group not found, redirect or show error
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

  // Extend the group data with additional properties for the detail view
  const extendedGroup: Group = {
    ...group,
    rules: [
      "Be respectful to all members",
      "No spam or self-promotion without permission",
      "Share knowledge and help others learn",
      `Keep discussions relevant to ${group.category}`,
      "No harassment or offensive content"
    ]
  };

  // Generate dynamic mock posts based on group ID
  const [posts, setPosts] = useState<Post[]>(() => generateMockPosts(extendedGroup.id, 4));

  // Generate dynamic mock events and members based on group ID
  const [events, setEvents] = useState<Event[]>(() => generateMockEvents(extendedGroup.id, 3));
  const members: Member[] = generateMockMembers(extendedGroup.id, 8);

  const handleCreatePost = () => {
    if (!newPostContent.trim()) {
      toast({
        title: "Error",
        description: "Please write something to post",
        variant: "destructive"
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: "current",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        role: "member",
        joinedAt: "2023-06-01"
      },
      content: newPostContent,
      images: newPostImages,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent("");
    setNewPostImages([]);
    setShowCreatePost(false);

    toast({
      title: "Post Created",
      description: "Your post has been shared with the group!"
    });
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          }
        : post
    ));
  };

  const handleAddComment = (postId: string) => {
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: {
        id: "current",
        name: "You",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100",
        role: "member",
        joinedAt: "2023-06-01"
      },
      content: newComment,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPosts(prev => prev.map(post =>
      post.id === postId
        ? { ...post, comments: [...post.comments, comment] }
        : post
    ));

    setNewComment("");
  };

  const handleJoinEvent = (eventId: string) => {
    setEvents(prev => prev.map(event =>
      event.id === eventId
        ? {
            ...event,
            isAttending: !event.isAttending,
            attendees: event.isAttending ? event.attendees - 1 : event.attendees + 1
          }
        : event
    ));
  };

  const handleManageGroup = () => {
    if (!extendedGroup.isOwner && !extendedGroup.isAdmin) {
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

  const handleJoinGroup = () => {
    if (extendedGroup.privacy === "private") {
      toast({
        title: "Join Request Sent",
        description: "Your request to join this private group has been sent to the admins"
      });
    } else {
      toast({
        title: "Joined Group",
        description: `You've successfully joined ${extendedGroup.name}!`
      });
      // Update group state
      Object.assign(extendedGroup, { isJoined: true, members: extendedGroup.members + 1 });
    }
  };

  const handleLeaveGroup = () => {
    toast({
      title: "Left Group",
      description: `You've left ${extendedGroup.name}`
    });
    // Update group state
    Object.assign(extendedGroup, { isJoined: false, members: extendedGroup.members - 1 });
    navigate('/app/groups');
  };

  const handleCreateEvent = async (eventData: any) => {
    try {
      // Create event in group context
      const newEvent: Event = {
        id: Date.now().toString(),
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        attendees: 0,
        isAttending: false,
        cover: eventData.cover
      };

      setEvents(prev => [newEvent, ...prev]);

      // Sync with main events page if public
      if (eventData.isPublic !== false) {
        await eventSyncService.syncGroupEvent(
          extendedGroup.id,
          extendedGroup.name,
          {
            title: eventData.title,
            description: eventData.description,
            date: eventData.date,
            time: eventData.time,
            location: eventData.location,
            cover: eventData.cover,
            isPublic: true,
            category: extendedGroup.category,
            tags: [extendedGroup.category.toLowerCase(), 'group-event']
          }
        );

        toast({
          title: "Event Created",
          description: "Event created and synced with main events page!"
        });
      } else {
        toast({
          title: "Event Created",
          description: "Private group event created successfully!"
        });
      }

      setShowCreateEvent(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive"
      });
    }
  };

  const renderPost = (post: Post) => (
    <Card key={post.id} className="w-full">
      <CardContent className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar} alt={post.author.name} />
              <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm">{post.author.name}</h4>
                {post.author.role === "owner" && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Owner
                  </Badge>
                )}
                {post.author.role === "admin" && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Admin
                  </Badge>
                )}
                {post.isPinned && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Pin className="w-3 h-3 mr-1" />
                    Pinned
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
          {post.images && post.images.length > 0 && (
            <div className="grid gap-2 mb-3">
              {post.images.map((image, index) => (
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
                <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="You" />
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
                  <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
                  <AvatarFallback>{comment.author.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-semibold text-sm">{comment.author.name}</h5>
                      {comment.author.role === "admin" && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          <Shield className="w-2 h-2 mr-1" />
                          Admin
                        </Badge>
                      )}
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
        {event.cover && (
          <img
            src={event.cover}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        )}
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
              {new Date(event.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {event.time}
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
              <span className="text-sm">{event.attendees} attending</span>
            </div>
            <Button
              size="sm"
              variant={event.isAttending ? "outline" : "default"}
              onClick={() => handleJoinEvent(event.id)}
            >
              {event.isAttending ? "Can't Go" : "Attend"}
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
          src={extendedGroup.cover}
          alt={extendedGroup.name}
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
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{extendedGroup.name}</h1>
                {extendedGroup.privacy === "private" ? (
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                ) : (
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm opacity-90">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="whitespace-nowrap">{formatNumber(extendedGroup.members)} members</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span className="truncate">{extendedGroup.category}</span>
                {extendedGroup.location && (
                  <>
                    <span className="hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 min-w-0">
                      <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="truncate">{extendedGroup.location}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:flex-shrink-0">
              {!extendedGroup.isJoined ? (
                <Button className="gap-2 text-sm sm:text-base" onClick={handleJoinGroup}>
                  <UserPlus className="w-4 h-4" />
                  <span className="hidden sm:inline">{extendedGroup.privacy === "private" ? "Request to Join" : "Join Group"}</span>
                  <span className="sm:hidden">{extendedGroup.privacy === "private" ? "Request" : "Join"}</span>
                </Button>
              ) : (
                <>
                  {(extendedGroup.isOwner || extendedGroup.isAdmin) && (
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
                <p className="text-sm text-muted-foreground">{extendedGroup.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{formatNumber(extendedGroup.members)} members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Created {new Date(extendedGroup.createdAt!).toLocaleDateString()}</span>
                  </div>
                  {extendedGroup.privacy === "public" ? (
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
                  {extendedGroup.rules?.map((rule, index) => (
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
            {extendedGroup.isJoined && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100" alt="You" />
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
                  {(extendedGroup.isOwner || extendedGroup.isAdmin) && (
                    <Button>
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
                  <h3 className="text-lg font-semibold">Members ({formatNumber(extendedGroup.members)})</h3>
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={member.avatar} alt={member.name} />
                              <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
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
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              await chatInitiationService.handleMessageButton({
                                type: 'user',
                                targetId: member.id,
                                targetName: member.name,
                                context: `from ${extendedGroup.name} group`,
                                navigate,
                                toast
                              });
                            }}
                          >
                            <MessageSquare className="w-4 h-4 mr-2" />
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
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <Paperclip className="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">No files shared yet</h3>
                      <p className="text-muted-foreground">Files and documents shared in this group will appear here</p>
                    </div>
                  </div>
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
