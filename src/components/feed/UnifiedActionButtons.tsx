// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Briefcase, 
  UserCheck, 
  Calendar, 
  PlayCircle,
  Radio,
  ExternalLink,
  ArrowRight,
  DollarSign,
  MapPin,
  Clock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useNotification } from '@/hooks/use-notification';
import { useAuth } from '@/contexts/AuthContext';
import { UnifiedActivityService } from '@/services/unifiedActivityService';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  postId: string;
  type?: 'product' | 'job' | 'freelancer' | 'event' | 'live' | 'sponsored' | 'skill';
  isLive?: boolean;
  price?: string;
  location?: string;
  eventDate?: string;
  jobType?: string;
  company?: string;
  salary?: string;
  skills?: string[];
  ctaText?: string;
  ctaUrl?: string;
  author?: {
    name: string;
    username: string;
  };
  onClick?: (e: React.MouseEvent) => void;
}

const UnifiedActionButtons: React.FC<ActionButtonsProps> = ({
  postId,
  type,
  isLive,
  price,
  location,
  eventDate,
  jobType,
  company,
  salary,
  skills,
  ctaText,
  ctaUrl,
  author,
  onClick
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { user } = useAuth();

  const handleAction = async (e: React.MouseEvent, actionType: string) => {
    e.stopPropagation();
    
    // Prevent action if user not logged in
    if (!user) {
      notification.error('Please log in to continue');
      navigate('/auth');
      return;
    }

    // Track activity reward
    if (user.id) {
      try {
        let reward;
        switch (actionType) {
          case 'buy_product':
            // Note: Purchase rewards are now only given on payment completion
            // This action navigates to purchase page without immediate rewards
            notification.info('Complete payment to earn purchase rewards');
            break;
          case 'apply_job':
            reward = await UnifiedActivityService.trackJobApplication(
              user.id,
              postId,
              { jobType, company, source: 'feed' }
            );
            break;
          case 'hire_freelancer':
            reward = await UnifiedActivityService.trackFreelancerHire(
              user.id,
              postId,
              { skills, source: 'feed' }
            );
            break;
          case 'join_event':
            reward = await UnifiedActivityService.trackEventJoin(
              user.id,
              postId,
              { eventDate, location, source: 'feed' }
            );
            break;
          case 'watch_live':
            reward = await UnifiedActivityService.trackVideoWatch(
              user.id,
              postId,
              { type: 'live_stream', source: 'feed' }
            );
            break;
          case 'learn_skill':
            reward = await UnifiedActivityService.trackVideoWatch(
              user.id,
              postId,
              { type: 'course', skills, source: 'feed' }
            );
            break;
          case 'sponsored_click':
            reward = await UnifiedActivityService.trackShare(
              user.id,
              postId,
              'sponsored_click'
            );
            break;
        }

        if (reward?.success && reward.softPoints > 0) {
          notification.success(`+${reward.softPoints} SoftPoints earned!`, {
            description: 'Thanks for engaging with the platform!'
          });
        }
      } catch (error) {
        console.error('Failed to track activity reward:', error);
      }
    }

    // Navigate to appropriate page based on type
    let targetRoute = '';

    switch (type) {
      case 'product':
        if (ctaUrl?.includes('/marketplace/product/')) {
          targetRoute = ctaUrl;
        } else if (ctaUrl?.includes('/marketplace/')) {
          targetRoute = ctaUrl;
        } else {
          // Navigate to specific product page
          targetRoute = `/app/marketplace/product/${postId}`;
        }
        notification.info('Opening product details...');
        break;

      case 'job':
        if (ctaUrl?.includes('/app/freelance/')) {
          targetRoute = ctaUrl;
        } else if (ctaUrl?.includes('/freelance/')) {
          // Fix old format URLs
          targetRoute = ctaUrl.replace('/freelance/', '/app/freelance/');
        } else {
          // Check if it's a specific job ID or navigate to job detail
          if (postId.startsWith('job')) {
            targetRoute = `/app/freelance/job/${postId}`;
          } else {
            targetRoute = `/app/freelance/browse-jobs`;
          }
        }
        notification.info('Redirecting to job details...');
        break;

      case 'freelancer':
        if (author?.username) {
          // Navigate to freelancer profile via freelance route
          targetRoute = `/app/freelance/find-freelancers?search=${author.username}`;
        } else {
          targetRoute = '/app/freelance/find-freelancers';
        }
        notification.info('Redirecting to freelancer profile...');
        break;

      case 'event':
        if (ctaUrl?.includes('/app/events/')) {
          targetRoute = ctaUrl;
        } else if (ctaUrl?.includes('/events/')) {
          // Navigate to specific event page
          targetRoute = `/app/events/${postId}`;
        } else if (isLive) {
          // Navigate to specific event page for live events
          targetRoute = `/app/events/${postId}`;
        } else {
          targetRoute = `/app/events/${postId}`;
        }
        notification.info(isLive ? 'Opening live event...' : 'Opening event details...');
        break;

      case 'live':
        // Navigate to live streaming section
        targetRoute = `/app/videos?tab=live`;
        notification.info('Joining live stream...');
        break;

      case 'skill':
        if (ctaUrl?.includes('/app/videos') || ctaUrl?.includes('/app/learn')) {
          targetRoute = ctaUrl;
        } else if (ctaUrl?.includes('/learn/') || ctaUrl?.includes('/videos/')) {
          // Navigate to videos section for educational content (fallback for old URLs)
          targetRoute = `/app/videos?tab=tutorials`;
        } else {
          // Navigate to videos section for educational content
          targetRoute = `/app/videos?tab=tutorials`;
        }
        notification.info('Redirecting to learning content...');
        break;

      case 'sponsored':
        if (ctaUrl) {
          targetRoute = ctaUrl;
        } else {
          // Navigate to premium page
          targetRoute = '/premium';
        }
        notification.info('Opening sponsored content...');
        break;

      default:
        if (ctaUrl) {
          targetRoute = ctaUrl;
        }
        break;
    }

    // Handle navigation
    if (targetRoute) {
      if (targetRoute.startsWith('http')) {
        // External link
        window.open(targetRoute, '_blank');
      } else {
        // Internal navigation
        navigate(targetRoute);
      }
    }

    // Call custom onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  // Don't render if no type or CTA
  if (!type || (!ctaText && !ctaUrl)) {
    return null;
  }

  const getActionConfig = () => {
    switch (type) {
      case 'product':
        return {
          icon: ShoppingCart,
          text: ctaText || 'Buy Now',
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700 text-white',
          actionType: 'buy_product'
        };
      case 'job':
        return {
          icon: Briefcase,
          text: ctaText || 'Apply Now',
          variant: 'default' as const,
          className: 'bg-blue-600 hover:bg-blue-700 text-white',
          actionType: 'apply_job'
        };
      case 'freelancer':
        return {
          icon: UserCheck,
          text: ctaText || 'Hire Now',
          variant: 'default' as const,
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
          actionType: 'hire_freelancer'
        };
      case 'event':
        return {
          icon: isLive ? Radio : Calendar,
          text: ctaText || (isLive ? 'Join Live' : 'Join Event'),
          variant: 'default' as const,
          className: isLive 
            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse' 
            : 'bg-orange-600 hover:bg-orange-700 text-white',
          actionType: 'join_event'
        };
      case 'live':
        return {
          icon: PlayCircle,
          text: ctaText || 'Watch Live',
          variant: 'default' as const,
          className: 'bg-red-600 hover:bg-red-700 text-white',
          actionType: 'watch_live'
        };
      case 'skill':
        return {
          icon: ExternalLink,
          text: ctaText || 'Learn Now',
          variant: 'default' as const,
          className: 'bg-indigo-600 hover:bg-indigo-700 text-white',
          actionType: 'learn_skill'
        };
      case 'sponsored':
        return {
          icon: ExternalLink,
          text: ctaText || 'Learn More',
          variant: 'default' as const,
          className: 'bg-purple-600 hover:bg-purple-700 text-white',
          actionType: 'sponsored_click'
        };
      default:
        return {
          icon: ArrowRight,
          text: ctaText || 'View',
          variant: 'outline' as const,
          className: '',
          actionType: 'generic_action'
        };
    }
  };

  const config = getActionConfig();
  const IconComponent = config.icon;

  return (
    <div className="space-y-3">
      {/* Enhanced Content Info */}
      {type === 'job' && (jobType || salary || company) && (
        <Card className="p-3 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {jobType && (
              <div className="flex items-center gap-1">
                <Briefcase className="h-3 w-3 text-blue-600" />
                <span className="font-medium">{jobType}</span>
              </div>
            )}
            {salary && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-green-600" />
                <span className="font-medium">{salary}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-gray-600" />
                <span>{location}</span>
              </div>
            )}
            {company && (
              <div className="flex items-center gap-1">
                <span className="font-medium">{company}</span>
              </div>
            )}
          </div>
          {skills && skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {skills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </Card>
      )}

      {type === 'product' && price && (
        <Card className="p-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-lg text-green-700 dark:text-green-300">{price}</span>
            </div>
            <Badge className="bg-green-500 text-white">For Sale</Badge>
          </div>
        </Card>
      )}

      {type === 'event' && (eventDate || location) && (
        <Card className="p-3 bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-4 text-sm">
            {eventDate && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-orange-600" />
                <span className="font-medium">{eventDate}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-orange-600" />
                <span>{location}</span>
              </div>
            )}
            {isLive && (
              <div className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-red-500" />
                <span className="text-red-500 font-medium">LIVE</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {type === 'skill' && skills && skills.length > 0 && (
        <Card className="p-3 bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-indigo-600" />
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">Learning Path</span>
            </div>
            {price && (
              <span className="font-bold text-lg text-indigo-700 dark:text-indigo-300">{price}</span>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {skills.map((skill, i) => (
              <Badge key={i} variant="secondary" className="text-xs bg-indigo-100 text-indigo-800">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      )}

      {/* Action Button */}
      <Button
        onClick={(e) => handleAction(e, config.actionType)}
        className={cn("w-full font-semibold", config.className)}
        variant={config.variant}
      >
        <IconComponent className="h-4 w-4 mr-2" />
        {config.text}
        {isLive && type === 'event' && (
          <Radio className="h-4 w-4 ml-2 animate-pulse" />
        )}
      </Button>
    </div>
  );
};

export default UnifiedActionButtons;
