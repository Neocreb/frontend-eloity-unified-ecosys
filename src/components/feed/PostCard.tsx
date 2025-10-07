import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Heart, MessageCircle, Share2, Bookmark } from "lucide-react";
import { cn } from "@/utils/utils";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export type Post = {
  id: string;
  author: {
    name: string;
    username: string;
    location?: string | null;
    taggedUsers?: string[] | null;
    avatar?: string | null;
    verified?: boolean;
  };
  content: string;
  image?: string | null;
  location?: string | null;
  taggedUsers?: string[] | null;
  createdAt: string;
  likes: number;
  comments: number;
  shares: number;
  liked?: boolean;
  bookmarked?: boolean;
  isAd?: boolean;
  adUrl?: string | null;
  adCta?: string | null;
};

interface PostCardProps {
  post: Post;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.liked || false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [bookmarked, setBookmarked] = useState(post.bookmarked || false);

  // Load like state and count from Supabase
  useEffect(() => {
    let aborted = false;
    const load = async () => {
      try {
        const [{ count }, { data: myLike, error: myErr }] = await Promise.all([
          supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
          user?.id ? supabase.from('post_likes').select('id').eq('post_id', post.id).eq('user_id', user.id).maybeSingle() : Promise.resolve({ data: null, error: null } as any),
        ]);
        if (aborted) return;
        setLikesCount(count || 0);
        setLiked(!!myLike);
      } catch (e) {
        // ignore
      }
    };
    load();
    return () => { aborted = true; };
  }, [post.id, user?.id]);

  const handleLike = async () => {
    if (!user?.id) {
      // optimistic UI but no server write if not logged in
      return;
    }
    try {
      if (liked) {
        setLiked(false);
        setLikesCount((c) => Math.max(0, c - 1));
        const { error } = await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
        if (error) throw error;
      } else {
        setLiked(true);
        setLikesCount((c) => c + 1);
        const { error } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
    } catch (e) {
      // revert on error
      setLiked((v) => !v);
      setLikesCount((c) => (liked ? c + 1 : Math.max(0, c - 1)));
    }
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
  };

  const handlePostClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    navigate(`/app/post/${post.id}`);
  };

  return (
    <Card className="overflow-hidden max-w-full cursor-pointer hover:bg-muted/30 transition-colors" onClick={handlePostClick}>
      <CardHeader className="pb-3 pt-4 px-4 flex flex-row gap-3 items-start">
        <Avatar className="h-9 w-9 flex-shrink-0">
          <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
          <AvatarFallback>{post.author.name.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center">
            <span className="font-semibold truncate">{post.author.name}</span>
            {post.author.verified && (
              <Badge variant="default" className="ml-1 px-1 py-0 h-5 bg-eloity-primary hover:bg-eloity-primary/90 flex-shrink-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </Badge>
            )}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span className="truncate">@{post.author.username}</span>
            <span className="mx-1 flex-shrink-0">·</span>
            <span className="flex-shrink-0">{post.createdAt}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 flex-shrink-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="px-4 py-3 text-sm">
        <p className="mb-3 break-words">{post.content}</p>
        {post.image && (
          <div className="overflow-hidden rounded-md -mx-1">
            <img
              src={post.image}
              alt="Post image"
              className="w-full object-cover transition-all hover:scale-105"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="px-4 pt-1 pb-3 border-t flex justify-between">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "flex items-center gap-1 text-muted-foreground",
            liked && "text-eloity-accent"
          )}
          onClick={handleLike}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-current")} />
          <span>{likesCount}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1 text-muted-foreground"
        >
          <Share2 className="h-4 w-4" />
          <span>{post.shares}</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "text-muted-foreground",
            bookmarked && "text-eloity-primary"
          )}
          onClick={handleBookmark}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-current")} />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
