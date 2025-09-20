import React, { useState, useEffect } from 'react';
import { X, Play } from 'lucide-react';
import { adSettings } from '../../../config/adSettings';
import { cn } from '@/lib/utils';
import { adRewardService } from '@/services/adRewardService';

interface InVideoAdProps {
  onAdComplete: () => void;
  onSkip: () => void;
  onRewardEarned?: (rewardAmount: number, message: string) => void;
  userId?: string;
  className?: string;
}

export const InVideoAd: React.FC<InVideoAdProps> = ({
  onAdComplete,
  onSkip,
  onRewardEarned,
  userId = 'guest',
  className
}) => {
  // Placeholder – Replace with real AdSense/Adsterra/PropellerAds SDK
  const [adProgress, setAdProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [rewardMessage, setRewardMessage] = useState('');
  const [rewardAmount, setRewardAmount] = useState(0);
  const adDuration = 15; // 15 second placeholder ad
  const adId = React.useMemo(() => adRewardService.generateAdId('in_video'), []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAdProgress(prev => {
        const newProgress = prev + (100 / adDuration);
        
        if (newProgress >= (adSettings.inVideoAdSkipDelay / adDuration) * 100) {
          setCanSkip(true);
        }
        
        if (newProgress >= 100) {
          clearInterval(interval);

          // Track ad completion and reward
          adRewardService.trackAdView(userId, adId, 'in_video', true)
            .then(result => {
              setRewardAmount(result.rewardEarned);
              setRewardMessage(result.message);
              setShowReward(true);

              setTimeout(() => {
                onAdComplete();
                onRewardEarned?.(result.rewardEarned, result.message);
              }, 2000);
            })
            .catch(error => {
              console.error('Failed to track ad reward:', error);
              setShowReward(true);
              setTimeout(() => {
                onAdComplete();
                onRewardEarned?.(0, 'Failed to process reward');
              }, 2000);
            });

          return 100;
        }
        
        return newProgress;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [onAdComplete, onRewardEarned]);

  const handleSkip = () => {
    if (canSkip) {
      onSkip();
    }
  };

  return (
    <div className={cn(
      "absolute inset-0 bg-black/90 flex items-center justify-center z-50",
      className
    )}>
      {/* Ad Content Container */}
      <div className="relative w-full h-full max-w-4xl max-h-96 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg overflow-hidden">
        
        {/* Ad Label */}
        <div className="absolute top-4 left-4 bg-black/70 text-white text-sm px-3 py-1 rounded z-10">
          {adSettings.adLabels.advertisement}
        </div>

        {/* Skip Button */}
        {canSkip && (
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 bg-black/70 hover:bg-black/80 text-white p-2 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Placeholder Video Content */}
        <div className="w-full h-full flex items-center justify-center relative">
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-80" />
            <h3 className="text-xl font-bold mb-2">Sample Advertisement</h3>
            <p className="text-sm opacity-90 mb-4">This is a placeholder for video ads</p>
            <div className="text-xs opacity-70">
              SDK: AdSense / Adsterra / PropellerAds
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
          <div 
            className="h-full bg-white transition-all duration-1000"
            style={{ width: `${adProgress}%` }}
          />
        </div>

        {/* Skip Timer */}
        {!canSkip && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded">
            Skip in {Math.max(0, adSettings.inVideoAdSkipDelay - Math.floor(adProgress * adDuration / 100))}s
          </div>
        )}
      </div>

      {/* Reward Notification */}
      {showReward && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-pulse">
          <div className="text-center">
            <div className="text-lg font-bold">
              {rewardAmount > 0 ? `+${rewardAmount} Eloits earned!` : 'Ad Completed'}
            </div>
            <div className="text-sm opacity-90">
              {rewardMessage || 'Thanks for watching'}
            </div>
          </div>
        </div>
      )}

      {/* Future SDK Container */}
      <div 
        id="in-video-ad-container"
        className="absolute inset-0 hidden"
        data-ad-slot="in-video"
      >
      </div>
    </div>
  );
};
