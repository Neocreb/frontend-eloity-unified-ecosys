import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { adSettings } from '../../../config/adSettings';

interface InVideoBannerAdProps {
  adData: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    action_url: string;
    advertiser: string;
    cta_text?: string;
  };
  onDismiss: () => void;
  onAction: (url: string) => void;
  className?: string;
}

const InVideoBannerAd: React.FC<InVideoBannerAdProps> = ({ 
  adData, 
  onDismiss, 
  onAction,
  className 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isVisible || !adData) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  const handleAction = () => {
    onAction(adData.action_url);
  };

  return (
    <div className={`absolute bottom-20 left-4 right-4 md:bottom-24 md:left-8 md:right-8 z-40 ${className || ''}`}>
      <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-sm rounded-xl p-3 border border-white/10 shadow-2xl max-w-md mx-auto">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center">
              <span className="text-xs font-bold text-white">AD</span>
            </div>
            <span className="text-xs text-gray-300 truncate max-w-[120px]">{adData.advertiser}</span>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 text-gray-400 hover:text-white hover:bg-white/10"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <ExternalLink className="w-3 h-3" />
              ) : (
                <ExternalLink className="w-3 h-3" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-6 h-6 text-gray-400 hover:text-white hover:bg-white/10"
              onClick={handleDismiss}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        {!isMinimized && (
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <img 
                src={adData.image_url} 
                alt={adData.title}
                className="w-16 h-16 rounded-lg object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium text-sm mb-1 truncate">{adData.title}</h3>
              <p className="text-gray-300 text-xs mb-2 line-clamp-2">{adData.description}</p>
              <Button 
                size="sm" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-xs h-7 px-2"
                onClick={handleAction}
              >
                {adData.cta_text || 'Learn More'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InVideoBannerAd;