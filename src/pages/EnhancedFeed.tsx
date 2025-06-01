import { useState, useEffect, useCallback, useRef } from "react";
import CreatePostCard from "@/components/feed/CreatePostCard";
import EnhancedPostCard from "@/components/feed/EnhancedPostCard";
import FooterNav from "@/components/layout/FooterNav";
import { useNotification } from "@/hooks/use-notification";
import Stories, { Story } from "@/components/feed/Stories";
import StoryView from "@/components/feed/StoryView";
import CommentSection from "@/components/feed/CommentSection";
import FeedSkeleton from "@/components/feed/FeedSkeleton";
import PollCard from "@/components/feed/PollCard";
import ForYouFeed from "@/components/feed/ForYouFeed";
import { useFeed } from "@/hooks/use-feed";
import { mockStories } from "@/data/mockFeedData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, UserPlus, Video, MapPin, Smile, X, BarChart3 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui/input";

const EnhancedFeed = () => {
  const [activeStory, setActiveStory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("following");
  const {
    posts,
    isLoading,
    postComments,
    handleCreatePost,
    handleAddComment,
    loadMorePosts,
    hasMore
  } = useFeed();
  const notification = useNotification();
  const { user } = useAuth();
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [location, setLocation] = useState<string | null>(null);
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [showUserSuggestions, setShowUserSuggestions] = useState(false);
  const [suggestedUsers, setSuggestedUsers] = useState<string[]>([]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showPoll, setShowPoll] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Mock user data - replace with actual user search
  const users = [
    { id: "1", username: "johndoe", name: "John Doe" },
    { id: "2", username: "janedoe", name: "Jane Doe" },
    { id: "3", username: "alice", name: "Alice Smith" },
  ];

  // Mock poll data
  const [mockPoll, setMockPoll] = useState({
    question: "What's your favorite crypto trading strategy?",
    options: [
      { id: "1", text: "HODLing for long term", votes: 45 },
      { id: "2", text: "Day trading", votes: 32 },
      { id: "3", text: "DCA (Dollar Cost Averaging)", votes: 67 },
      { id: "4", text: "Swing trading", votes: 23 }
    ],
    totalVotes: 167,
    hasVoted: false
  });

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const firstEntry = entries[0];
        if (firstEntry.isIntersecting && hasMore && !isLoading) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, isLoading, loadMorePosts]);

  const handleViewStory = (storyId: string) => {
    setActiveStory(storyId);
    setTimeout(() => {
      setActiveStory(null);
    }, 5000);
  };

  const handleCreateStory = () => {
    notification.info("Story creation coming soon!");
  };

  const handlePollVote = (optionId: string) => {
    setMockPoll(prev => ({
      ...prev,
      hasVoted: true,
      options: prev.options.map(opt => 
        opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
      ),
      totalVotes: prev.totalVotes + 1
    }));
    notification.success("Vote recorded!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPostContent(value);

    // Detect @ mentions
    if (value.includes("@")) {
      const lastAtPos = value.lastIndexOf("@");
      const searchTerm = value.substring(lastAtPos + 1).split(/\s/)[0];

      if (searchTerm) {
        setShowUserSuggestions(true);
        setSuggestedUsers(
          users
            .filter(user =>
              user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
              user.name.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map(user => user.username)
        );
      } else {
        setShowUserSuggestions(false);
      }
    } else {
      setShowUserSuggestions(false);
    }
  };

  const handleTagUser = (username: string) => {
    const content = postContent;
    const lastAtPos = content.lastIndexOf("@");
    const newContent = content.substring(0, lastAtPos) + username + " ";

    setPostContent(newContent);
    setTaggedUsers([...taggedUsers, username]);
    setShowUserSuggestions(false);

    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleAddLocation = () => {
    notification.info("Location addition coming soon!");
  };

  const handleRemoveLocation = () => {
    setLocation(null);
  };

  const handleRemoveTag = (username: string) => {
    setTaggedUsers(taggedUsers.filter(u => u !== username));
    setPostContent(postContent.replace(`@${username}`, ""));
  };

  const handlePostSubmit = async () => {
    if (!postContent.trim() && !selectedFile && !showPoll) return;

    setIsPosting(true);
    try {
      await handleCreatePost({
        content: postContent,
        mediaUrl: previewUrl || undefined,
        location,
        taggedUsers,
        poll: showPoll ? { question: pollQuestion, options: pollOptions } : undefined
      });
      setPostContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
      setLocation(null);
      setTaggedUsers([]);
      setShowPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      notification.success("Post created successfully");
    } catch (error) {
      notification.error("Failed to create post");
    } finally {
      setIsPosting(false);
    }
  };

  const handleVideoUpload = () => {
    notification.info("Video upload coming soon!");
  };

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      const newOptions = pollOptions.filter((_, i) => i !== index);
      setPollOptions(newOptions);
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-5xl mx-auto px-4 py-6 pb-20 md:pb-6">
        <Stories
          stories={mockStories}
          onViewStory={handleViewStory}
          onCreateStory={handleCreateStory}
        />

        {activeStory && (
          <StoryView
            activeStory={activeStory}
            stories={mockStories}
            onClose={() => setActiveStory(null)}
          />
        )}

        {/* Sample Poll */}
        <PollCard
          question={mockPoll.question}
          options={mockPoll.options}
          totalVotes={mockPoll.totalVotes}
          hasVoted={mockPoll.hasVoted}
          onVote={handlePollVote}
        />

        {/* Create Post Box with Tabs */}
        <div className="bg-background rounded-lg shadow mb-6 overflow-hidden">
          <Tabs defaultValue="post" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="post" className="flex items-center gap-2">
                <Image className="h-4 w-4" />
                <span>Post</span>
              </TabsTrigger>
              <TabsTrigger value="poll" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span>Poll</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center gap-2">
                <Video className="h-4 w-4" />
                <span>Video</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="post" className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Textarea
                  ref={textareaRef}
                  placeholder="What's on your mind?"
                  className="flex-1 resize-none"
                  value={postContent}
                  onChange={handleTextChange}
                />
              </div>

              {/* User suggestions dropdown */}
              {showUserSuggestions && suggestedUsers.length > 0 && (
                <div className="border rounded-lg bg-popover shadow-lg z-10 max-h-60 overflow-auto">
                  {suggestedUsers.map(username => (
                    <div
                      key={username}
                      className="p-2 hover:bg-accent cursor-pointer"
                      onClick={() => handleTagUser(username)}
                    >
                      @{username}
                    </div>
                  ))}
                </div>
              )}

              {previewUrl && (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg max-h-80 object-cover"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 rounded-full"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Display tagged users and location */}
              <div className="flex flex-wrap gap-2">
                {taggedUsers.map(username => (
                  <div
                    key={username}
                    className="flex items-center gap-1 bg-accent px-2 py-1 rounded-full text-sm"
                  >
                    @{username}
                    <button
                      onClick={() => handleRemoveTag(username)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {location && (
                  <div className="flex items-center gap-1 bg-accent px-2 py-1 rounded-full text-sm">
                    <MapPin className="h-3 w-3" />
                    {location}
                    <button
                      onClick={handleRemoveLocation}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <Image className="h-5 w-5" />
                    <span>Photo</span>
                  </Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={() => {
                      setPostContent(postContent + "@");
                      if (textareaRef.current) {
                        textareaRef.current.focus();
                      }
                    }}
                  >
                    <UserPlus className="h-5 w-5" />
                    <span>Tag</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={handleAddLocation}
                  >
                    <MapPin className="h-5 w-5" />
                    <span>Location</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1 text-muted-foreground"
                    onClick={() => notification.info("This feature is coming soon!")}
                  >
                    <Smile className="h-5 w-5" />
                    <span>Feeling</span>
                  </Button>
                </div>

                <Button
                  onClick={handlePostSubmit}
                  disabled={isPosting || (!postContent.trim() && !selectedFile)}
                >
                  {isPosting ? "Posting..." : "Post"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="poll" className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="Ask a question..."
                  value={pollQuestion}
                  onChange={(e) => setPollQuestion(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removePollOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {pollOptions.length < 4 && (
                  <Button variant="outline" onClick={addPollOption} className="w-full">
                    Add Option
                  </Button>
                )}
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => {
                    setShowPoll(true);
                    handlePostSubmit();
                  }}
                  disabled={!pollQuestion.trim() || pollOptions.filter(opt => opt.trim()).length < 2}
                >
                  Create Poll
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="video" className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.name || "User"} />
                  <AvatarFallback>{user?.name?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <Textarea
                  placeholder="Add a description for your video..."
                  className="flex-1 resize-none"
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                />
              </div>

              <div
                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50"
                onClick={handleVideoUpload}
              >
                <Video className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground text-center">Click to upload a video</p>
                <p className="text-xs text-muted-foreground mt-1">MP4 or WebM format</p>
              </div>

              <div className="flex justify-end mt-4">
                <Button onClick={handleVideoUpload}>Upload Video</Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Feed Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="foryou">For You</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="space-y-6">
            {isLoading && posts.length === 0 ? (
              <FeedSkeleton />
            ) : (
              <>
                {posts.map((post) => (
                  <div key={post.id} className="space-y-2">
                    <EnhancedPostCard post={post} />
                    <CommentSection
                      postId={post.id}
                      comments={postComments[post.id] || []}
                      onAddComment={handleAddComment}
                    />
                  </div>
                ))}

                {/* Infinite scroll loader */}
                <div ref={loaderRef} className="flex justify-center py-4">
                  {isLoading && posts.length > 0 ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  ) : hasMore ? (
                    <p className="text-muted-foreground text-sm">Scroll to load more</p>
                  ) : (
                    <p className="text-muted-foreground text-sm">No more posts to load</p>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="foryou">
            <ForYouFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedFeed;
