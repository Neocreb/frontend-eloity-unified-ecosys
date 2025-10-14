import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, X, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatAdProps {
  ad: {
    id: string;
    sponsor?: string;
    title: string;
    body?: string;
    image?: string;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  onClickCTA?: (adId: string) => void;
  onDismiss?: (adId: string) => void;
}

const ChatAd: React.FC<ChatAdProps> = ({ ad, onClickCTA, onDismiss }) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleCTA = () => {
    onClickCTA?.(ad.id);
    if (ad.ctaUrl) {
      try {
        window.open(ad.ctaUrl, "_blank", "noopener,noreferrer");
      } catch (e) {}
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    onDismiss?.(ad.id);
  };

  return (
    <div className="max-w-xl mx-auto my-3">
      <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md">
        <CardHeader className="flex items-start justify-between py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
              {ad.image ? (
                <img src={ad.image} alt={ad.title} className="w-full h-full object-cover" />
              ) : (
                <Info className="w-5 h-5 text-gray-500" />
              )}
            </div>
            <div>
              <CardTitle className="text-sm font-semibold leading-tight">{ad.title}</CardTitle>
              {ad.sponsor && <div className="text-xs text-muted-foreground">Sponsored • {ad.sponsor}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={handleDismiss} aria-label="Dismiss ad">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        {ad.body && (
          <CardContent className="py-2 px-4 text-sm text-muted-foreground">{ad.body}</CardContent>
        )}

        <div className="px-4 pb-3">
          <div className="flex items-center justify-between">
            <div />
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" onClick={handleCTA}>
                {ad.ctaLabel || "Learn more"} <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
              <Badge variant="secondary" className="text-xs">Ad</Badge>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatAd;
