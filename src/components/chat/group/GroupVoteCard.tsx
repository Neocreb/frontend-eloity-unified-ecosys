import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { GroupContributionService } from "@/services/groupContributionService";
import { useAuth } from "@/contexts/AuthContext";
import { 
  GroupVoteWithDetails 
} from "@/types/group-contributions";
import { 
  MessageSquare, 
  Calendar, 
  Users, 
  CheckCircle,
  Clock,
  BarChart
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";

interface GroupVoteCardProps {
  vote: GroupVoteWithDetails;
  onVoteUpdate?: () => void;
}

export const GroupVoteCard: React.FC<GroupVoteCardProps> = ({
  vote,
  onVoteUpdate,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userVote, setUserVote] = useState<string | null>(vote.user_vote);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // Calculate total votes
  const totalVotes = Object.values(vote.vote_counts).reduce((sum, count) => sum + count, 0);

  // Check if vote has ended
  const isVoteEnded = vote.end_date 
    ? new Date(vote.end_date) < new Date()
    : false;

  // Calculate time remaining
  useEffect(() => {
    const updateTimeRemaining = () => {
      if (!vote.end_date) {
        setTimeRemaining("No end date");
        return;
      }
      
      const endDate = new Date(vote.end_date);
      const now = new Date();
      
      if (endDate < now) {
        setTimeRemaining("Ended");
      } else {
        setTimeRemaining(`${formatDistanceToNow(endDate, { addSuffix: true })}`);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [vote.end_date]);

  // Handle voting
  const handleVote = async (choice: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to vote",
        variant: "destructive",
      });
      return;
    }

    if (isVoteEnded) {
      toast({
        title: "Vote Ended",
        description: "This vote has already ended",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await GroupContributionService.submitVoteResponse(
        vote.id,
        user.id,
        choice
      );

      if (result) {
        setUserVote(choice);
        toast({
          title: "Vote Recorded",
          description: "Your vote has been successfully recorded!",
        });
        
        // Refresh vote data
        onVoteUpdate?.();
      } else {
        throw new Error("Failed to record vote");
      }
    } catch (error) {
      console.error("Error voting:", error);
      toast({
        title: "Error",
        description: "Failed to record your vote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate percentage for each option
  const calculatePercentage = (count: number) => {
    if (totalVotes === 0) return 0;
    return (count / totalVotes) * 100;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>{vote.topic}</span>
          </CardTitle>
          <Badge variant={isVoteEnded ? "destructive" : "default"}>
            {isVoteEnded ? "Ended" : "Active"}
          </Badge>
        </div>
        {vote.description && (
          <p className="text-gray-600 text-sm mt-2">{vote.description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Vote creator */}
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6">
            <AvatarImage src={vote.created_by_avatar} />
            <AvatarFallback>
              {vote.created_by_name?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">
            Created by {vote.created_by_name}
          </span>
        </div>
        
        {/* Vote options */}
        <div className="space-y-3">
          {vote.options.map((option) => {
            const count = vote.vote_counts[option] || 0;
            const percentage = calculatePercentage(count);
            const isSelected = userVote === option;
            
            return (
              <div key={option} className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {isVoteEnded ? (
                      isSelected ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )
                    ) : (
                      <Button
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(option)}
                        disabled={isSubmitting || isVoteEnded || !!userVote}
                        className="h-6 px-2 text-xs"
                      >
                        {isSelected ? "Voted" : "Vote"}
                      </Button>
                    )}
                    <span className="text-sm">{option}</span>
                  </div>
                  <span className="text-sm font-medium">
                    {count} ({percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            );
          })}
        </div>
        
        {/* Vote stats */}
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{totalVotes} votes</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart className="w-4 h-4" />
            <span>{vote.required_percentage}% required</span>
          </div>
        </div>
        
        {/* User's vote status */}
        {userVote && (
          <div className="flex items-center gap-2 p-2 bg-green-50 rounded">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm text-green-700">
              You voted for: <strong>{userVote}</strong>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};