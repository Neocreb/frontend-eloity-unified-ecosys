import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRewardsSummary } from "./useRewardsSummary";
import { useActivityFeed } from "./useActivityFeed";
import { useToast } from "./use-toast";
import { ActivityTransaction } from "@/services/activityTransactionService";

interface NotificationOptions {
  showToast?: boolean;
  showConfetti?: boolean;
  playSound?: boolean;
}

export const useRewardNotifications = (options: NotificationOptions = {}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { summary, isLoading: summaryLoading } = useRewardsSummary();
  const { activities } = useActivityFeed(50);

  const previousBalanceRef = useRef<number>(0);
  const previousLevelRef = useRef<number>(1);
  const previousStreakRef = useRef<number>(0);

  const showConfetti = options.showConfetti !== false;
  const showToast_enabled = options.showToast !== false;
  const playSound = options.playSound !== false;

  // Trigger confetti animation
  const triggerConfetti = () => {
    if (!showConfetti) return;

    // Check if confetti library is available
    if (typeof window !== "undefined" && (window as any).confetti) {
      (window as any).confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  // Play notification sound
  const playNotificationSound = (type: "earn" | "levelup" | "achievement") => {
    if (!playSound) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      switch (type) {
        case "earn":
          oscillator.frequency.value = 800;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.3
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          break;

        case "levelup":
          oscillator.frequency.value = 1000;
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
          );
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.5);
          break;

        case "achievement":
          const osc1 = audioContext.createOscillator();
          const osc2 = audioContext.createOscillator();
          const gain1 = audioContext.createGain();
          const gain2 = audioContext.createGain();

          osc1.frequency.value = 800;
          osc2.frequency.value = 1000;
          gain1.gain.setValueAtTime(0.2, audioContext.currentTime);
          gain2.gain.setValueAtTime(0.2, audioContext.currentTime);

          osc1.connect(gain1);
          osc2.connect(gain2);
          gain1.connect(audioContext.destination);
          gain2.connect(audioContext.destination);

          osc1.start(audioContext.currentTime);
          osc2.start(audioContext.currentTime + 0.2);
          osc1.stop(audioContext.currentTime + 0.4);
          osc2.stop(audioContext.currentTime + 0.6);
          break;
      }
    } catch (error) {
      console.error("Error playing notification sound:", error);
    }
  };

  // Monitor for new activities
  useEffect(() => {
    if (!activities || activities.length === 0) return;

    const latestActivity = activities[0];
    const amount = latestActivity.amount_currency || 0;

    if (amount > 0) {
      // Earn notification
      if (showToast_enabled) {
        toast({
          title: "💰 Earned Reward!",
          description: `+${latestActivity.amount_currency} for ${latestActivity.description}`,
        });
      }

      if (playSound) {
        playNotificationSound("earn");
      }
    }
  }, [activities, showToast_enabled, playSound, toast]);

  // Monitor for level changes
  useEffect(() => {
    if (summaryLoading || !summary) return;

    if (summary.level > previousLevelRef.current) {
      const levelTitles = [
        "Starter",
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
      ];
      const newLevelTitle = levelTitles[summary.level - 1] || "Unknown";

      if (showToast_enabled) {
        toast({
          title: "🎉 Level Up!",
          description: `Congratulations! You've reached ${newLevelTitle} level!`,
        });
      }

      if (showConfetti) {
        triggerConfetti();
      }

      if (playSound) {
        playNotificationSound("levelup");
      }

      previousLevelRef.current = summary.level;
    }
  }, [summary, summaryLoading, showToast_enabled, showConfetti, playSound, toast]);

  // Monitor for balance changes
  useEffect(() => {
    if (summaryLoading || !summary) return;

    const balanceIncrease =
      summary.available_balance - previousBalanceRef.current;

    if (balanceIncrease > 10) {
      if (showToast_enabled) {
        toast({
          title: "💵 Balance Updated",
          description: `Your balance increased by ${balanceIncrease.toFixed(2)}!`,
        });
      }
    }

    previousBalanceRef.current = summary.available_balance;
  }, [summary, summaryLoading, showToast_enabled, toast]);

  // Monitor for streak changes
  useEffect(() => {
    if (!summary || summaryLoading) return;

    if (
      summary.current_streak > 0 &&
      summary.current_streak > previousStreakRef.current
    ) {
      const streakMilestones = [1, 7, 14, 30, 60, 100];

      if (streakMilestones.includes(summary.current_streak)) {
        if (showToast_enabled) {
          toast({
            title: "🔥 Streak Milestone!",
            description: `Amazing! You have a ${summary.current_streak}-day streak!`,
          });
        }

        if (showConfetti) {
          triggerConfetti();
        }

        if (playSound) {
          playNotificationSound("achievement");
        }
      }
    }

    previousStreakRef.current = summary.current_streak;
  }, [summary, summaryLoading, showToast_enabled, showConfetti, playSound, toast]);

  return {
    triggerConfetti,
    playNotificationSound,
  };
};
