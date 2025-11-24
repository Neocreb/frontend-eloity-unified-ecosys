import React from 'react';
import { Star } from 'lucide-react';
import { ServiceRatingSummary } from '@/services/serviceReviewService';

interface ServiceRatingBadgeProps {
  rating: ServiceRatingSummary | null;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  interactive?: boolean;
  onClick?: () => void;
}

export const ServiceRatingBadge: React.FC<ServiceRatingBadgeProps> = ({
  rating,
  size = 'md',
  showText = true,
  interactive = false,
  onClick,
}) => {
  if (!rating || rating.totalReviews === 0) {
    return (
      <div
        className={`flex items-center gap-1 ${
          interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
        }`}
        onClick={onClick}
      >
        <Star className={`h-4 w-4 text-gray-300 ${size === 'lg' ? 'h-5 w-5' : ''}`} />
        <span className="text-sm text-gray-500">No ratings</span>
      </div>
    );
  }

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`${
          i < Math.round(rating.averageRating)
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        } ${size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'}`}
      />
    ));
  };

  return (
    <div
      className={`flex items-center gap-2 ${
        interactive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex gap-0.5">
        {renderStars(Math.round(rating.averageRating))}
      </div>
      {showText && (
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm">{rating.averageRating.toFixed(1)}</span>
          <span className="text-xs text-gray-500">({rating.totalReviews})</span>
        </div>
      )}
    </div>
  );
};

export default ServiceRatingBadge;
