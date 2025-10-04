import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download,
  FileText,
  Image,
  Video,
  Mic,
  Clock,
  CheckCheck,
  Eye,
  Copy,
  Reply,
  Forward,
  MoreVertical,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  Frown,
  Crown,
  Shield,
  AtSign,
  Pin,
  Edit3,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format, isToday, isYesterday } from "date-fns";
import { GroupParticipant } from "@/types/group-chat";

export interface GroupEnhancedChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  senderRole?: 'admin' | 'member';
  senderCustomTitle?: string;
  content: string;
  type: "text" | "voice" | "sticker" | "media" | "system" | "announcement";
  timestamp: string;
  metadata?: {
    duration?: number;
    transcription?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    mediaType?: "image" | "video" | "file";
    stickerName?: string;
    systemAction?: string;
    mentionedUserIds?: string[];
  };
  status: "sending" | "sent" | "delivered" | "read";
  reactions?: {
    userId: string;
    userName: string;
    emoji: string;
    timestamp: string;
  }[];
  isEdited?: boolean;
  isPinned?: boolean;
  pinnedBy?: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderName: string;
    senderRole?: 'admin' | 'member';
  };
  mentionedUsers?: {
    id: string;
    name: string;
  }[];
  forwardedFrom?: {
    groupId?: string;
    groupName?: string;
    originalSender: string;
    originalTimestamp: string;
  };
}

interface GroupEnhancedMessageProps {
  message: GroupEnhancedChatMessage;
  currentUserId: string;
  currentUserRole?: 'admin' | 'member';
  isGroupMessage: boolean;
  groupParticipants?: GroupParticipant[];
  isMobile?: boolean;
  showAvatar?: boolean;
  groupWithPrevious?: boolean;
  onReply?: (message: GroupEnhancedChatMessage) => void;
  onForward?: (message: GroupEnhancedChatMessage) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string, pin: boolean) => void;
  onMention?: (userId: string) => void;
  onReportMessage?: (messageId: string, reason: string) => void;
  onPromoteUser?: (userId: string) => void;
  onRemoveUser?: (userId: string) => void;
}

