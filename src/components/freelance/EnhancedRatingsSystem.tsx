// @ts-nocheck
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Star,
  StarHalf,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Calendar,
  TrendingUp,
  Award,
  Filter,
  SortAsc,
  Flag,
  Check,
  X,
  MoreHorizontal,
  ChevronDown,
  BarChart3,
  Users,
  Clock,
  Shield,
} from "lucide-react";

interface Review {
  id: string;
  projectId: string;
  projectTitle: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  reviewerType: "client" | "freelancer";
  revieweeId: string;
  revieweeName: string;
  rating: number;
  title: string;
  comment: string;
  skills: string[];
  categories: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
    value: number;
  };
  helpful: number;
  notHelpful: number;
  verified: boolean;
  featured: boolean;
  response?: {
    comment: string;
    timestamp: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  status: "published" | "pending" | "flagged" | "hidden";
  flags: ReviewFlag[];
}

interface ReviewFlag {
  id: string;
  reason: "inappropriate" | "fake" | "spam" | "offensive" | "off-topic";
  description: string;
  reporterId: string;
  timestamp: Date;
}

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { [key: number]: number };
  categoryAverages: {
    communication: number;
    quality: number;
    timeliness: number;
    professionalism: number;
    value: number;
  };
  recentTrend: "up" | "down" | "stable";
  verifiedPercentage: number;
}

