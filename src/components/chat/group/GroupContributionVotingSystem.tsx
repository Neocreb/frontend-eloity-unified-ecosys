import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { GroupContributionService } from "@/services/groupContributionService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  GroupContributionWithDetails,
  GroupVoteWithDetails
} from "@/types/group-contributions";
import {
  Coins,
  MessageSquare,
  PlusCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GroupContributionStatus } from "./GroupContributionStatus";
import { GroupVoteCard } from "./GroupVoteCard";

interface GroupContributionVotingSystemProps {
  groupId: string;
  isAdmin: boolean;
}

export const GroupContributionVotingSystem: React.FC<GroupContributionVotingSystemProps> = ({
  groupId,
  isAdmin,
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contributions, setContributions] = useState<GroupContributionWithDetails[]>([]);
  const [votes, setVotes] = useState<GroupVoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContribution, setSelectedContribution] = useState<GroupContributionWithDetails | null>(null);
  const [activeTab, setActiveTab] = useState("contributions");

  // Fetch contributions and votes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        const [contributionsData, votesData] = await Promise.all([
          GroupContributionService.getGroupContributions(groupId),
          GroupContributionService.getGroupVotes(groupId),
        ]);
        
        setContributions(contributionsData);
        setVotes(votesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load group data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, user, toast]);

  // Refresh data after changes
  const refreshData = async () => {
    if (!user) return;
    
    try {
      const [contributionsData, votesData] = await Promise.all([
        GroupContributionService.getGroupContributions(groupId),
        GroupContributionService.getGroupVotes(groupId),
      ]);
      
      setContributions(contributionsData);
      setVotes(votesData);
      
      // Refresh selected contribution if needed
      if (selectedContribution) {
        const updatedContribution = contributionsData.find(c => c.id === selectedContribution.id);
        if (updatedContribution) {
          setSelectedContribution(updatedContribution);
        }
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  // Handle new contribution button
  const handleNewContribution = () => {
    navigate(`/app/community/group-contribution/${groupId}`);
  };

  // Handle new vote button
  const handleNewVote = () => {
    navigate(`/app/community/vote/${groupId}`);
  };

  // Handle contribute to a contribution
  const handleContributeClick = (contributionId: string) => {
    navigate(`/app/community/contribute/${contributionId}`);
  };

  // Handle vote update
  const handleVoteUpdate = () => {
    refreshData();
  };

  // Handle refund
  const handleRefund = async (contributorId: string) => {
    if (!user) return;
    
    try {
      const success = await GroupContributionService.refundContribution(contributorId, user.id);
      if (success) {
        refreshData();
        toast({
          title: "Success",
          description: "Contribution has been refunded!",
        });
      } else {
        throw new Error("Failed to refund contribution");
      }
    } catch (error) {
      console.error("Error refunding contribution:", error);
      toast({
        title: "Error",
        description: "Failed to refund contribution. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <TabsList>
            <TabsTrigger value="contributions" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Contributions
            </TabsTrigger>
            <TabsTrigger value="votes" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Votes
            </TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            {activeTab === "contributions" && (
              <Button
                size="sm"
                disabled={!isAdmin}
                onClick={handleNewContribution}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Contribution
              </Button>
            )}

            {activeTab === "votes" && (
              <Button
                size="sm"
                onClick={handleNewVote}
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                New Vote
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="contributions" className="flex-1 mt-0">
          <ScrollArea className="h-full p-4">
            {contributions.length > 0 ? (
              <div className="space-y-4">
                {contributions.map((contribution) => (
                  <div 
                    key={contribution.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedContribution(contribution)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{contribution.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {contribution.description}
                        </p>
                      </div>
                      <Badge variant={
                        contribution.status === "active" ? "default" : 
                        contribution.status === "completed" ? "secondary" : 
                        "destructive"
                      }>
                        {contribution.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            {contribution.total_contributed.toFixed(2)} {contribution.currency}
                          </span>
                        </div>
                        {contribution.target_amount && (
                          <div className="flex items-center gap-1">
                            <span>
                              of {contribution.target_amount.toFixed(2)} {contribution.currency}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Coins className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Contributions Yet</h3>
                <p className="text-gray-600 mb-4">
                  {isAdmin 
                    ? "Start a new group contribution to collect funds from members." 
                    : "No contributions have been created for this group yet."}
                </p>
                {isAdmin && (
                  <Button onClick={handleNewContribution}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Start Contribution
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="votes" className="flex-1 mt-0">
          <ScrollArea className="h-full p-4">
            {votes.length > 0 ? (
              <div className="space-y-4">
                {votes.map((vote) => (
                  <GroupVoteCard
                    key={vote.id}
                    vote={vote}
                    onVoteUpdate={handleVoteUpdate}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Votes Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start a new vote to make group decisions together.
                </p>
                <Button onClick={handleNewVote}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Vote
                </Button>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
      
      {/* Contribution Status Modal */}
      {selectedContribution && (
        <GroupContributionStatus
          contribution={selectedContribution}
          onContribute={() => setShowContributeModal(true)}
          isAdmin={isAdmin}
          onRefund={handleRefund}
          trigger={<div className="hidden"></div>}
        />
      )}
      
      {/* Contribute Modal */}
      {selectedContribution && (
        <ContributeToGroupModal
          contribution={selectedContribution}
          isOpen={showContributeModal}
          onOpenChange={setShowContributeModal}
          onContributionMade={handleContributionMade}
        />
      )}
    </div>
  );
};
