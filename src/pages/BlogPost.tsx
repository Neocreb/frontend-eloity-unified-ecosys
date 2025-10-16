import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Heart,
  Share2,
  BookmarkPlus,
  User,
  ChevronRight,
  Home,
} from "lucide-react";
import { BlogPost } from "@/types/blog";
import { blogService } from "@/services/blogService";
import { cn } from "@/lib/utils";

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlogPost(slug);
    }
  }, [slug]);

  const loadBlogPost = async (postSlug: string) => {
    setIsLoading(true);
    try {
      const [postData, postsResponse] = await Promise.all([
        blogService.getBlogPost(postSlug),
        blogService.getBlogPosts({}),
      ]);

      if (postData) {
        setPost(postData);

        // Get related posts from same category
        const allPosts = postsResponse.posts || [];
        const related = allPosts
          .filter(
            (p) =>
              p.id !== postData.id && p.category.id === postData.category.id,
          )
          .slice(0, 3);
        setRelatedPosts(related);
      }
    } catch (error) {
      console.error("Error loading blog post:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatReadingTime = (minutes: number) => {
    return `${minutes} min read`;
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    // In a real app, this would update the server
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would update the server
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.excerpt,
        url: window.location.href,
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Post not found
          </h1>
          <p className="text-gray-600 mb-6">
            The blog post you're looking for doesn't exist.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
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
                className="flex items-center gap-2 text-lg font-bold text-eloity-700 hover:text-eloity-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                Eloity
              </Link>
              <span className="text-gray-300">|</span>
              <Link
                to="/blog"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Blog
              </Link>
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
                <Link to="/blog" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Blog
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/blog" className="hover:text-blue-600">
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={`/blog?category=${post.category.slug}`}
              className="hover:text-blue-600"
            >
              {post.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900 truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>

          {/* Article Header */}
          <header className="mb-8">
            {/* Category and Difficulty */}
            <div className="flex items-center gap-2 mb-4">
              <Badge className={cn("text-white", post.category.color)}>
                {post.category.name}
              </Badge>
              {post.difficulty && (
                <Badge className={getDifficultyColor(post.difficulty)}>
                  {post.difficulty}
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 mb-6">{post.excerpt}</p>

            {/* Author and Meta */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post.author.name}
                  </h3>
                  {post.author.bio && (
                    <p className="text-sm text-gray-600">{post.author.bio}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatReadingTime(post.readingTime)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  <span>{post.views}</span>
                </div>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-sm"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mb-8 p-4 bg-white rounded-lg border">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
              {post.likes + (isLiked ? 1 : 0)}
            </Button>

            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
            >
              <BookmarkPlus
                className={cn("h-4 w-4", isBookmarked && "fill-current")}
              />
            </Button>

            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Article Content */}
          <article className="prose prose-lg max-w-none mb-8">
            <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border">
              {/* Convert markdown-style content to HTML-like structure */}
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/\n/g, "<br>")
                    .replace(
                      /# (.*)/g,
                      '<h1 class="text-2xl font-bold mb-4 mt-6">$1</h1>',
                    )
                    .replace(
                      /## (.*)/g,
                      '<h2 class="text-xl font-bold mb-3 mt-5">$1</h2>',
                    )
                    .replace(
                      /### (.*)/g,
                      '<h3 class="text-lg font-bold mb-2 mt-4">$1</h3>',
                    )
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/\*(.*?)\*/g, "<em>$1</em>"),
                }}
              />
            </div>
          </article>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/* Related Assets */}
          {post.relatedAssets && post.relatedAssets.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Related Assets</h3>
              <div className="flex flex-wrap gap-2">
                {post.relatedAssets.map((asset) => (
                  <Badge key={asset} className="bg-blue-100 text-blue-800">
                    {asset}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator className="my-8" />

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    {relatedPost.featuredImage && (
                      <div className="h-32 relative">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover rounded-t-lg"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <Badge
                        className={cn(
                          "text-white w-fit",
                          relatedPost.category.color,
                        )}
                      >
                        {relatedPost.category.name}
                      </Badge>
                      <CardTitle className="text-lg line-clamp-2">
                        <Link
                          to={`/blog/${relatedPost.slug}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {relatedPost.title}
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{formatDate(relatedPost.publishedAt)}</span>
                        <span>
                          {formatReadingTime(relatedPost.readingTime)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
