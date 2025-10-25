import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/components/ui/use-toast";
import { GroupContributionService } from "@/services/groupContributionService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GroupContributionWithDetails, 
  GroupContributor 
} from "@/types/group-contributions";
import { 
  Coins, 
  Calendar, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Wallet
} from "lucide-react";
import { format } from "date-fns";
import GroupContributionPayoutStatus from "./GroupContributionPayoutStatus";

interface GroupContributionStatusProps {
  contribution: GroupContributionWithDetails;
  trigger: React.ReactNode;
  onContribute?: () => void;
}

export const GroupContributionStatus: React.FC<GroupContributionStatusProps> = ({
  contribution,
  trigger,
  onContribute,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [userContributions, setUserContributions] = useState<GroupContributor[]>([]);
  const [totalUserContributed, setTotalUserContributed] = useState(0);
  const [isContributionEnded, setIsContributionEnded] = useState(false);

  // Calculate progress percentage
  const progressPercentage = contribution.target_amount 
    ? Math.min((contribution.total_contributed / contribution.target_amount) * 100, 100)
    : 0;

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: currency === 'ELOITY' ? 2 : 2,
      maximumFractionDigits: currency === 'ELOITY' ? 2 : 2,
    }).format(amount);
  };

  // Format amount without currency symbol for ELOITY
  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'ELOITY') {
      return `${amount.toFixed(2)} ELOITY`;
    }
    return formatCurrency(amount, currency);
  };

  // Check if contribution has ended
  useEffect(() => {
    if (contribution.end_date) {
      setIsContributionEnded(new Date(contribution.end_date) < new Date());
    }
  }, [contribution.end_date]);

  // Fetch user's contributions
  useEffect(() => {
    const fetchUserContributions = async () => {
      if (user && isOpen) {
        const contributions = await GroupContributionService.getUserContributions(
          contribution.id,
          user.id
        );
        setUserContributions(contributions);
        setTotalUserContributed(
          contributions.reduce((sum, c) => sum + c.amount, 0)
        );
      }
    };

    fetchUserContributions();
  }, [user, contribution.id, isOpen]);

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!contribution.end_date) return null;
    
    const endDate = new Date(contribution.end_date);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    
    if (diffTime <= 0) return "Ended";
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 1) {
      return `${diffDays} days remaining`;
    } else if (diffDays === 1) {
      return "1 day remaining";
    } else {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hours remaining`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            {contribution.title}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Contribution Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Contribution Overview</span>
                  <Badge variant={isContributionEnded ? "destructive" : "default"}>
                    {isContributionEnded ? "Ended" : "Active"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">{contribution.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-sm text-gray-500">Target</p>
                      <p className="font-medium">
                        {contribution.target_amount 
                          ? formatAmount(contribution.target_amount, contribution.currency)
                          : "No target"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm text-gray-500">Raised</p>
                      <p className="font-medium">
                        {formatAmount(contribution.total_contributed, contribution.currency)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-sm text-gray-500">Contributors</p>
                      <p className="font-medium">{contribution.contributors.length}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <div>
                      <p className="text-sm text-gray-500">Ends</p>
                      <p className="font-medium">
                        {contribution.end_date 
                          ? format(new Date(contribution.end_date), "MMM d, yyyy")
                          : "No end date"}
                      </p>
                    </div>
                  </div>
                </div>
                
                {contribution.target_amount && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>
                        {progressPercentage.toFixed(1)}% of target
                      </span>
                      <span>
                        {getTimeRemaining()}
                      </span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Payout Status - Only show if contribution has ended */}
            {isContributionEnded && (
              <GroupContributionPayoutStatus contributionId={contribution.id} />
            )}
            
            {/* Your Contribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user?.profile?.avatar_url} />
                    <AvatarFallback>YOU</AvatarFallback>
                  </Avatar>
                  Your Contribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      {formatAmount(totalUserContributed, contribution.currency)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {userContributions.length} contribution{userContributions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <Button 
                    onClick={onContribute}
                    disabled={isContributionEnded}
                  >
                    {isContributionEnded ? "Contribution Ended" : "Add Contribution"}
                  </Button>
                </div>
                
                {userContributions.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Your Contributions</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {userContributions.map((contribution) => (
                        <div 
                          key={contribution.id} 
                          className="flex justify-between items-center p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">
                            {formatAmount(contribution.amount, contribution.currency)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(contribution.contributed_at), "MMM d, h:mm a")}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* All Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {contribution.contributors.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {contribution.contributors.map((contributor) => (
                      <div 
                        key={contributor.id} 
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={contributor.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {contributor.user?.full_name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">
                              {contributor.user?.full_name || "Unknown User"}
                            </p>
                            <p className="text-xs text-gray-500">
                              Contributor
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {formatAmount(contributor.amount, contributor.currency)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(contributor.contributed_at), "MMM d")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No contributions yet. Be the first to contribute!
                  </p>
                )}

              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};