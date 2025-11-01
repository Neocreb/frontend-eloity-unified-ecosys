import React from "react";
import ReactDOM from "react-dom/client";
import RewardsCard from "@/components/rewards/RewardsCard";

// Test data
const testData = {
  currentEloits: 1250,
  availableToWithdraw: 250.75,
  totalEarnings: 1250.50,
  trustScore: {
    current: 85,
    level: "gold",
    multiplier: 1.5
  }
};

const TestRewardsCard = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Rewards Card Test</h1>
      <RewardsCard
        currentEloits={testData.currentEloits}
        availableToWithdraw={testData.availableToWithdraw}
        totalEarnings={testData.totalEarnings}
        trustScore={testData.trustScore}
        onWithdraw={() => console.log("Withdraw clicked")}
      />
    </div>
  );
};

// Render the test component
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(<TestRewardsCard />);