const reactionEmojis = [
  { emoji: "❤️", name: "heart" },
  { emoji: "👍", name: "thumbs_up" },
  { emoji: "😂", name: "laugh" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😡", name: "angry" },
];

export const GroupEnhancedMessage: React.FC<GroupEnhancedMessageProps> = ({
  message,
  currentUserId,
  currentUserRole = 'member',
  isGroupMessage,
  groupParticipants = [],
  isMobile = false,
  showAvatar = true,
  groupWithPrevious = false,
  onReply,
  onForward,
  onReact,
  onEdit,
  onDelete,
  onPin,
  onMention,
  onReportMessage,
  onPromoteUser,
  onRemoveUser,
}) => {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showTranscription, setShowTranscription] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactions, setShowReactions] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const isCurrentUser = message.senderId === currentUserId;
  const isAdmin = currentUserRole === 'admin';
  const isSenderAdmin = message.senderRole === 'admin';
  const canEdit = isCurrentUser && message.type === 'text';
  const canDelete = isCurrentUser || isAdmin;
  const canPin = isAdmin;

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReaction = (emoji: string) => {
    onReact?.(message.id, emoji);
    setShowReactions(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    toast({
      title: "Copied",
      description: "Message copied to clipboard",
    });
  };

  const handleSaveEdit = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = () => {
    if (!isCurrentUser) return null;
    
    switch (message.status) {
      case "sending":
        return <Clock className="w-3 h-3 text-gray-400" />;
      case "sent":
        return <CheckCheck className="w-3 h-3 text-gray-400" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-600" />;
      default:
        return null;
    }
  };

  const renderMentions = (text: string) => {
    if (!message.mentionedUsers?.length) {
      return text;
    }

    let processedText = text;
    message.mentionedUsers.forEach((user) => {
      const mention = `@${user.name}`;
      const mentionRegex = new RegExp(`@${user.name}`, 'gi');
      processedText = processedText.replace(
        mentionRegex,
        `<span class="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded font-medium">${mention}</span>`
      );
    });

    return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
  };

  const renderSystemMessage = () => {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm text-center max-w-sm">
          {message.content}
        </div>
      </div>
    );
  };

  const renderAnnouncementMessage = () => {
    return (
      <div className="my-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
              📢 Announcement
            </Badge>
            {isSenderAdmin && (
              <Crown className="h-4 w-4 text-yellow-600" />
            )}
          </div>
          <div className="flex items-start gap-3">
            {showAvatar && !groupWithPrevious && (
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderAvatar} alt={message.senderName} />
                <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
              </Avatar>
            )}
            <div className="flex-1">
              <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
                {message.senderName}
                {message.senderCustomTitle && (
                  <span className="ml-2 text-xs opacity-75">{message.senderCustomTitle}</span>
                )}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">
                {renderMentions(message.content)}
              </div>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (message.type === 'system') {
    return renderSystemMessage();
  }

  if (message.type === 'announcement') {
    return renderAnnouncementMessage();
  }

  return (
    <div className={cn(
      "group relative",
      isCurrentUser ? "flex justify-end" : "flex justify-start",
      "mb-2"
    )}>
      <div className={cn(
        "flex items-end gap-2 max-w-[85%]",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        {showAvatar && !groupWithPrevious && isGroupMessage && !isCurrentUser && (
          <Avatar className="h-8 w-8 mb-1">
            <AvatarImage src={message.senderAvatar} alt={message.senderName} />
            <AvatarFallback>{getInitials(message.senderName)}</AvatarFallback>
          </Avatar>
        )}

        {/* Message bubble */}
        <div className={cn(
          "relative",
          showAvatar && !groupWithPrevious && isGroupMessage && !isCurrentUser && "ml-0",
          showAvatar && groupWithPrevious && isGroupMessage && !isCurrentUser && "ml-10"
        )}>
          {/* Pinned indicator */}
          {message.isPinned && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              <Pin className="h-3 w-3" />
              <span>Pinned by {message.pinnedBy}</span>
            </div>
          )}

          {/* Forwarded indicator */}
          {message.forwardedFrom && (
            <div className="text-xs text-muted-foreground mb-1 italic">
              Forwarded from {message.forwardedFrom.groupName || message.forwardedFrom.originalSender}
            </div>
          )}

          {/* Reply indicator */}
          {message.replyTo && (
            <div className={cn(
              "border-l-4 border-primary/30 pl-3 py-2 mb-2 bg-muted/30 rounded-r",
              isCurrentUser ? "bg-primary/10" : "bg-muted/50"
            )}>
              <div className="text-xs text-muted-foreground">
                Replying to {message.replyTo.senderName}
                {message.replyTo.senderRole === 'admin' && (
                  <Crown className="h-3 w-3 inline ml-1 text-yellow-500" />
                )}
              </div>
              <div className="text-sm opacity-75 truncate">
                {message.replyTo.content}
              </div>
            </div>
          )}

          <div className={cn(
            "rounded-2xl px-4 py-2 relative",
            isCurrentUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground",
            message.type === "voice" && "bg-accent text-accent-foreground"
          )}>
            {/* Sender name (for group messages, non-current user) */}
            {isGroupMessage && !isCurrentUser && !groupWithPrevious && (
              <div className="text-xs font-medium mb-1 flex items-center gap-1">
                <span className="text-primary">{message.senderName}</span>
                {isSenderAdmin && (
                  <Crown className="h-3 w-3 text-yellow-500" />
                )}
                {message.senderCustomTitle && (
                  <Badge variant="outline" className="text-xs h-4 px-1">
                    {message.senderCustomTitle}
                  </Badge>
                )}
              </div>
            )}

            {/* Message content */}
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-background text-foreground"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') setIsEditing(false);
                  }}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEdit}>Save</Button>
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-sm">
                {message.type === "text" ? (
                  <div>{renderMentions(message.content)}</div>
                ) : message.type === "voice" ? (
                  <div className="flex items-center gap-3 min-w-48">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handlePlayPause}
                      className="h-8 w-8 p-0"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div className="flex-1">
                      <div className="bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${audioProgress}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {message.metadata?.duration ? formatDuration(message.metadata.duration) : "0:00"}
                      </div>
                    </div>
                    {message.metadata?.transcription && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowTranscription(!showTranscription)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                    <audio ref={audioRef} src={message.content} />
                  </div>
                ) : message.type === "media" ? (
                  <div className="space-y-2">
                    {message.metadata?.mediaType === "image" ? (
                      <img
                        src={message.content}
                        alt="Shared image"
                        className="max-w-64 max-h-64 rounded-lg"
                      />
                    ) : message.metadata?.mediaType === "video" ? (
                      <video
                        src={message.content}
                        controls
                        className="max-w-64 max-h-64 rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-3 p-2 bg-muted rounded">
                        <FileText className="h-6 w-6" />
                        <div>
                          <div className="font-medium">{message.metadata?.fileName}</div>
                          <div className="text-xs text-muted-foreground">
                            {message.metadata?.fileSize && formatFileSize(message.metadata.fileSize)}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                ) : message.type === "sticker" ? (
                  <div className="text-4xl">{message.content}</div>
                ) : (
                  <div>{message.content}</div>
                )}

                {/* Voice transcription */}
                {showTranscription && message.metadata?.transcription && (
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                    {message.metadata.transcription}
                  </div>
                )}

                {/* Edited indicator */}
                {message.isEdited && (
                  <div className="text-xs opacity-50 mt-1">edited</div>
                )}
              </div>
            )}

            {/* Message timestamp and status */}
            <div className={cn(
              "flex items-center gap-1 mt-1",
              isCurrentUser ? "justify-end" : "justify-start"
            )}>
              <span className="text-xs opacity-75">
                {formatTime(message.timestamp)}
              </span>
              {getStatusIcon()}
            </div>

            {/* Quick reactions on hover */}
            <div className={cn(
              "absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity",
              "flex gap-1 bg-background border border-border rounded-full p-1 shadow-lg",
              isCurrentUser ? "right-0" : "left-0"
            )}>
              {reactionEmojis.slice(0, 3).map((reaction) => (
                <Button
                  key={reaction.emoji}
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-sm hover:bg-muted"
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  {reaction.emoji}
                </Button>
              ))}
              <DropdownMenu open={showReactions} onOpenChange={setShowReactions}>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {reactionEmojis.map((reaction) => (
                    <DropdownMenuItem
                      key={reaction.emoji}
                      onClick={() => handleReaction(reaction.emoji)}
                    >
                      <span className="mr-2">{reaction.emoji}</span>
                      {reaction.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Message actions */}
          <div className={cn(
            "absolute top-0 opacity-0 group-hover:opacity-100 transition-opacity",
            isCurrentUser ? "-left-8" : "-right-8"
          )}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCurrentUser ? "end" : "start"}>
                <DropdownMenuItem onClick={() => onReply?.(message)}>
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onForward?.(message)}>
                  <Forward className="h-4 w-4 mr-2" />
                  Forward
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </DropdownMenuItem>
                
                {canPin && (
                  <DropdownMenuItem onClick={() => onPin?.(message.id, !message.isPinned)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {message.isPinned ? 'Unpin' : 'Pin'} Message
                  </DropdownMenuItem>
                )}

                {!isCurrentUser && (
                  <DropdownMenuItem onClick={() => onMention?.(message.senderId)}>
                    <AtSign className="h-4 w-4 mr-2" />
                    Mention {message.senderName}
                  </DropdownMenuItem>
                )}

                {isAdmin && !isCurrentUser && (
                  <>
                    <DropdownMenuSeparator />
                    {!isSenderAdmin && (
                      <DropdownMenuItem onClick={() => onPromoteUser?.(message.senderId)}>
                        <Crown className="h-4 w-4 mr-2" />
                        Promote to Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onRemoveUser?.(message.senderId)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove from Group
                    </DropdownMenuItem>
                  </>
                )}

                <DropdownMenuSeparator />

                {canEdit && (
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}

                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(message.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}

                {!isCurrentUser && (
                  <DropdownMenuItem
                    onClick={() => onReportMessage?.(message.id, "inappropriate")}
                    className="text-destructive"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Reactions display */}
      {message.reactions && message.reactions.length > 0 && (
        <div className={cn(
          "flex flex-wrap gap-1 mt-1 mb-2",
          isCurrentUser ? "justify-end mr-10" : "justify-start ml-10"
        )}>
          {Object.entries(
            message.reactions.reduce((acc, reaction) => {
              if (!acc[reaction.emoji]) {
                acc[reaction.emoji] = [];
              }
              acc[reaction.emoji].push(reaction);
              return acc;
            }, {} as Record<string, typeof message.reactions>)
          ).map(([emoji, reactions]) => (
            <TooltipProvider key={emoji}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 py-0 text-xs"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji} {reactions.length}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div>
                    {reactions.map((r, i) => (
                      <div key={i}>{r.userName}</div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      )}
    </div>
  );
};
