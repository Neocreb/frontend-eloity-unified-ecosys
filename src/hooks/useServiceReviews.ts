import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  serviceReviewService,
  ServiceReview,
  ServiceRatingSummary,
  ReviewSubmission,
} from '@/services/serviceReviewService';

interface UseServiceReviewsReturn {
  reviews: ServiceReview[];
  userReview: ServiceReview | null;
  ratingSummary: ServiceRatingSummary | null;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  submitReview: (submission: ReviewSubmission) => Promise<boolean>;
  markHelpful: (reviewId: string) => Promise<boolean>;
  deleteReview: (reviewId: string) => Promise<boolean>;
  loadReviews: (serviceId: string) => Promise<void>;
  loadRatingSummary: (serviceId: string) => Promise<void>;
}

export const useServiceReviews = (initialServiceId?: string): UseServiceReviewsReturn => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [userReview, setUserReview] = useState<ServiceReview | null>(null);
  const [ratingSummary, setRatingSummary] = useState<ServiceRatingSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = useCallback(async (serviceId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await serviceReviewService.getServiceReviews(serviceId);
      setReviews(data);

      if (user?.id) {
        const userRev = await serviceReviewService.getUserReview(serviceId, user.id);
        setUserReview(userRev);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
      console.error('Error loading reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const loadRatingSummary = useCallback(async (serviceId: string) => {
    try {
      const summary = await serviceReviewService.getServiceRatingSummary(serviceId);
      setRatingSummary(summary);
    } catch (err) {
      console.error('Error loading rating summary:', err);
    }
  }, []);

  const submitReview = useCallback(async (submission: ReviewSubmission): Promise<boolean> => {
    if (!user?.id) {
      setError('User not authenticated');
      return false;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const result = await serviceReviewService.submitReview(user.id, submission);

      if (result) {
        setUserReview(result);
        // Refresh reviews and summary
        await loadReviews(submission.serviceId);
        await loadRatingSummary(submission.serviceId);
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [user?.id, loadReviews, loadRatingSummary]);

  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await serviceReviewService.markHelpful(reviewId);
      if (success) {
        // Update local review
        setReviews(prev =>
          prev.map(r => r.id === reviewId ? { ...r, isHelpful: r.isHelpful + 1 } : r)
        );
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark helpful');
      return false;
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setError(null);
      const success = await serviceReviewService.deleteReview(reviewId);
      if (success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        if (userReview?.id === reviewId) {
          setUserReview(null);
        }
      }
      return success;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
      return false;
    }
  }, [userReview?.id]);

  return {
    reviews,
    userReview,
    ratingSummary,
    isLoading,
    isSubmitting,
    error,
    submitReview,
    markHelpful,
    deleteReview,
    loadReviews,
    loadRatingSummary,
  };
};
