import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Clock,
  Eye,
  Heart,
  Calendar,
  User,
  TrendingUp,
  BookOpen,
  Filter,
  Grid3X3,
  List,
  ArrowLeft,
  Home,
  AlertTriangle,
} from "lucide-react";
import { BlogPost, BlogCategory, BlogStats } from "@/types/blog";
import { blogService } from "@/services/blogService";
import { SmartContentRecommendations } from "@/components/ai/SmartContentRecommendations";
import ErrorBoundary from "@/components/ui/error-boundary";
import { cn } from "@/lib/utils";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [stats, setStats] = useState<BlogStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBlogData();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedCategory, selectedDifficulty]);

  const loadBlogData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [postsResponse, categoriesData, statsData] = await Promise.all([
        blogService.getBlogPosts({}),
        blogService.getCategories(),
        blogService.getBlogStats(),
      ]);

      setPosts(postsResponse.posts || []);
      setCategories(categoriesData);
      setStats(statsData);
    } catch (error) {
      console.error("Error loading blog data:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load blog data",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filterPosts = async () => {
    try {
      let filtered = [...posts];

      // Search filter
      if (searchQuery.trim()) {
        const searchResults = await blogService.searchPosts(searchQuery);
        filtered = searchResults;
      }

      // Category filter
      if (selectedCategory !== "all") {
        filtered = filtered.filter(
          (post) => post.category && post.category.slug === selectedCategory,
        );
      }

      // Difficulty filter
      if (selectedDifficulty !== "all") {
        filtered = filtered.filter(
          (post) => post.difficulty === selectedDifficulty,
        );
      }

      setFilteredPosts(filtered);
    } catch (error) {
      console.error("Error filtering posts:", error);
      // Fallback to show all posts if filtering fails
      setFilteredPosts(posts);
    }
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "BEGINNER":
        return "bg-green-100 text-green-800";
      case "INTERMEDIATE":
        return "bg-yellow-100 text-yellow-800";
      case "ADVANCED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Blog
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadBlogData}>Try Again</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Back to Landing */}
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="flex items-center gap-2 text-lg font-bold text-blue-700 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                Eloity
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-600 font-medium">Blog</span>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/#features"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Features
              </Link>
              <Link
                to="/#why-eloity"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Why Eloity
              </Link>
              <Link to="/blog" className="text-blue-600 font-medium">
                Blog
              </Link>
              <Link
                to="/#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                Newsletter
              </Link>
              <Button asChild>
                <Link to="/auth">Launch App</Link>
              </Button>
            </nav>

            {/* Mobile Back Button */}
            <div className="md:hidden">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Eloity Blog
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Stay informed with the latest insights on cryptocurrency, trading,
              and blockchain technology
            </p>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {stats.totalPosts}
                  </div>
                  <div className="text-blue-200">Articles</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {stats.totalViews.toLocaleString()}
                  </div>
                  <div className="text-blue-200">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {stats.totalLikes}
                  </div>
                  <div className="text-blue-200">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl md:text-3xl font-bold">
                    {stats.totalComments}
                  </div>
                  <div className="text-blue-200">Comments</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Difficulty Filter */}
            <Select
              value={selectedDifficulty}
              onValueChange={setSelectedDifficulty}
            >
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredPosts.length} article
            {filteredPosts.length !== 1 ? "s" : ""}
            {searchQuery && ` for "${searchQuery}"`}
          </p>
        </div>

        {/* Featured Articles */}
        {posts.length > 0 && (
          <ErrorBoundary
            fallback={
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                    Featured Articles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {posts.slice(0, 3).map((post) => (
                      <Card
                        key={post.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() =>
                          (window.location.href = `/blog/${post.slug}`)
                        }
                      >
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                            {post.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{post.author?.name}</span>
                            <span>{post.readingTime} min read</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            }
          >
            <SmartContentRecommendations
              contentType="blogs"
              availableContent={posts}
              onContentSelect={(post) => {
                try {
                  // Navigate to the selected post
                  window.location.href = `/blog/${post.slug}`;
                } catch (error) {
                  console.error("Error navigating to post:", error);
                }
              }}
              maxItems={4}
              className="mb-8"
              layout="grid"
              showReasons={true}
            />
          </ErrorBoundary>
        )}

        {/* Blog Posts */}
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No articles found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div
            className={cn(
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "space-y-6",
            )}
          >
            {filteredPosts.map((post) => (
              <Card
                key={post.id}
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-shadow",
                  viewMode === "list" && "md:flex",
                )}
              >
                {/* Featured Image */}
                {post.featuredImage && (
                  <div
                    className={cn(
                      "relative",
                      viewMode === "grid"
                        ? "h-48"
                        : "md:w-64 md:flex-shrink-0 h-48 md:h-auto",
                    )}
                  >
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                    {post.difficulty && (
                      <Badge
                        className={cn(
                          "absolute top-2 right-2",
                          getDifficultyColor(post.difficulty),
                        )}
                      >
                        {post.difficulty}
                      </Badge>
                    )}
                  </div>
                )}

                <div className={cn(viewMode === "list" && "flex-1")}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      {post.category && (
                        <Badge
                          className={cn("text-white", post.category.color)}
                        >
                          {post.category.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {formatDate(post.publishedAt)}
                      </span>
                    </div>

                    <CardTitle className="line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {post.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{post.tags.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Author and Stats */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        {post.author?.avatar && (
                          <img
                            src={post.author.avatar}
                            alt={post.author?.name || "Author"}
                            className="w-6 h-6 rounded-full"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                        <span>{post.author?.name || "Unknown Author"}</span>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatReadingTime(post.readingTime)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          <span>{post.likes}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
