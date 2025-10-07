// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Star,
  MessageCircle,
  Clock,
  Trophy,
  ThumbsUp,
  User,
  DollarSign,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Project, Rating } from "@/types/freelance";
import { useToast } from "@/hooks/use-toast";

interface ReviewFormProps {
  project: Project;
  userRole: "client" | "freelancer";
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewSubmission) => void;
}

interface ReviewSubmission {
  projectId: string;
  overallRating: number;
  communicationRating: number;
  qualityRating: number;
  timelineRating: number;
  comment: string;
  isClientReview: boolean;
  wouldWorkAgain: boolean;
  tags: string[];
}

const RATING_CATEGORIES = [
  {
    key: "overall" as const,
    label: "Overall Experience",
    description: "Rate your overall satisfaction with this project",
    icon: Trophy,
  },
  {
    key: "communication" as const,
    label: "Communication",
    description: "How well did they communicate throughout the project?",
    icon: MessageCircle,
  },
  {
    key: "quality" as const,
    label: "Quality of Work",
    description: "Rate the quality of deliverables and work produced",
    icon: CheckCircle2,
  },
  {
    key: "timeline" as const,
    label: "Timeline & Deadlines",
    description: "How well did they meet deadlines and project timeline?",
    icon: Clock,
  },
];

const POSITIVE_TAGS = {
  client: [
    "Clear communication",
    "Quick responses",
    "Good project scope",
    "Fair payment",
    "Professional",
    "Flexible",
    "Great to work with",
  ],
  freelancer: [
    "High quality work",
    "Met deadlines",
    "Great communication",
    "Professional",
    "Creative solutions",
    "Attention to detail",
    "Would hire again",
  ],
};

export const ReviewForm: React.FC<ReviewFormProps> = ({
  project,
  userRole,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [ratings, setRatings] = useState({
    overall: 0,
    communication: 0,
    quality: 0,
    timeline: 0,
  });
  const [comment, setComment] = useState("");
  const [wouldWorkAgain, setWouldWorkAgain] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const revieweeRole = userRole === "client" ? "freelancer" : "client";
  const reviewee = userRole === "client" ? project.freelancer : project.client;
  const availableTags =
    POSITIVE_TAGS[revieweeRole as keyof typeof POSITIVE_TAGS];

  const handleRatingChange = (
    category: keyof typeof ratings,
    value: number,
  ) => {
    setRatings((prev) => ({ ...prev, [category]: value }));
  };

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const isFormValid = () => {
    return (
      ratings.overall > 0 &&
      ratings.communication > 0 &&
      ratings.quality > 0 &&
      ratings.timeline > 0 &&
      comment.trim().length > 0 &&
      wouldWorkAgain !== null
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      toast({
        title: "Please complete all fields",
        description: "All ratings and a comment are required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const review: ReviewSubmission = {
        projectId: project.id,
        overallRating: ratings.overall,
        communicationRating: ratings.communication,
        qualityRating: ratings.quality,
        timelineRating: ratings.timeline,
        comment: comment.trim(),
        isClientReview: userRole === "client",
        wouldWorkAgain: wouldWorkAgain!,
        tags: selectedTags,
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onSubmit(review);

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{
    value: number;
    onChange: (value: number) => void;
    size?: "sm" | "md" | "lg";
  }> = ({ value, onChange, size = "md" }) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`${sizeClasses[size]} transition-colors hover:scale-110`}
          >
            <Star
              className={`w-full h-full ${
                star <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-400"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Review {revieweeRole === "freelancer" ? "Freelancer" : "Client"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Project Summary */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={reviewee.avatar} />
                  <AvatarFallback>{reviewee.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{reviewee.name}</h3>
                  <p className="text-muted-foreground mb-2">
                    {project.job.title}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      <span>${project.budget.agreed.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {Math.ceil(
                          (new Date(project.endDate || new Date()).getTime() -
                            new Date(project.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </span>
                    </div>
                    <Badge variant="outline" className="text-green-600">
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Rate Your Experience</h3>
            {RATING_CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.key}>
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium">{category.label}</h4>
                            <p className="text-sm text-muted-foreground">
                              {category.description}
                            </p>
                          </div>
                          <StarRating
                            value={ratings[category.key]}
                            onChange={(value) =>
                              handleRatingChange(category.key, value)
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Separator />

          {/* Written Review */}
          <div className="space-y-2">
            <Label htmlFor="comment">
              Written Review *
              <span className="text-sm text-muted-foreground ml-2">
                Share details about your experience
              </span>
            </Label>
            <Textarea
              id="comment"
              placeholder={`Tell others about your experience working with ${reviewee.name}. What went well? What could be improved?`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              {comment.length}/1000 characters
            </div>
          </div>

          <Separator />

          {/* Tags */}
          <div className="space-y-3">
            <Label>Quick Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                    selectedTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Would Work Again */}
          <div className="space-y-3">
            <Label>Would you work with {reviewee.name} again? *</Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setWouldWorkAgain(true)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  wouldWorkAgain === true
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                Yes, definitely
              </button>
              <button
                type="button"
                onClick={() => setWouldWorkAgain(false)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  wouldWorkAgain === false
                    ? "bg-red-50 border-red-200 text-red-700"
                    : "bg-background hover:bg-muted border-border"
                }`}
              >
                <User className="w-4 h-4" />
                No, not likely
              </button>
            </div>
          </div>

          {/* Review Preview */}
          {ratings.overall > 0 && (
            <Card className="bg-muted/50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Overall Rating</span>
                  <div className="flex items-center gap-2">
                    <StarRating
                      value={ratings.overall}
                      onChange={() => {}}
                      size="sm"
                    />
                    <span className="text-sm font-medium">
                      {ratings.overall}.0
                    </span>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  This review will be public and help other{" "}
                  {revieweeRole === "freelancer" ? "clients" : "freelancers"}{" "}
                  make informed decisions.
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Reviews are public and cannot be edited after submission
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid() || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewForm;
