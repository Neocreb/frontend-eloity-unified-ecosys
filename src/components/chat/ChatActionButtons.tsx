import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Briefcase,
  ShoppingBag,
  Coins,
  Send,
  Phone,
  Video,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UnifiedChatType } from "@/types/unified-chat";

interface ChatActionButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
  className?: string;
  children?: React.ReactNode;
}

interface FreelanceChatButtonProps extends ChatActionButtonProps {
  jobTitle: string;
  budget?: number;
}

interface MarketplaceChatButtonProps extends ChatActionButtonProps {
  productName: string;
  price: number;
  action?: "inquire" | "buy_now" | "make_offer";
}

interface CryptoChatButtonProps extends ChatActionButtonProps {
  tradeType: "buy" | "sell";
  crypto: string;
  amount: number;
}

interface SocialChatButtonProps extends ChatActionButtonProps {
  context?: "reply" | "dm" | "group";
}

// Generic chat button
export const ChatActionButton: React.FC<ChatActionButtonProps> = ({
  variant = "default",
  size = "md",
  disabled = false,
  loading = false,
  onClick,
  className,
  children,
}) => (
  <Button
    variant={variant}
    size={size}
    disabled={disabled || loading}
    onClick={onClick}
    className={cn("flex items-center gap-2", className)}
  >
    {loading ? (
      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
    ) : (
      <MessageCircle className="w-4 h-4" />
    )}
    {children}
  </Button>
);

// Freelance-specific chat button
export const FreelanceChatButton: React.FC<FreelanceChatButtonProps> = ({
  jobTitle,
  budget,
  ...props
}) => (
  <ChatActionButton {...props}>
    <Briefcase className="w-4 h-4" />
    <span>Contact About Job</span>
    {budget && (
      <Badge variant="secondary" className="ml-2">
        ${budget.toLocaleString()}
      </Badge>
    )}
  </ChatActionButton>
);

// Marketplace-specific chat button
export const MarketplaceChatButton: React.FC<MarketplaceChatButtonProps> = ({
  productName,
  price,
  action = "inquire",
  ...props
}) => {
  const getButtonText = () => {
    switch (action) {
      case "buy_now":
        return "Buy Now & Chat";
      case "make_offer":
        return "Make Offer";
      default:
        return "Ask Seller";
    }
  };

  const getIcon = () => {
    switch (action) {
      case "buy_now":
        return <ShoppingBag className="w-4 h-4" />;
      case "make_offer":
        return <Coins className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  return (
    <ChatActionButton {...props}>
      {getIcon()}
      <span>{getButtonText()}</span>
      <Badge variant="outline" className="ml-2">
        ${price.toLocaleString()}
      </Badge>
    </ChatActionButton>
  );
};

// Crypto P2P chat button
export const CryptoChatButton: React.FC<CryptoChatButtonProps> = ({
  tradeType,
  crypto,
  amount,
  ...props
}) => (
  <ChatActionButton {...props}>
    <Coins className="w-4 h-4" />
    <span>
      {tradeType === "buy" ? "Buy" : "Sell"} {crypto}
    </span>
    <Badge
      variant={tradeType === "buy" ? "default" : "secondary"}
      className="ml-2"
    >
      {amount} {crypto}
    </Badge>
  </ChatActionButton>
);

// Social chat button
export const SocialChatButton: React.FC<SocialChatButtonProps> = ({
  context = "dm",
  ...props
}) => {
  const getButtonText = () => {
    switch (context) {
      case "reply":
        return "Reply";
      case "group":
        return "Join Discussion";
      default:
        return "Send Message";
    }
  };

  return (
    <ChatActionButton {...props}>
      <Send className="w-4 h-4" />
      {getButtonText()}
    </ChatActionButton>
  );
};

// Quick action buttons for existing chats
interface QuickChatActionsProps {
  chatType: UnifiedChatType;
  threadId: string;
  isOnline?: boolean;
  className?: string;
}

export const QuickChatActions: React.FC<QuickChatActionsProps> = ({
  chatType,
  threadId,
  isOnline = false,
  className,
}) => {
  const handleCall = () => {
    // Implement call functionality
    console.log(`Starting call for ${chatType} chat ${threadId}`);
  };

  const handleVideoCall = () => {
    // Implement video call functionality
    console.log(`Starting video call for ${chatType} chat ${threadId}`);
  };

  const getTypeColor = () => {
    switch (chatType) {
      case "freelance":
        return "text-green-600";
      case "marketplace":
        return "text-orange-600";
      case "p2p":
        return "text-yellow-600";
      case "social":
        return "text-blue-600";
      case "ai_assistant":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Chat type indicator */}
      <div className={cn("flex items-center gap-1 text-xs", getTypeColor())}>
        {chatType === "freelance" && <Briefcase className="w-3 h-3" />}
        {chatType === "marketplace" && <ShoppingBag className="w-3 h-3" />}
        {chatType === "p2p" && <Coins className="w-3 h-3" />}
        {chatType === "social" && <MessageCircle className="w-3 h-3" />}
        <span className="capitalize">{chatType.replace("_", " ")}</span>
      </div>

      {/* Online status */}
      {isOnline && (
        <div className="flex items-center gap-1 text-xs text-green-600">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <span>Online</span>
        </div>
      )}

      {/* Quick actions */}
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCall}
          className="h-8 w-8 p-0"
          disabled={!isOnline}
        >
          <Phone className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleVideoCall}
          className="h-8 w-8 p-0"
          disabled={!isOnline}
        >
          <Video className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

// Notification-style chat button
interface NotificationChatButtonProps {
  title: string;
  message: string;
  chatType: UnifiedChatType;
  timestamp: Date;
  unread?: boolean;
  onClick: () => void;
}

export const NotificationChatButton: React.FC<NotificationChatButtonProps> = ({
  title,
  message,
  chatType,
  timestamp,
  unread = false,
  onClick,
}) => {
  const getTypeIcon = () => {
    switch (chatType) {
      case "freelance":
        return <Briefcase className="w-4 h-4 text-green-600" />;
      case "marketplace":
        return <ShoppingBag className="w-4 h-4 text-orange-600" />;
      case "p2p":
        return <Coins className="w-4 h-4 text-yellow-600" />;
      case "social":
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case "ai_assistant":
        return <MessageCircle className="w-4 h-4 text-purple-600" />;
      default:
        return <MessageCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full p-3 h-auto text-left justify-start hover:bg-muted/50",
        unread && "bg-primary/5 border-l-2 border-primary",
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="mt-1">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p
              className={cn(
                "text-sm font-medium truncate",
                unread && "font-semibold",
              )}
            >
              {title}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString()}
              </span>
              {unread && <div className="w-2 h-2 bg-primary rounded-full" />}
            </div>
          </div>
          <p className="text-sm text-muted-foreground truncate">{message}</p>
        </div>
      </div>
    </Button>
  );
};
