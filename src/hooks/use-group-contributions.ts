import { useState, useEffect } from "react";
import { GroupContributionService } from "@/services/groupContributionService";
import { 
  GroupContributionWithDetails, 
  GroupVoteWithDetails 
} from "@/types/group-contributions";

export const useGroupContributions = (groupId: string, userId: string) => {
  const [contributions, setContributions] = useState<GroupContributionWithDetails[]>([]);
  const [votes, setVotes] = useState<GroupVoteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        const [contributionsData, votesData] = await Promise.all([
          GroupContributionService.getGroupContributions(groupId),
          GroupContributionService.getGroupVotes(groupId),
        ]);
        
        setContributions(contributionsData);
        setVotes(votesData);
      } catch (err) {
        console.error("Error fetching group data:", err);
        setError("Failed to load group data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [groupId, userId]);

  const refreshData = async () => {
    try {
      const [contributionsData, votesData] = await Promise.all([
        GroupContributionService.getGroupContributions(groupId),
        GroupContributionService.getGroupVotes(groupId),
      ]);
      
      setContributions(contributionsData);
      setVotes(votesData);
    } catch (err) {
      console.error("Error refreshing group data:", err);
      setError("Failed to refresh group data");
    }
  };

  return {
    contributions,
    votes,
    loading,
    error,
    refreshData,
  };
};