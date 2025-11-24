import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Star, Loader2 } from 'lucide-react';
import { useServiceReviews } from '@/hooks/useServiceReviews';
import { ReviewSubmission } from '@/services/serviceReviewService';

interface ReviewSubmissionModalProps {
  serviceId: string;
  serviceLabel: string;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export const ReviewSubmissionModal: React.FC<ReviewSubmissionModalProps> = ({
  serviceId,
  serviceLabel,
  trigger,
  onSuccess,
}) => {
  const { toast } = useToast();
  const { userReview, isSubmitting, submitReview } = useServiceReviews(serviceId);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(userReview?.rating || 0);
  const [reviewText, setReviewText] = useState(userReview?.reviewText || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Please Rate',
        description: 'Please select a rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    const submission: ReviewSubmission = {
      serviceId,
      rating,
      reviewText: reviewText.trim() || undefined,
    };

    const success = await submitReview(submission);
    if (success) {
      toast({
        title: 'Success',
        description: 'Your review has been submitted',
      });
      setOpen(false);
      onSuccess?.();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to submit review',
        variant: 'destructive',
      });
    }
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : 'submit'}
        disabled={isSubmitting}
        onMouseEnter={() => interactive && setHoverRating(i + 1)}
        onMouseLeave={() => interactive && setHoverRating(0)}
        onClick={() => interactive && setRating(i + 1)}
        className={`transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : ''}`}
      >
        <Star
          className={`h-6 w-6 ${
            i < (interactive ? hoverRating || rating : count)
              ? 'text-yellow-400 fill-yellow-400'
              : 'text-gray-300'
          } transition-colors`}
        />
      </button>
    ));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            {userReview ? 'Edit Review' : 'Write Review'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {userReview ? 'Edit Your Review' : 'Write a Review'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Service Name */}
          <div>
            <p className="text-sm font-medium text-gray-700">{serviceLabel}</p>
          </div>

          {/* Rating */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Rating
            </label>
            <div className="flex gap-2">
              {renderStars(rating, true)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {rating > 0 && ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
            </p>
          </div>

          {/* Review Text */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Review (optional)
            </label>
            <Textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this service..."
              maxLength={500}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {reviewText.length}/500 characters
            </p>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-800">
              Your review helps other users make informed decisions about this service.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {userReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewSubmissionModal;
