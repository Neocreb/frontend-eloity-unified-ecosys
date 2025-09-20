import React, { useState, useEffect, useCallback } from "react";
import {
  Share2,
  Users,
  Copy,
  Download,
  ExternalLink,
  QrCode,
  Mail,
  MessageCircle,
  Eye,
  Play,
  Calendar,
  Clock,
  Globe,
  Lock,
  Unlock,
  Heart,
  Bookmark,
  List,
  Plus,
  X,
  Check,
  Send,
  Link,
  Smartphone,
  Monitor,
  Tv,
  Cast,
  Headphones,
  Speaker,
  Wifi,
  WifiOff,
  User,
  UserPlus,
  Settings,
  Crown,
  Zap,
  Gift,
  Star,
  Award,
  Trophy,
  Target,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ShareOptions {
  platforms: string[];
  privacy: "public" | "unlisted" | "private";
  allowComments: boolean;
  allowDownload: boolean;
  allowEmbed: boolean;
  customMessage: string;
  scheduleTime?: Date;
  expiryTime?: Date;
  passwordProtected: boolean;
  password?: string;
  analytics: boolean;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  videos: string[];
  collaborators: string[];
  privacy: "public" | "private" | "collaborative";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  thumbnail: string;
  duration: number;
  views: number;
}

interface WatchParty {
  id: string;
  hostId: string;
  hostName: string;
  videoId: string;
  videoTitle: string;
  participants: PartyParticipant[];
  startTime: Date;
  currentTime: number;
  isPlaying: boolean;
  chatEnabled: boolean;
  maxParticipants: number;
  privacy: "public" | "friends" | "invite-only";
  reactions: boolean;
  voiceChat: boolean;
}

interface PartyParticipant {
  id: string;
  name: string;
  avatar: string;
  joinedAt: Date;
  isHost: boolean;
  isModerator: boolean;
  reactions: string[];
}

interface CollaborativePlaylist {
  id: string;
  name: string;
  description: string;
  collaborators: PlaylistCollaborator[];
  videos: PlaylistVideo[];
  settings: {
    anyoneCanAdd: boolean;
    requireApproval: boolean;
    allowVoting: boolean;
    autoPlay: boolean;
    shuffle: boolean;
    repeat: boolean;
  };
}

interface PlaylistCollaborator {
  id: string;
  name: string;
  avatar: string;
  role: "owner" | "editor" | "contributor" | "viewer";
  permissions: string[];
  joinedAt: Date;
}

interface PlaylistVideo {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  addedBy: string;
  addedAt: Date;
  votes: number;
  position: number;
}

interface AdvancedSharingHubProps {
  videoId: string;
  videoTitle: string;
  videoUrl: string;
  videoThumbnail: string;
  videoDuration: number;
  currentUser?: {
    id: string;
    name: string;
    avatar: string;
  };
  onShare?: (platform: string, options: ShareOptions) => void;
  onCreatePlaylist?: (playlist: CollaborativePlaylist) => void;
  onStartWatchParty?: (party: WatchParty) => void;
  className?: string;
}

const AdvancedSharingHub: React.FC<AdvancedSharingHubProps> = ({
  videoId,
  videoTitle,
  videoUrl,
  videoThumbnail,
  videoDuration,
  currentUser,
  onShare,
  onCreatePlaylist,
  onStartWatchParty,
  className,
}) => {
  // State
  const [activeTab, setActiveTab] = useState<"share" | "playlists" | "watch-party" | "embed">("share");
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    platforms: [],
    privacy: "public",
    allowComments: true,
    allowDownload: false,
    allowEmbed: true,
    customMessage: "",
    passwordProtected: false,
    analytics: true,
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
  const [watchParty, setWatchParty] = useState<WatchParty | null>(null);
  const [partySettings, setPartySettings] = useState({
    privacy: "friends" as "public" | "friends" | "invite-only",
    maxParticipants: 50,
    chatEnabled: true,
    reactions: true,
    voiceChat: false,
  });
  const [embedCode, setEmbedCode] = useState("");
  const [embedSettings, setEmbedSettings] = useState({
    width: 560,
    height: 315,
    autoplay: false,
    controls: true,
    responsive: true,
    startTime: 0,
  });
  const [qrCode, setQrCode] = useState("");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const { toast } = useToast();

  // Supported platforms
  const platforms = [
    { id: "twitter", name: "Twitter", icon: "🐦", color: "bg-blue-500" },
    { id: "facebook", name: "Facebook", icon: "📘", color: "bg-blue-600" },
    { id: "instagram", name: "Instagram", icon: "📷", color: "bg-pink-500" },
    { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black" },
    { id: "youtube", name: "YouTube", icon: "📺", color: "bg-red-500" },
    { id: "linkedin", name: "LinkedIn", icon: "💼", color: "bg-blue-700" },
    { id: "reddit", name: "Reddit", icon: "🔴", color: "bg-orange-500" },
    { id: "discord", name: "Discord", icon: "🎮", color: "bg-indigo-500" },
    { id: "telegram", name: "Telegram", icon: "✈️", color: "bg-blue-400" },
    { id: "whatsapp", name: "WhatsApp", icon: "💬", color: "bg-green-500" },
  ];

  // Load user playlists
  useEffect(() => {
    loadUserPlaylists();
    generateEmbedCode();
    generateQRCode();
  }, []);

  useEffect(() => {
    generateEmbedCode();
  }, [embedSettings]);

  const loadUserPlaylists = async () => {
    // Mock playlists
    const mockPlaylists: Playlist[] = [
      {
        id: "1",
        name: "My Favorites",
        description: "Collection of my favorite videos",
        videos: ["video1", "video2", "video3"],
        collaborators: [],
        privacy: "private",
        createdBy: currentUser?.id || "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnail: videoThumbnail,
        duration: 1200,
        views: 1567,
      },
      {
        id: "2",
        name: "Study Together",
        description: "Educational content for group study",
        videos: ["video4", "video5"],
        collaborators: ["user2", "user3"],
        privacy: "collaborative",
        createdBy: currentUser?.id || "user1",
        createdAt: new Date(),
        updatedAt: new Date(),
        thumbnail: videoThumbnail,
        duration: 2400,
        views: 892,
      },
    ];
    setPlaylists(mockPlaylists);
  };

  const generateEmbedCode = () => {
    const { width, height, autoplay, controls, responsive, startTime } = embedSettings;
    const baseUrl = `https://eloity.com/embed/${videoId}`;
    const params = new URLSearchParams({
      autoplay: autoplay ? "1" : "0",
      controls: controls ? "1" : "0",
      start: startTime.toString(),
    });

    if (responsive) {
      setEmbedCode(`
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe 
    src="${baseUrl}?${params}" 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    allowfullscreen>
  </iframe>
</div>`.trim());
    } else {
      setEmbedCode(`
<iframe 
  width="${width}" 
  height="${height}" 
  src="${baseUrl}?${params}" 
  frameborder="0" 
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>`.trim());
    }
  };

  const generateQRCode = () => {
    // Mock QR code generation
    setQrCode(`data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200">
        <rect width="200" height="200" fill="white"/>
        <rect x="10" y="10" width="20" height="20" fill="black"/>
        <rect x="40" y="10" width="20" height="20" fill="black"/>
        <rect x="70" y="10" width="20" height="20" fill="black"/>
        <text x="100" y="100" text-anchor="middle" fill="black" font-size="12">QR Code</text>
      </svg>
    `)}`);
  };

  const handlePlatformShare = async (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    if (!platform) return;

    const shareUrl = `${window.location.origin}/video/${videoId}`;
    const shareText = shareOptions.customMessage || `Check out this amazing video: "${videoTitle}"`;

    // Platform-specific sharing logic
    switch (platformId) {
      case "twitter":
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(twitterUrl, "_blank");
        break;
      
      case "facebook":
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        window.open(facebookUrl, "_blank");
        break;
      
      case "linkedin":
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, "_blank");
        break;
      
      case "reddit":
        const redditUrl = `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(videoTitle)}`;
        window.open(redditUrl, "_blank");
        break;
      
      case "whatsapp":
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        window.open(whatsappUrl, "_blank");
        break;
      
      case "telegram":
        const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        window.open(telegramUrl, "_blank");
        break;
      
      default:
        // Copy to clipboard for unsupported platforms
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: `Video link copied for sharing on ${platform.name}`,
        });
    }

    if (onShare) {
      onShare(platformId, shareOptions);
    }

    toast({
      title: "Shared Successfully",
      description: `Video shared on ${platform.name}`,
    });
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/video/${videoId}`;
    await navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link Copied",
      description: "Video link copied to clipboard",
    });
  };

  const handleAddToPlaylist = async (playlistId: string) => {
    if (!playlistId) return;

    // Mock API call
    setPlaylists(prev => prev.map(playlist => 
      playlist.id === playlistId 
        ? { ...playlist, videos: [...playlist.videos, videoId] }
        : playlist
    ));

    const playlist = playlists.find(p => p.id === playlistId);
    toast({
      title: "Added to Playlist",
      description: `Video added to "${playlist?.name}"`,
    });
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName,
      description: newPlaylistDescription,
      videos: [videoId],
      collaborators: [],
      privacy: "private",
      createdBy: currentUser?.id || "user1",
      createdAt: new Date(),
      updatedAt: new Date(),
      thumbnail: videoThumbnail,
      duration: videoDuration,
      views: 0,
    };

    setPlaylists(prev => [...prev, newPlaylist]);
    setNewPlaylistName("");
    setNewPlaylistDescription("");

    toast({
      title: "Playlist Created",
      description: `"${newPlaylist.name}" playlist created with this video`,
    });
  };

  const handleStartWatchParty = async () => {
    if (!currentUser) return;

    const newWatchParty: WatchParty = {
      id: Date.now().toString(),
      hostId: currentUser.id,
      hostName: currentUser.name,
      videoId,
      videoTitle,
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          joinedAt: new Date(),
          isHost: true,
          isModerator: true,
          reactions: [],
        },
      ],
      startTime: new Date(),
      currentTime: 0,
      isPlaying: false,
      chatEnabled: partySettings.chatEnabled,
      maxParticipants: partySettings.maxParticipants,
      privacy: partySettings.privacy,
      reactions: partySettings.reactions,
      voiceChat: partySettings.voiceChat,
    };

    setWatchParty(newWatchParty);

    if (onStartWatchParty) {
      onStartWatchParty(newWatchParty);
    }

    toast({
      title: "Watch Party Started",
      description: "Invite friends to watch together!",
    });
  };

  const handleCopyEmbedCode = async () => {
    await navigator.clipboard.writeText(embedCode);
    toast({
      title: "Embed Code Copied",
      description: "Embed code copied to clipboard",
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
        >
          <Share2 className="w-6 h-6" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className={cn("max-w-4xl h-[80vh] bg-black border-gray-800 text-white overflow-hidden", className)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share & Collaborate
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab as any} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="share" className="text-xs">
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </TabsTrigger>
            <TabsTrigger value="playlists" className="text-xs">
              <List className="w-4 h-4 mr-1" />
              Playlists
            </TabsTrigger>
            <TabsTrigger value="watch-party" className="text-xs">
              <Users className="w-4 h-4 mr-1" />
              Watch Party
            </TabsTrigger>
            <TabsTrigger value="embed" className="text-xs">
              <ExternalLink className="w-4 h-4 mr-1" />
              Embed
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-1">
            <TabsContent value="share" className="space-y-4 mt-4">
              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                  onClick={handleCopyLink}
                >
                  <Copy className="w-5 h-5" />
                  <span className="text-xs">Copy Link</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <Download className="w-5 h-5" />
                  <span className="text-xs">Download</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-xs">QR Code</span>
                </Button>
                
                <Button
                  variant="outline"
                  className="flex flex-col items-center gap-2 h-auto py-3"
                >
                  <Mail className="w-5 h-5" />
                  <span className="text-xs">Email</span>
                </Button>
              </div>

              {/* Platform Grid */}
              <div>
                <Label className="text-sm font-medium mb-3 block">Share to Platforms</Label>
                <div className="grid grid-cols-5 gap-3">
                  {platforms.map((platform) => (
                    <Button
                      key={platform.id}
                      variant="outline"
                      className="flex flex-col items-center gap-2 h-auto py-3 border-gray-600 hover:border-gray-500"
                      onClick={() => handlePlatformShare(platform.id)}
                    >
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", platform.color)}>
                        <span className="text-lg">{platform.icon}</span>
                      </div>
                      <span className="text-xs">{platform.name}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Share Options */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Share Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="custom-message">Custom Message</Label>
                    <Textarea
                      id="custom-message"
                      value={shareOptions.customMessage}
                      onChange={(e) => setShareOptions(prev => ({ ...prev, customMessage: e.target.value }))}
                      placeholder="Add a custom message..."
                      className="bg-gray-700 border-gray-600 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Privacy</Label>
                      <Select 
                        value={shareOptions.privacy} 
                        onValueChange={(value: any) => setShareOptions(prev => ({ ...prev, privacy: value }))}
                      >
                        <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-700 border-gray-600">
                          <SelectItem value="public">Public</SelectItem>
                          <SelectItem value="unlisted">Unlisted</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-comments">Allow Comments</Label>
                        <Switch
                          id="allow-comments"
                          checked={shareOptions.allowComments}
                          onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, allowComments: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="allow-download">Allow Download</Label>
                        <Switch
                          id="allow-download"
                          checked={shareOptions.allowDownload}
                          onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, allowDownload: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="analytics">Track Analytics</Label>
                        <Switch
                          id="analytics"
                          checked={shareOptions.analytics}
                          onCheckedChange={(checked) => setShareOptions(prev => ({ ...prev, analytics: checked }))}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="playlists" className="space-y-4 mt-4">
              {/* Add to Existing Playlist */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Add to Playlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {playlists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img
                          src={playlist.thumbnail}
                          alt={playlist.name}
                          className="w-12 h-8 object-cover rounded"
                        />
                        <div>
                          <div className="font-medium text-sm">{playlist.name}</div>
                          <div className="text-xs text-gray-400">
                            {playlist.videos.length} videos • {formatDuration(playlist.duration)}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddToPlaylist(playlist.id)}
                        disabled={playlist.videos.includes(videoId)}
                      >
                        {playlist.videos.includes(videoId) ? (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Create New Playlist */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Create New Playlist</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="playlist-name">Playlist Name</Label>
                    <Input
                      id="playlist-name"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      placeholder="Enter playlist name..."
                      className="bg-gray-700 border-gray-600 mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="playlist-description">Description (Optional)</Label>
                    <Textarea
                      id="playlist-description"
                      value={newPlaylistDescription}
                      onChange={(e) => setNewPlaylistDescription(e.target.value)}
                      placeholder="Describe your playlist..."
                      className="bg-gray-700 border-gray-600 mt-1"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleCreatePlaylist}
                    disabled={!newPlaylistName.trim()}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Playlist
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="watch-party" className="space-y-4 mt-4">
              {watchParty ? (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Watch Party Active
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                        Live
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser?.avatar} />
                        <AvatarFallback>{currentUser?.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">Hosted by {watchParty.hostName}</div>
                        <div className="text-xs text-gray-400">
                          {watchParty.participants.length} / {watchParty.maxParticipants} participants
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Participants</span>
                        <Button size="sm" variant="outline">
                          <UserPlus className="w-4 h-4 mr-1" />
                          Invite
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {watchParty.participants.map((participant) => (
                          <div key={participant.id} className="flex items-center gap-2 p-2 bg-gray-700 rounded">
                            <Avatar className="w-6 h-6">
                              <AvatarImage src={participant.avatar} />
                              <AvatarFallback>{participant.name[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{participant.name}</span>
                            {participant.isHost && <Crown className="w-3 h-3 text-yellow-400" />}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Play className="w-4 h-4 mr-1" />
                        Sync Play
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-sm">Start Watch Party</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Privacy</Label>
                        <Select 
                          value={partySettings.privacy} 
                          onValueChange={(value: any) => setPartySettings(prev => ({ ...prev, privacy: value }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="friends">Friends Only</SelectItem>
                            <SelectItem value="invite-only">Invite Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Max Participants</Label>
                        <Select 
                          value={partySettings.maxParticipants.toString()} 
                          onValueChange={(value) => setPartySettings(prev => ({ ...prev, maxParticipants: parseInt(value) }))}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="party-chat">Enable Chat</Label>
                        <Switch
                          id="party-chat"
                          checked={partySettings.chatEnabled}
                          onCheckedChange={(checked) => setPartySettings(prev => ({ ...prev, chatEnabled: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="party-reactions">Enable Reactions</Label>
                        <Switch
                          id="party-reactions"
                          checked={partySettings.reactions}
                          onCheckedChange={(checked) => setPartySettings(prev => ({ ...prev, reactions: checked }))}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="party-voice">Voice Chat</Label>
                        <Switch
                          id="party-voice"
                          checked={partySettings.voiceChat}
                          onCheckedChange={(checked) => setPartySettings(prev => ({ ...prev, voiceChat: checked }))}
                        />
                      </div>
                    </div>

                    <Button onClick={handleStartWatchParty} className="w-full">
                      <Users className="w-4 h-4 mr-2" />
                      Start Watch Party
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="embed" className="space-y-4 mt-4">
              {/* Embed Settings */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm">Embed Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="embed-width">Width</Label>
                      <Input
                        id="embed-width"
                        type="number"
                        value={embedSettings.width}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                        className="bg-gray-700 border-gray-600 mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="embed-height">Height</Label>
                      <Input
                        id="embed-height"
                        type="number"
                        value={embedSettings.height}
                        onChange={(e) => setEmbedSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                        className="bg-gray-700 border-gray-600 mt-1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="embed-responsive">Responsive</Label>
                      <Switch
                        id="embed-responsive"
                        checked={embedSettings.responsive}
                        onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, responsive: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="embed-autoplay">Autoplay</Label>
                      <Switch
                        id="embed-autoplay"
                        checked={embedSettings.autoplay}
                        onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, autoplay: checked }))}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="embed-controls">Show Controls</Label>
                      <Switch
                        id="embed-controls"
                        checked={embedSettings.controls}
                        onCheckedChange={(checked) => setEmbedSettings(prev => ({ ...prev, controls: checked }))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Start Time (seconds)</Label>
                    <Slider
                      value={[embedSettings.startTime]}
                      onValueChange={([value]) => setEmbedSettings(prev => ({ ...prev, startTime: value }))}
                      max={videoDuration}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {formatDuration(embedSettings.startTime)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Embed Code */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center justify-between">
                    Embed Code
                    <Button size="sm" variant="outline" onClick={handleCopyEmbedCode}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={embedCode}
                    readOnly
                    className="bg-gray-700 border-gray-600 font-mono text-xs min-h-[120px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdvancedSharingHub;
