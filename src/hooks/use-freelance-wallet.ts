// @ts-nocheck
import { useState, useEffect } from "react";
import { useWalletContext } from "@/contexts/WalletContext";
import { freelanceService } from "@/services/freelanceService";
import { FreelanceStats } from "@/types/freelance";
import { useAuth } from "@/contexts/AuthContext";

export const useFreelanceWallet = () => {
  const { getSourceBalance, getTransactionsBySource, refreshWallet } =
    useWalletContext();
  const { user } = useAuth();
  const [freelanceStats, setFreelanceStats] = useState<FreelanceStats | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const freelanceBalance = getSourceBalance("freelance");
  const freelanceTransactions = getTransactionsBySource("freelance");

  useEffect(() => {
    if (user?.id) {
      loadFreelanceStats();
    }
  }, [user?.id]);

  const loadFreelanceStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const stats = await freelanceService.getFreelanceStats(user.id);
      setFreelanceStats(stats);
    } catch (error) {
      console.error("Failed to load freelance stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalEarningsThisMonth = () => {
    const thisMonth = new Date();
    const startOfMonth = new Date(
      thisMonth.getFullYear(),
      thisMonth.getMonth(),
      1,
    );

    return freelanceTransactions
      .filter((transaction) => {
        const transactionDate = new Date(transaction.timestamp);
        return transactionDate >= startOfMonth && transaction.amount > 0;
      })
      .reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getActiveProjectsCount = () => {
    return freelanceStats?.activeProjects || 0;
  };

  const getCompletionRate = () => {
    return freelanceStats?.onTimeDelivery || 0;
  };

  const getClientSatisfactionRate = () => {
    return freelanceStats?.clientSatisfaction || 0;
  };

  // Function to simulate earning from completing a project
  const completeProjectEarning = async (
    amount: number,
    projectTitle: string,
  ) => {
    // This would integrate with the wallet service to add the earning
    // For now, we'll just refresh the wallet to show updated balance
    await refreshWallet();

    // In a real implementation, this would also:
    // 1. Update the project status
    // 2. Add transaction to freelance transaction history
    // 3. Send notifications
    // 4. Update freelance stats

    return {
      success: true,
      amount,
      description: `Payment received for: ${projectTitle}`,
    };
  };

  // Function to handle milestone completion
  const completeMilestone = async (milestoneId: string, projectId: string) => {
    // This would integrate with project management
    // For now, just refresh data
    await Promise.all([refreshWallet(), loadFreelanceStats()]);

    return { success: true };
  };

  return {
    // Wallet integration
    freelanceBalance,
    freelanceTransactions,
    refreshWallet,

    // Freelance-specific data
    freelanceStats,
    isLoading,

    // Computed values
    earningsThisMonth: getTotalEarningsThisMonth(),
    activeProjectsCount: getActiveProjectsCount(),
    completionRate: getCompletionRate(),
    clientSatisfactionRate: getClientSatisfactionRate(),

    // Actions
    completeProjectEarning,
    completeMilestone,
    refreshStats: loadFreelanceStats,
  };
};

export default useFreelanceWallet;
