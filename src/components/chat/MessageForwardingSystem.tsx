import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Forward,
  Search,
  Users,
  MessageCircle,
  Send,
  Check,
  X,
  User,
  Crown,
  Clock,
  Image as ImageIcon,
  Video,
  File,
  Mic,
  ExternalLink,
  Share2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

interface MessageForwardingSystemProps {
  message: {
    id: string;
    content: string;
    type: "text" | "image" | "video" | "audio" | "file" | "sticker";
    sender: {
      id: string;
      name: string;
      avatar?: string;
      isPremium?: boolean;
    };
    timestamp: string;
    attachments?: Array<{
      type: string;
      url: string;
      name?: string;
      size?: number;
    }>;
    metadata?: any;
  };
  isOpen: boolean;
  onClose: () => void;
  onForward: (recipients: string[], message: string) => void;
}

interface Contact {
  id: string;
  name: string;
  username?: string;
  avatar?: string;
  isPremium?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
  type: "user" | "group" | "channel";
  memberCount?: number;
}

interface ForwardingOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  premium?: boolean;
}

export const MessageForwardingSystem: React.FC<MessageForwardingSystemProps> = ({
  message,
  isOpen,
  onClose,
  onForward,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("contacts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [forwardMessage, setForwardMessage] = useState("");
  const [isForwarding, setIsForwarding] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [recentContacts, setRecentContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Contact[]>([]);
  const [channels, setChannels] = useState<Contact[]>([]);

  // Initialize contacts data
  useEffect(() => {
    // Mock data - in real app, fetch from API
    const mockContacts: Contact[] = [
      {
        id: "1",
        name: "Alice Johnson",
        username: "@alice",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
        isPremium: true,
        isOnline: true,
        type: "user",
      },
      {
        id: "2",
        name: "Bob Smith",
        username: "@bobsmith",
        avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop&crop=face",
        isPremium: false,
        isOnline: false,
        lastSeen: "2 hours ago",
        type: "user",
      },
      {
        id: "3",
        name: "Creative Team",
        username: "@creative-team",
        avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&fit=crop&crop=center",
        type: "group",
        memberCount: 12,
      },
      {
        id: "4",
        name: "Tech Updates",
        username: "@tech-updates",
        avatar: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=100&h=100&fit=crop&crop=center",
        type: "channel",
        memberCount: 1250,
      },
    ];

    setContacts(mockContacts.filter(c => c.type === "user"));
    setRecentContacts(mockContacts.slice(0, 2));
    setGroups(mockContacts.filter(c => c.type === "group"));
    setChannels(mockContacts.filter(c => c.type === "channel"));
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    channel.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSelect = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleForward = async () => {
    if (selectedContacts.length === 0) {
      toast({
        title: "No recipients selected",
        description: "Please select at least one contact to forward the message",
        variant: "destructive",
      });
      return;
    }

    setIsForwarding(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      onForward(selectedContacts, forwardMessage);
      
      toast({
        title: "Message forwarded!",
        description: `Sent to ${selectedContacts.length} ${selectedContacts.length === 1 ? 'contact' : 'contacts'}`,
      });
      
      // Reset state
      setSelectedContacts([]);
      setForwardMessage("");
      onClose();
    } catch (error) {
      toast({
        title: "Forward failed",
        description: "Failed to forward message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsForwarding(false);
    }
  };

  const shareToSocialMedia = (platform: string) => {
    const shareText = `Check out this message: "${message.content}"`;
    const shareUrl = `https://softchat.app/message/${message.id}`;
    
    let url = "";
    switch (platform) {
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
    }
    
    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      toast({
        title: "Sharing to social media",
        description: `Opening ${platform} share dialog`,
      });
    }
  };

  const copyMessageLink = async () => {
    const messageLink = `https://softchat.app/message/${message.id}`;
    try {
      await navigator.clipboard.writeText(messageLink);
      toast({
        title: "Link copied!",
        description: "Message link copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  const forwardingOptions: ForwardingOption[] = [
    {
      id: "twitter",
      title: "Share to Twitter",
      description: "Share this message on Twitter",
      icon: <ExternalLink className="w-4 h-4" />,
      action: () => shareToSocialMedia("twitter"),
    },
    {
      id: "facebook",
      title: "Share to Facebook",
      description: "Share this message on Facebook",
      icon: <Share2 className="w-4 h-4" />,
      action: () => shareToSocialMedia("facebook"),
    },
    {
      id: "whatsapp",
      title: "Share to WhatsApp",
      description: "Share via WhatsApp",
      icon: <MessageCircle className="w-4 h-4" />,
      action: () => shareToSocialMedia("whatsapp"),
    },
    {
      id: "telegram",
      title: "Share to Telegram",
      description: "Share via Telegram",
      icon: <Send className="w-4 h-4" />,
      action: () => shareToSocialMedia("telegram"),
    },
    {
      id: "copy_link",
      title: "Copy Message Link",
      description: "Copy shareable link",
      icon: <ExternalLink className="w-4 h-4" />,
      action: copyMessageLink,
    },
  ];

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "audio":
        return <Mic className="w-4 h-4" />;
      case "file":
        return <File className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const renderContact = (contact: Contact, isSelected: boolean) => (
    <Card
      key={contact.id}
      className={cn(
        "p-3 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary bg-primary/5"
      )}
      onClick={() => handleContactSelect(contact.id)}
    >
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-10 h-10">
            <AvatarImage src={contact.avatar} alt={contact.name} />
            <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
          </Avatar>
          {contact.type === "user" && contact.isOnline && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium truncate">{contact.name}</h4>
            {contact.isPremium && (
              <Crown className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            )}
            {contact.type === "group" && (
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
            )}
            {contact.type === "channel" && (
              <MessageCircle className="w-4 h-4 text-purple-500 flex-shrink-0" />
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {contact.username && <span>{contact.username}</span>}
            {contact.type === "user" && !contact.isOnline && contact.lastSeen && (
              <>
                <Clock className="w-3 h-3" />
                <span>{contact.lastSeen}</span>
              </>
            )}
            {(contact.type === "group" || contact.type === "channel") && contact.memberCount && (
              <span>{contact.memberCount.toLocaleString()} members</span>
            )}
          </div>
        </div>
        
        <Checkbox checked={isSelected} />
      </div>
    </Card>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Forward className="w-5 h-5" />
            Forward Message
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Message Preview */}
          <Card className="mb-4 p-3 bg-muted/30">
            <div className="flex items-start gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{message.sender.name}</span>
                  {message.sender.isPremium && (
                    <Crown className="w-3 h-3 text-yellow-500" />
                  )}
                  {getMessageTypeIcon(message.type)}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {message.content}
                </p>
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {message.attachments.length} attachment{message.attachments.length > 1 ? 's' : ''}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="groups">Groups</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
              <TabsTrigger value="share">Share</TabsTrigger>
            </TabsList>

            {/* Search */}
            <div className="relative mt-4 mb-4">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contacts, groups, or channels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Selected contacts summary */}
            {selectedContacts.length > 0 && (
              <Card className="p-3 mb-4 bg-primary/5 border-primary/20">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedContacts.length} recipient{selectedContacts.length > 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedContacts([])}
                  >
                    Clear all
                  </Button>
                </div>
              </Card>
            )}

            <div className="flex-1 min-h-0">
              <ScrollArea className="h-full">
                <TabsContent value="contacts" className="mt-0 space-y-3">
                  {/* Recent contacts */}
                  {recentContacts.length > 0 && searchQuery === "" && (
                    <>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Recent</h4>
                      {recentContacts.map(contact =>
                        renderContact(contact, selectedContacts.includes(contact.id))
                      )}
                      <div className="border-t pt-3 mt-3">
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">All Contacts</h4>
                      </div>
                    </>
                  )}
                  
                  {filteredContacts.length > 0 ? (
                    filteredContacts.map(contact =>
                      renderContact(contact, selectedContacts.includes(contact.id))
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No contacts found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="groups" className="mt-0 space-y-3">
                  {filteredGroups.length > 0 ? (
                    filteredGroups.map(group =>
                      renderContact(group, selectedContacts.includes(group.id))
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No groups found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="channels" className="mt-0 space-y-3">
                  {filteredChannels.length > 0 ? (
                    filteredChannels.map(channel =>
                      renderContact(channel, selectedContacts.includes(channel.id))
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No channels found</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="share" className="mt-0 space-y-3">
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Share to Social Media</h4>
                    {forwardingOptions.map(option => (
                      <Card
                        key={option.id}
                        className="p-3 cursor-pointer transition-all hover:shadow-md"
                        onClick={option.action}
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            {option.icon}
                          </div>
                          <div>
                            <h5 className="font-medium text-sm">{option.title}</h5>
                            <p className="text-xs text-muted-foreground">{option.description}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </ScrollArea>
            </div>
          </Tabs>

          {/* Optional message */}
          {activeTab !== "share" && (
            <div className="mt-4">
              <Input
                placeholder="Add a message (optional)"
                value={forwardMessage}
                onChange={(e) => setForwardMessage(e.target.value)}
                maxLength={200}
              />
            </div>
          )}

          {/* Action buttons */}
          {activeTab !== "share" && (
            <div className="flex gap-3 mt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button
                onClick={handleForward}
                disabled={selectedContacts.length === 0 || isForwarding}
                className="flex-1"
              >
                {isForwarding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Forwarding...
                  </>
                ) : (
                  <>
                    <Forward className="w-4 h-4 mr-2" />
                    Forward to {selectedContacts.length || 0}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MessageForwardingSystem;
