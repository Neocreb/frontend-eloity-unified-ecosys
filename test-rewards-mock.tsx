import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { rewardsService } from "@/services/rewardsService";
import RewardsCard from "@/components/rewards/RewardsCard";

const TestRewardsService = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Test fetching reward rules
        const rules = await rewardsService.getRewardRules();
        console.log("Reward rules:", rules);
        
        // Test fetching virtual gifts
        const gifts = await rewardsService.getVirtualGifts();
        console.log("Virtual gifts:", gifts);
        
        // Mock user rewards data since we don't have a real user ID
        const mockUserRewards = {
          total_earned: 1250.50,
          available_balance: 250.75,
          level: 5,
          streak: 7,
          next_level_requirement: 500
        };
        
        setData({
          calculatedUserRewards: mockUserRewards,
          rewardRules: rules,
          virtualGifts: gifts
        });
      } catch (err) {
        console.error("Error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!data?.calculatedUserRewards) {
    return <div className="p-4">No data available</div>;
  }

  const rewardData = {
    currentEloits: data.calculatedUserRewards.total_earned,
    availableToWithdraw: data.calculatedUserRewards.available_balance,
    totalEarnings: data.calculatedUserRewards.total_earned,
    trustScore: {
      current: Math.min(100, data.calculatedUserRewards.level * 20),
      level: `Level ${data.calculatedUserRewards.level}`,
      multiplier: 1 + (data.calculatedUserRewards.level * 0.1),
      nextLevelAt: data.calculatedUserRewards.next_level_requirement
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Rewards Service Test</h1>
      <RewardsCard
        currentEloits={rewardData.currentEloits}
        availableToWithdraw={rewardData.availableToWithdraw}
        totalEarnings={rewardData.totalEarnings}
        trustScore={rewardData.trustScore}
        onWithdraw={() => console.log("Withdraw clicked")}
      />
    </div>
  );
};

// Render the test component
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<TestRewardsService />);