const EnhancedRatingsSystem: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating_high" | "rating_low" | "helpful"
  >("newest");
  const [showOnlyVerified, setShowOnlyVerified] = useState(false);
  const [activeTab, setActiveTab] = useState("reviews");

  // Calculate stats whenever reviews change
  useEffect(() => {
    if (reviews.length > 0) {
      const published = reviews.filter((r) => r.status === "published");
      const totalReviews = published.length;
      const averageRating =
        published.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      published.forEach((r) => {
        ratingDistribution[r.rating]++;
      });

      const categoryAverages = {
        communication:
          published.reduce((sum, r) => sum + r.categories.communication, 0) /
          totalReviews,
        quality:
          published.reduce((sum, r) => sum + r.categories.quality, 0) /
          totalReviews,
        timeliness:
          published.reduce((sum, r) => sum + r.categories.timeliness, 0) /
          totalReviews,
        professionalism:
          published.reduce((sum, r) => sum + r.categories.professionalism, 0) /
          totalReviews,
        value:
          published.reduce((sum, r) => sum + r.categories.value, 0) /
          totalReviews,
      };

      const verifiedCount = published.filter((r) => r.verified).length;
      const verifiedPercentage = (verifiedCount / totalReviews) * 100;

      setStats({
        totalReviews,
        averageRating,
        ratingDistribution,
        categoryAverages,
        recentTrend: "stable", // This would be calculated based on recent reviews
        verifiedPercentage,
      });
    }
  }, [reviews]);

  const StarRating = ({
    rating,
    size = "sm",
    interactive = false,
    onChange,
  }: {
    rating: number;
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onChange?: (rating: number) => void;
  }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = (hoverRating || rating) >= star;
          const isHalf = !isFilled && (hoverRating || rating) >= star - 0.5;

          return (
            <button
              key={star}
              disabled={!interactive}
              className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
              onMouseEnter={() => interactive && setHoverRating(star)}
              onMouseLeave={() => interactive && setHoverRating(0)}
              onClick={() => interactive && onChange?.(star)}
            >
              {isFilled ? (
                <Star
                  className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
                />
              ) : isHalf ? (
                <StarHalf
                  className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`}
                />
              ) : (
                <Star className={`${sizeClasses[size]} text-gray-300`} />
              )}
            </button>
          );
        })}
        <span className="ml-2 text-sm font-medium">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const WriteReviewForm = () => {
    const [formData, setFormData] = useState({
      projectTitle: "",
      rating: 5,
      title: "",
      comment: "",
      categories: {
        communication: 5,
        quality: 5,
        timeliness: 5,
        professionalism: 5,
        value: 5,
      },
      skills: [] as string[],
      revieweeType: "freelancer" as "freelancer" | "client",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newReview: Review = {
        id: Date.now().toString(),
        projectId: "proj_" + Date.now(),
        projectTitle: formData.projectTitle,
        reviewerId: "current_user",
        reviewerName: "Current User",
        reviewerType:
          formData.revieweeType === "freelancer" ? "client" : "freelancer",
        revieweeId: "reviewee_" + Date.now(),
        revieweeName:
          formData.revieweeType === "freelancer"
            ? "John Developer"
            : "Jane Client",
        rating: formData.rating,
        title: formData.title,
        comment: formData.comment,
        skills: formData.skills,
        categories: formData.categories,
        helpful: 0,
        notHelpful: 0,
        verified: true,
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: "published",
        flags: [],
      };

      setReviews((prev) => [newReview, ...prev]);
      setShowWriteReview(false);

      // Reset form
      setFormData({
        projectTitle: "",
        rating: 5,
        title: "",
        comment: "",
        categories: {
          communication: 5,
          quality: 5,
          timeliness: 5,
          professionalism: 5,
          value: 5,
        },
        skills: [],
        revieweeType: "freelancer",
      });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="projectTitle">Project Title</Label>
            <Input
              id="projectTitle"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  projectTitle: e.target.value,
                }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="revieweeType">Reviewing</Label>
            <Select
              value={formData.revieweeType}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, revieweeType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freelancer">Freelancer</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label>Overall Rating</Label>
          <div className="mt-2">
            <StarRating
              rating={formData.rating}
              size="lg"
              interactive
              onChange={(rating) =>
                setFormData((prev) => ({ ...prev, rating }))
              }
            />
          </div>
        </div>

        <div>
          <Label>Category Ratings</Label>
          <div className="mt-3 space-y-4">
            {Object.entries(formData.categories).map(([category, rating]) => (
              <div key={category} className="flex items-center justify-between">
                <span className="text-sm font-medium capitalize">
                  {category}
                </span>
                <StarRating
                  rating={rating}
                  size="md"
                  interactive
                  onChange={(newRating) =>
                    setFormData((prev) => ({
                      ...prev,
                      categories: { ...prev.categories, [category]: newRating },
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="title">Review Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Summarize your experience..."
            required
          />
        </div>

        <div>
          <Label htmlFor="comment">Detailed Review</Label>
          <Textarea
            id="comment"
            value={formData.comment}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, comment: e.target.value }))
            }
            placeholder="Share your detailed experience..."
            rows={4}
            required
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowWriteReview(false)}
          >
            Cancel
          </Button>
          <Button type="submit">Submit Review</Button>
        </div>
      </form>
    );
  };

  const ReviewCard = ({ review }: { review: Review }) => {
    const [userVote, setUserVote] = useState<"helpful" | "not_helpful" | null>(
      null,
    );

    return (
      <Card className="mb-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={review.reviewerAvatar} />
              <AvatarFallback>{review.reviewerName.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{review.reviewerName}</h4>
                    {review.verified && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Shield className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                    {review.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{review.projectTitle}</p>
                </div>
                <div className="text-right">
                  <StarRating rating={review.rating} size="sm" />
                  <p className="text-xs text-gray-500 mt-1">
                    {review.createdAt.toLocaleDateString()}
                  </p>
                </div>
              </div>

              <h5 className="font-medium mb-2">{review.title}</h5>
              <p className="text-gray-700 mb-4">{review.comment}</p>

              <div className="grid grid-cols-5 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                {Object.entries(review.categories).map(([category, rating]) => (
                  <div key={category} className="text-center">
                    <p className="text-xs font-medium text-gray-600 mb-1 capitalize">
                      {category}
                    </p>
                    <div className="flex justify-center">
                      <StarRating rating={rating} size="sm" />
                    </div>
                  </div>
                ))}
              </div>

              {review.skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Skills mentioned:</p>
                  <div className="flex flex-wrap gap-1">
                    {review.skills.map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUserVote(userVote === "helpful" ? null : "helpful")
                      }
                      className={userVote === "helpful" ? "text-green-600" : ""}
                    >
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {review.helpful}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setUserVote(
                          userVote === "not_helpful" ? null : "not_helpful",
                        )
                      }
                      className={
                        userVote === "not_helpful" ? "text-red-600" : ""
                      }
                    >
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {review.notHelpful}
                    </Button>
                  </div>

                  <Button variant="ghost" size="sm">
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Reply
                  </Button>

                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4 mr-1" />
                    Report
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReview(review)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>

              {review.response && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {review.revieweeName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {review.revieweeName} responded
                    </span>
                    <span className="text-xs text-gray-500">
                      {review.response.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{review.response.comment}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const ReviewStats = ({ stats }: { stats: ReviewStats }) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="w-5 h-5" />
              Overall Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <div className="text-4xl font-bold text-yellow-600 mb-2">
                {stats.averageRating.toFixed(1)}
              </div>
              <StarRating rating={stats.averageRating} size="lg" />
              <p className="text-sm text-gray-600 mt-2">
                Based on {stats.totalReviews} reviews
              </p>
            </div>

            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center gap-2">
                  <span className="text-sm w-8">{rating}★</span>
                  <Progress
                    value={
                      (stats.ratingDistribution[rating] / stats.totalReviews) *
                      100
                    }
                    className="flex-1 h-2"
                  />
                  <span className="text-sm text-gray-600 w-8">
                    {stats.ratingDistribution[rating]}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5" />
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.categoryAverages).map(
                ([category, average]) => (
                  <div
                    key={category}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm font-medium capitalize">
                      {category}
                    </span>
                    <div className="flex items-center gap-2">
                      <StarRating rating={average} size="sm" />
                    </div>
                  </div>
                ),
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5" />
              Trust Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Verified Reviews</span>
              <span className="font-semibold">
                {stats.verifiedPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Reviews</span>
              <span className="font-semibold">{stats.totalReviews}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Recent Trend</span>
              <Badge
                className={
                  stats.recentTrend === "up"
                    ? "bg-green-100 text-green-800"
                    : stats.recentTrend === "down"
                      ? "bg-red-100 text-red-800"
                      : "bg-gray-100 text-gray-800"
                }
              >
                {stats.recentTrend === "up"
                  ? "↗ Improving"
                  : stats.recentTrend === "down"
                    ? "↘ Declining"
                    : "→ Stable"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const filteredAndSortedReviews = reviews
    .filter((review) => {
      if (filterRating && review.rating !== filterRating) return false;
      if (showOnlyVerified && !review.verified) return false;
      if (filterCategory !== "all" && !review.skills.includes(filterCategory))
        return false;
      return review.status === "published";
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt.getTime() - a.createdAt.getTime();
        case "oldest":
          return a.createdAt.getTime() - b.createdAt.getTime();
        case "rating_high":
          return b.rating - a.rating;
        case "rating_low":
          return a.rating - b.rating;
        case "helpful":
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Reviews & Ratings</h2>
          <p className="text-gray-600">
            Manage and analyze feedback from projects
          </p>
        </div>
        <Dialog open={showWriteReview} onOpenChange={setShowWriteReview}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Write Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <WriteReviewForm />
          </DialogContent>
        </Dialog>
      </div>

      {stats && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="stats">Analytics</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <ReviewStats stats={stats} />
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-50 p-4 rounded-lg">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Select
                    value={filterRating?.toString() || "all"}
                    onValueChange={(value) =>
                      setFilterRating(value === "all" ? null : parseInt(value))
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <SortAsc className="w-4 h-4" />
                  <Select
                    value={sortBy}
                    onValueChange={(value: any) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="oldest">Oldest</SelectItem>
                      <SelectItem value="rating_high">Highest Rated</SelectItem>
                      <SelectItem value="rating_low">Lowest Rated</SelectItem>
                      <SelectItem value="helpful">Most Helpful</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant={showOnlyVerified ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyVerified(!showOnlyVerified)}
                  className="flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  Verified Only
                </Button>
              </div>

              <div className="text-sm text-gray-600">
                Showing {filteredAndSortedReviews.length} of {reviews.length}{" "}
                reviews
              </div>
            </div>

            {filteredAndSortedReviews.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">
                    No reviews found matching your criteria
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {filteredAndSortedReviews.map((review) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Moderation Queue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Review moderation and flagged content management coming
                  soon...
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default EnhancedRatingsSystem;
