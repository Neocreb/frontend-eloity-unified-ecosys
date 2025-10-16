// @ts-nocheck
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Zap,
  Camera,
  Image,
  Plus,
  Send,
  Bookmark,
  Heart,
  Share,
  MessageCircle,
  Users,
  Sparkles,
  Crown,
  TrendingUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useUserCollections } from "@/contexts/UserCollectionsContext";
import { MemeStickerPicker } from "@/components/chat/MemeStickerPicker";
import { EnhancedMessage, EnhancedChatMessage } from "@/components/chat/EnhancedMessage";
import { WhatsAppChatInput } from "@/components/chat/WhatsAppChatInput";
import { CollectionStatusBadge } from "@/components/chat/CollectionStatusBadge";
import { StickerData } from "@/types/sticker";
import { format } from "date-fns";

const MemeGifDemo: React.FC = () => {
  const { toast } = useToast();
  const { collections, saveToCollection, removeFromCollection } = useUserCollections();
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([
    {
      id: "1",
      senderId: "demo_user",
      senderName: "Demo User",
      senderAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face",
      content: "Hey! Check out this cool meme functionality 🎨",
      type: "text",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      status: "read",
    },
    {
      id: "2",
      senderId: "current_user",
      senderName: "You",
      content: "That's awesome! Let me try creating some memes and GIFs 🚀",
      type: "text",
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: "sent",
    },
  ]);
  const [messageInput, setMessageInput] = useState("");
  const [activeTab, setActiveTab] = useState("demo");

  const handleSendMessage = (
    type: "text" | "voice" | "sticker" | "media",
    content: string,
    metadata?: any
  ) => {
    const newMessage: EnhancedChatMessage = {
      id: Date.now().toString(),
      senderId: "current_user",
      senderName: "You",
      content,
      type,
      timestamp: new Date().toISOString(),
      status: "sent",
      metadata,
    };

    setMessages(prev => [...prev, newMessage]);

    if (type === "text") {
      setMessageInput("");
    }

    toast({
      title: "Message sent!",
      description: `Your ${type} message has been sent`,
    });
  };

  const handleStickerSelect = (sticker: StickerData) => {
    handleSendMessage("sticker", sticker.fileUrl, {
      stickerName: sticker.name,
      stickerUrl: sticker.fileUrl,
      stickerType: sticker.type,
      animated: sticker.animated,
      ...sticker.metadata,
    });
    setShowStickerPicker(false);
  };

  const handleMediaSaved = (mediaId: string, collection: "memes" | "gifs" | "stickers") => {
    toast({
      title: "Media saved!",
      description: `Your ${collection.slice(0, -1)} has been saved to your collection`,
    });
  };

  const handleSaveToCollection = (mediaId: string, collection: "memes" | "gifs" | "stickers") => {
    // This would normally save to collection via API
    toast({
      title: "Saved to collection",
      description: `Media added to your ${collection}`,
    });
  };

  const handleRemoveFromCollection = (mediaId: string, collection: "memes" | "gifs" | "stickers") => {
    // This would normally remove from collection via API
    toast({
      title: "Removed from collection",
      description: `Media removed from your ${collection}`,
    });
  };

  const handleReportMedia = (mediaId: string, reason: string) => {
    toast({
      title: "Media reported",
      description: "Thank you for helping keep our community safe",
    });
  };

  const stats = {
    totalItems: collections.memes.length + collections.gifs.length + collections.stickers.length,
    memes: collections.memes.length,
    gifs: collections.gifs.length,
    stickers: collections.stickers.length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white">
              <Sparkles className="w-8 h-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Meme & GIF Creator
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create, save, and share your custom memes and GIFs! Now with collections and WhatsApp-like interactions.
          </p>
          
          {/* Collection Status */}
          <div className="mt-6">
            <CollectionStatusBadge className="justify-center" />
          </div>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-purple-200 dark:border-purple-800">
            <CardHeader className="text-center">
              <div className="p-3 bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900 dark:to-orange-900 rounded-lg w-fit mx-auto mb-2">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle className="text-lg">Create Memes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Upload images and add custom text to create hilarious memes
              </p>
              <div className="mt-4 text-center">
                <Badge variant="secondary">{stats.memes} saved</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader className="text-center">
              <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg w-fit mx-auto mb-2">
                <Camera className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle className="text-lg">Animated GIFs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Convert videos to animated stickers and GIFs
              </p>
              <div className="mt-4 text-center">
                <Badge variant="secondary">{stats.gifs} saved</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800">
            <CardHeader className="text-center">
              <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 rounded-lg w-fit mx-auto mb-2">
                <Image className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-lg">Photo Stickers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">
                Capture photos and turn them into custom stickers
              </p>
              <div className="mt-4 text-center">
                <Badge variant="secondary">{stats.stickers} saved</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Demo Area */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="collections">My Collections</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          {/* Live Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Interactive Chat Demo
                </CardTitle>
                <CardDescription>
                  Try creating memes and GIFs, then interact with them like in WhatsApp!
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Chat Messages */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <EnhancedMessage
                        key={message.id}
                        message={message}
                        isCurrentUser={message.senderId === "current_user"}
                        userCollections={collections}
                        onSaveToCollection={handleSaveToCollection}
                        onRemoveFromCollection={handleRemoveFromCollection}
                        onSendMessage={handleSendMessage}
                        onReportMedia={handleReportMedia}
                        currentUserId="current_user"
                      />
                    ))}
                  </div>
                </div>

                {/* Chat Input */}
                <WhatsAppChatInput
                  messageInput={messageInput}
                  setMessageInput={setMessageInput}
                  onSendMessage={handleSendMessage}
                  onMediaSaved={handleMediaSaved}
                  onSaveToCollection={handleSaveToCollection}
                  onRemoveFromCollection={handleRemoveFromCollection}
                  onReportMedia={handleReportMedia}
                  currentUserId="current_user"
                />

                {/* Create Content Button */}
                <div className="mt-4 flex justify-center">
                  <Dialog open={showStickerPicker} onOpenChange={setShowStickerPicker}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Memes & GIFs
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md p-0">
                      <MemeStickerPicker
                        onStickerSelect={handleStickerSelect}
                        onClose={() => setShowStickerPicker(false)}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Memes Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-600" />
                    My Memes ({collections.memes.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collections.memes.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {collections.memes.slice(0, 4).map((meme) => (
                        <img
                          key={meme.id}
                          src={meme.thumbnailUrl || meme.fileUrl}
                          alt={meme.name}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm">
                      No memes yet. Create your first meme!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* GIFs Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-purple-600" />
                    My GIFs ({collections.gifs.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collections.gifs.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {collections.gifs.slice(0, 4).map((gif) => (
                        <img
                          key={gif.id}
                          src={gif.thumbnailUrl || gif.fileUrl}
                          alt={gif.name}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm">
                      No GIFs yet. Create your first animated GIF!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Stickers Collection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="w-5 h-5 text-blue-600" />
                    My Stickers ({collections.stickers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {collections.stickers.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {collections.stickers.slice(0, 4).map((sticker) => (
                        <img
                          key={sticker.id}
                          src={sticker.thumbnailUrl || sticker.fileUrl}
                          alt={sticker.name}
                          className="w-full h-20 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground text-sm">
                      No stickers yet. Take your first photo sticker!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="w-5 h-5 text-green-600" />
                    Collection System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Save memes/GIFs to collections first</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Organize by type (memes, GIFs, stickers)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Persistent storage across sessions</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    WhatsApp-like Interactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Click memes/GIFs for options</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Save/remove from collections</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm">Report inappropriate content</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Creation Tools
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Custom meme text overlay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Video to GIF conversion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">Camera integration</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="w-5 h-5 text-yellow-600" />
                    Premium Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">AI-powered meme generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Advanced editing tools</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Unlimited storage</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto border-2 border-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800">
            <CardContent className="p-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <h3 className="text-2xl font-bold">Ready to Get Creative?</h3>
              </div>
              <p className="text-muted-foreground mb-6">
                Start creating amazing memes and GIFs today! Your content is automatically saved to your personal collection.
              </p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                onClick={() => setShowStickerPicker(true)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Start Creating Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MemeGifDemo;
