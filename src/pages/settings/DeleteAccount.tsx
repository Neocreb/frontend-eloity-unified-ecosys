import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertCircle,
  ChevronLeft,
  AlertTriangle,
  Trash2,
  Lock,
  Shield,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DeleteAccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<"warning" | "confirm" | "verifying">("warning");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [understandRisks, setUnderstandRisks] = useState(false);
  const [acknowledgeDataLoss, setAcknowledgeDataLoss] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const canProceed =
    step === "confirm" &&
    confirmEmail === user?.email &&
    confirmPassword.length > 0 &&
    understandRisks &&
    acknowledgeDataLoss;

  const handleDeleteAccount = async () => {
    if (!canProceed) return;

    setIsDeleting(true);
    try {
      // Call API to delete account
      const response = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: confirmEmail,
          password: confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted. You will be logged out.",
      });

      // Logout and redirect
      setTimeout(() => {
        logout();
        navigate("/auth");
      }, 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col dark:bg-gray-950">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1 flex items-center gap-3">
            <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30">
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold dark:text-gray-100">
              Delete Account
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8">
          {step === "warning" && (
            <div className="space-y-6">
              {/* Warning Alert */}
              <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-900/50">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> Deleting your account is permanent and cannot be undone.
                </AlertDescription>
              </Alert>

              {/* What happens card */}
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 dark:text-gray-100">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    What happens when you delete your account?
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium dark:text-gray-200">Your data will be:</p>
                    <ul className="text-sm text-muted-foreground dark:text-gray-400 space-y-1 ml-4 list-disc">
                      <li>Permanently deleted from our servers</li>
                      <li>Removed from all searches and recommendations</li>
                      <li>All posted content will be deleted</li>
                      <li>All wallets and cryptocurrency holdings will be inaccessible</li>
                      <li>All followers and connections will be lost</li>
                    </ul>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium dark:text-gray-200">We cannot:</p>
                    <ul className="text-sm text-muted-foreground dark:text-gray-400 space-y-1 ml-4 list-disc">
                      <li>Recover your account or data</li>
                      <li>Cancel deletion once the process starts</li>
                      <li>Return any funds or rewards already redeemed</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Security info */}
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm dark:text-blue-200">
                    <Lock className="h-4 w-4" />
                    For Your Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-blue-800 dark:text-blue-200">
                  We require your email and password to confirm this request. This ensures only account owners can delete accounts.
                </CardContent>
              </Card>

              {/* Proceed Button */}
              <Button
                onClick={() => setStep("confirm")}
                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                size="lg"
              >
                I Understand, Continue
              </Button>

              {/* Alternative */}
              <div className="text-center">
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Not sure? You can{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto font-medium dark:text-blue-400"
                    onClick={() => navigate(-1)}
                  >
                    go back anytime
                  </Button>
                </p>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-6">
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-900/50">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-200">
                  This is your final confirmation. Please review carefully before proceeding.
                </AlertDescription>
              </Alert>

              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-gray-100">Confirm Account Deletion</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Enter your email and password to confirm deletion
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="dark:text-gray-200">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                    {confirmEmail && confirmEmail !== user?.email && (
                      <p className="text-xs text-red-600 dark:text-red-400">
                        Email does not match your account
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="dark:text-gray-200">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="risks"
                        checked={understandRisks}
                        onCheckedChange={(checked) =>
                          setUnderstandRisks(checked as boolean)
                        }
                        className="mt-1 dark:border-gray-700"
                      />
                      <Label
                        htmlFor="risks"
                        className="text-sm cursor-pointer dark:text-gray-300"
                      >
                        I understand that deleting my account is permanent and irreversible
                      </Label>
                    </div>

                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="data-loss"
                        checked={acknowledgeDataLoss}
                        onCheckedChange={(checked) =>
                          setAcknowledgeDataLoss(checked as boolean)
                        }
                        className="mt-1 dark:border-gray-700"
                      />
                      <Label
                        htmlFor="data-loss"
                        className="text-sm cursor-pointer dark:text-gray-300"
                      >
                        I acknowledge that all my data, content, and funds will be permanently lost
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("warning")}
                  disabled={isDeleting}
                  className="flex-1 dark:border-gray-700 dark:hover:bg-gray-900"
                >
                  Back
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={!canProceed || isDeleting}
                  className={cn(
                    "flex-1",
                    !canProceed && "opacity-50 cursor-not-allowed",
                    canProceed && "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                  )}
                >
                  {isDeleting ? "Deleting..." : "Delete My Account"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage;
