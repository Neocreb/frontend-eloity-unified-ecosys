import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Play, 
  Heart, 
  Share2, 
  MessageCircle, 
  Eye,
  ArrowLeft,
  Download,
  MoreHorizontal,
  Flag
} from 'lucide-react';
import { videoService } from '@/services/videoService';
import { useToast } from '@/components/ui/use-toast';

// Define TypeScript interfaces
interface VideoCreator {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
  followers: number;
}

interface VideoData {
  id: string;
  title: string;
  description: string;
  creator: VideoCreator;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: string;
  uploadDate: string;
  thumbnail: string;
  videoUrl: string;
  tags: string[];
  category: string;
}

const VideoDetail: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (videoId) {
      fetchVideoData();
      fetchRelatedVideos();
    }
  }, [videoId]);

  const fetchVideoData = async () => {
    try {
      setLoading(true);
      const videoData = await videoService.getVideoById(videoId!);
      
      if (videoData) {
        setVideo({
          id: videoData.id,
          title: videoData.title,
          description: videoData.description || '',
          creator: {
            id: videoData.user_id,
            username: videoData.user?.username || 'unknown',
            displayName: videoData.user?.full_name || 'Unknown User',
            avatar: videoData.user?.avatar_url || '/placeholder.svg',
            verified: videoData.user?.is_verified || false,
            followers: 0 // This would need to be fetched from a user service
          },
          views: videoData.views_count,
          likes: videoData.likes_count,
          comments: videoData.comments_count,
          shares: videoData.shares_count || 0,
          duration: formatDuration(videoData.duration || 0),
          uploadDate: videoData.created_at,
          thumbnail: videoData.thumbnail_url || '/placeholder.svg',
          videoUrl: videoData.video_url,
          tags: videoData.tags || [],
          category: videoData.category || 'General'
        });
      } else {
        setError('Video not found');
      }
    } catch (err) {
      console.error('Error fetching video:', err);
      setError('Failed to load video');
      toast({
        title: "Error",
        description: "Failed to load video data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedVideos = async () => {
    try {
      const videos = await videoService.getVideos(3, 0, video?.category);
      setRelatedVideos(videos.filter((v: any) => v.id !== videoId));
    } catch (err) {
      console.error('Error fetching related videos:', err);
      // Fallback to empty array
      setRelatedVideos([]);
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleLike = async () => {
    if (!videoId || !video) return;
    
    try {
      if (isLiked) {
        await videoService.unlikeVideo(videoId);
        setIsLiked(false);
        setVideo(prev => ({
          ...prev!,
          likes: prev!.likes - 1
        }));
      } else {
        await videoService.likeVideo(videoId);
        setIsLiked(true);
        setVideo(prev => ({
          ...prev!,
          likes: prev!.likes + 1
        }));
      }
    } catch (err) {
      console.error('Error liking video:', err);
      toast({
        title: "Error",
        description: "Failed to like video",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Video not found</h2>
          <p className="text-muted-foreground mb-6">{error || 'The video you are looking for does not exist.'}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Button>

          {/* Video Player */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                <img 
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button size="lg" className="rounded-full w-16 h-16">
                    <Play className="w-8 h-8" />
                  </Button>
                </div>
                <Badge className="absolute top-4 right-4 bg-black/70">
                  {video.duration}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Video Info */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {video.views.toLocaleString()} views
                    </span>
                    <span>•</span>
                    <span>{new Date(video.uploadDate).toLocaleDateString()}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {/* Creator Info & Actions */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={video.creator.avatar} />
                    <AvatarFallback>
                      {video.creator.displayName.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{video.creator.displayName}</h3>
                      {video.creator.verified && (
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {video.creator.followers.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <Button>Follow</Button>
              </div>

              {/* Engagement Actions */}
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleLike}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  {video.likes.toLocaleString()}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  {video.comments}
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">{video.description}</p>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">
                Comments ({video.comments})
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Comments will be loaded here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Related Videos */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Related Videos</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {relatedVideos.length > 0 ? (
                  relatedVideos.map((relatedVideo) => (
                    <div 
                      key={relatedVideo.id} 
                      className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      onClick={() => navigate(`/app/videos/${relatedVideo.id}`)}
                    >
                      <div className="relative w-24 h-16 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                        <img 
                          src={relatedVideo.thumbnail_url || '/placeholder.svg'} 
                          alt={relatedVideo.title}
                          className="w-full h-full object-cover"
                        />
                        <Badge className="absolute bottom-1 right-1 text-xs bg-black/70">
                          {formatDuration(relatedVideo.duration || 0)}
                        </Badge>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {relatedVideo.title}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {relatedVideo.user?.full_name || relatedVideo.user?.username || 'Unknown User'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(relatedVideo.views_count || 0).toLocaleString()} views
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    <p>No related videos found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Stats */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Video Statistics</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{video.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-medium">{video.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">{video.comments}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shares</span>
                  <span className="font-medium">{video.shares}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category</span>
                  <span className="font-medium">{video.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoDetail;