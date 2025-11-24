import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useServiceReviews } from '@/hooks/useServiceReviews';
import { Star, ThumbsUp, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface ReviewsListProps {
  serviceId: string;
  limit?: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({
  serviceId,
  limit = 5,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { reviews, isLoading, markHelpful, deleteReview, loadReviews } = useServiceReviews();

  useEffect(() => {
    loadReviews(serviceId);
  }, [serviceId, loadReviews]);

  const handleMarkHelpful = async (reviewId: string) => {
    const success = await markHelpful(reviewId);
    if (success) {
      toast({
        title: 'Thanks!',
        description: 'Your feedback helps us improve',
      });
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    const success = await deleteReview(reviewId);
    if (success) {
      toast({
        title: 'Deleted',
        description: 'Review removed',
      });
    }
  };

  const displayReviews = reviews.slice(0, limit);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600 font-medium">No reviews yet</p>
          <p className="text-sm text-gray-500 mt-1">Be the first to review this service</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Reviews ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayReviews.map(review => (
            <div key={review.id} className="pb-4 border-b last:border-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div>
                  {/* Rating */}
                  <div className="flex gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>

                {/* Delete Button (if user's review) */}
                {user?.id === review.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteReview(review.id)}
                    className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Review Text */}
              {review.reviewText && (
                <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                  {review.reviewText}
                </p>
              )}

              {/* Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMarkHelpful(review.id)}
                className="h-8 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1" />
                Helpful ({review.isHelpful})
              </Button>
            </div>
          ))}
        </div>

        {reviews.length > limit && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-4"
          >
            View All {reviews.length} Reviews
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ReviewsList;
