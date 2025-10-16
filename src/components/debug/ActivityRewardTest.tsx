// @ts-nocheck
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ActivityRewardService } from "@/services/activityRewardService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ActivityRewardTest: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const testActivity = async (actionType: string, description: string) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "Please log in to test the reward system",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await ActivityRewardService.logActivity({
        userId: user.id,
        actionType: actionType as any,
        targetId: "test_" + Date.now(),
        targetType: "test",
        metadata: {
          testAction: true,
          description,
        },
      });

      setLastResult(result);

      if (result.success && result.eloityPoints > 0) {
        toast({
          title: "🎉 Reward Earned!",
          description: `+${result.eloityPoints} Eloity Points earned for ${description}`,
        });
      } else {
        toast({
          title: "Test Complete",
          description: result.message || "No rewards earned",
        });
      }
    } catch (error) {
      console.error("Test failed:", error);
      toast({
        title: "Test Failed",
        description: "Check console for error details",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testActions = [
    { type: "like_post", name: "Like Post", description: "liking a post" },
    {
      type: "post_content",
      name: "Create Post",
      description: "creating a post",
    },
    {
      type: "comment_post",
      name: "Comment",
      description: "commenting on a post",
    },
    { type: "share_content", name: "Share", description: "sharing content" },
    { type: "daily_login", name: "Daily Login", description: "daily login" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Activity Reward System Test</CardTitle>
          <p className="text-sm text-muted-foreground">
            Test the reward system by simulating different activities
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {testActions.map((action) => (
              <Button
                key={action.type}
                variant="outline"
                disabled={isLoading || !user}
                onClick={() => testActivity(action.type, action.description)}
                className="h-auto p-3 flex flex-col items-center"
              >
                <span className="font-semibold">{action.name}</span>
                <span className="text-xs text-muted-foreground">
                  Test {action.description}
                </span>
              </Button>
            ))}
          </div>

          {!user && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-800">
                Please log in to test the reward system
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {lastResult && (
        <Card>
          <CardHeader>
            <CardTitle>Last Test Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={lastResult.success ? "default" : "destructive"}>
                  {lastResult.success ? "Success" : "Failed"}
                </Badge>
                <Badge variant="outline">Status: {lastResult.status}</Badge>
                {lastResult.riskScore > 0 && (
                  <Badge variant="secondary">
                    Risk: {lastResult.riskScore}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Eloity Points Earned</p>
                  <p className="text-lg text-green-600">
                    +{lastResult.eloityPoints}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Wallet Bonus</p>
                  <p className="text-lg text-green-600">
                    +${lastResult.walletBonus.toFixed(4)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Message</p>
                <p className="text-sm text-muted-foreground">
                  {lastResult.message}
                </p>
              </div>

              {lastResult.newTrustScore > 0 && (
                <div>
                  <p className="text-sm font-medium">Trust Score</p>
                  <p className="text-sm">
                    {lastResult.newTrustScore.toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ActivityRewardTest;
