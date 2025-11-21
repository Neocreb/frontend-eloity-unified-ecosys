// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ExternalLink } from "lucide-react";
import PostActions from "./PostActions";
import PostContentRenderer from "./PostContentRenderer";
import { Post } from "./PostCard";

interface EnhancedPostCardProps {
  post: Post;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({ post }) => {
  const navigate = useNavigate();

  const handleUserClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/app/profile/${post.author.username}`);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start gap-3">
          <Avatar
            className="h-10 w-10 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleUserClick}
          >
            <AvatarImage src={post.author.avatar} alt={post.author.name} />
            <AvatarFallback>
              {post.author.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center">
              <span
                className="font-semibold cursor-pointer hover:underline"
                onClick={handleUserClick}
              >
                {post.author.name}
              </span>
              {post.author.verified && (
                <Badge variant="outline" className="ml-1 bg-blue-500 p-0">
                  <Check className="h-3 w-3 text-white" />
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span
                className="cursor-pointer hover:underline"
                onClick={handleUserClick}
              >
                @{post.author.username}
              </span>
              <span>·</span>
              <span>{post.createdAt}</span>
              {post.isAd && (
                <span className="ml-1 text-xs text-muted-foreground">
                  Sponsored
                </span>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-3">
        <PostContentRenderer
          content={post.content}
          maxLines={4}
          className="mb-3"
          onSeeMore={() => navigate(`/app/post/${post.id}`)}
        />
        {post.image && (
          <div className="mt-3 overflow-hidden rounded-lg">
            <img
              src={post.image}
              alt="Post attachment"
              className="h-auto w-full object-cover transition-transform hover:scale-105"
            />
          </div>
        )}
        {post.isAd && post.adUrl && (
          <div className="mt-3">
            <Button
              variant="default"
              className="w-full"
              onClick={() => window.open(post.adUrl, "_blank")}
            >
              {post.adCta || "Learn More"}{" "}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-0 px-4">
        <PostActions
          postId={post.id}
          initialLikes={post.likes}
          initialComments={post.comments}
          initialShares={post.shares}
          initialLiked={post.liked}
        />
      </CardFooter>
    </Card>
  );
};

export default EnhancedPostCard;
