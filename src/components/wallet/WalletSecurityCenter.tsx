// @ts-nocheck
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import KYCVerificationModal from "@/components/kyc/KYCVerificationModal";
import BankAccountSettings from "@/components/wallet/BankAccountSettings";
import {
  Shield,
  Smartphone,
  Mail,
  Bell,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Key,
  CreditCard,
  UserCheck,
  Settings,
  Phone,
  DollarSign,
  TrendingUp,
} from "lucide-react";

interface SecuritySettings {
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  transactionAlerts: boolean;
  spendingAlerts: boolean;
  spendingLimit: number;
  withdrawalLimit: number;
  loginAlerts: boolean;
  sessionTimeout: number;
}

interface NotificationPreferences {
  largeTransactions: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  threshold: number;
}

const WalletSecurityCenter = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    emailNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    spendingAlerts: true,
    spendingLimit: 1000,
    withdrawalLimit: 500,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    largeTransactions: true,
    weeklyReports: true,
    securityAlerts: true,
    marketingEmails: false,
    threshold: 100,
  });

  const [twoFactorDialogOpen, setTwoFactorDialogOpen] = useState(false);
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Mock KYC level - in real app this would come from backend
  const [kycLevel, setKycLevel] = useState(1);

  useEffect(() => {
    // Load security settings from user profile or backend
    if (user?.profile) {
      setSecuritySettings(prev => ({
        ...prev,
        twoFactorEnabled: user.profile.two_factor_enabled || false,
        emailNotifications: user.profile.email_notifications !== false,
        // Load other settings...
      }));
    }
  }, [user]);

  const handleSecuritySettingChange = async (key: keyof SecuritySettings, value: any) => {
    try {
      setSecuritySettings(prev => ({ ...prev, [key]: value }));
      
      // Save to backend
      await updateProfile({ [key]: value });
      
      toast({
        title: "Security Setting Updated",
        description: `${key.replace(/([A-Z])/g, ' $1').toLowerCase()} has been updated`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security setting",
        variant: "destructive",
      });
      // Revert the change
      setSecuritySettings(prev => ({ ...prev, [key]: !value }));
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences, value: any) => {
    setNotifications(prev => ({ ...prev, [key]: value }));
    
    try {
      await updateProfile({ [`notification_${key}`]: value });
      toast({
        title: "Notification Setting Updated",
        description: "Your notification preferences have been saved",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  };

  const enableTwoFactor = async () => {
    setIsVerifying(true);
    try {
      // Simulate 2FA setup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (twoFactorCode === "123456") { // Mock verification
        await handleSecuritySettingChange("twoFactorEnabled", true);
        setTwoFactorDialogOpen(false);
        setTwoFactorCode("");
        toast({
          title: "2FA Enabled",
          description: "Two-factor authentication has been successfully enabled",
        });
      } else {
        toast({
          title: "Invalid Code",
          description: "Please enter the correct verification code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable two-factor authentication",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const disableTwoFactor = async () => {
    try {
      await handleSecuritySettingChange("twoFactorEnabled", false);
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled",
        variant: "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disable two-factor authentication",
        variant: "destructive",
      });
    }
  };

  const getKYCStatusColor = (level: number) => {
    switch (level) {
      case 0: return "bg-red-100 text-red-800";
      case 1: return "bg-yellow-100 text-yellow-800";
      case 2: return "bg-blue-100 text-blue-800";
      case 3: return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getKYCStatusText = (level: number) => {
    switch (level) {
      case 0: return "Not Verified";
      case 1: return "Basic Verified";
      case 2: return "Enhanced Verified";
      case 3: return "Full Verified";
      default: return "Unknown";
    }
  };

  const getSecurityScore = () => {
    let score = 0;
    if (securitySettings.twoFactorEnabled) score += 30;
    if (kycLevel >= 2) score += 25;
    if (securitySettings.transactionAlerts) score += 15;
    if (securitySettings.spendingAlerts) score += 15;
    if (securitySettings.loginAlerts) score += 10;
    if (user?.profile?.phone_verified) score += 5;
    return Math.min(score, 100);
  };

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Security Score</p>
              <p className="text-sm text-gray-600">
                {securityScore < 50 ? "Needs improvement" : 
                 securityScore < 80 ? "Good security" : "Excellent security"}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{securityScore}%</div>
              <div className="w-24 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    securityScore < 50 ? 'bg-red-500' :
                    securityScore < 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${securityScore}%` }}
                />
              </div>
            </div>
          </div>

          {securityScore < 80 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Improve your security by enabling 2FA and completing KYC verification.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">2FA Status</p>
              <p className="text-sm text-gray-600">
                {securitySettings.twoFactorEnabled 
                  ? "Two-factor authentication is enabled" 
                  : "Protect your account with an extra layer of security"
                }
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={securitySettings.twoFactorEnabled ? "default" : "destructive"}>
                {securitySettings.twoFactorEnabled ? "Enabled" : "Disabled"}
              </Badge>
              {securitySettings.twoFactorEnabled ? (
                <Button variant="outline" size="sm" onClick={disableTwoFactor}>
                  Disable
                </Button>
              ) : (
                <Dialog open={twoFactorDialogOpen} onOpenChange={setTwoFactorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      Enable 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Alert>
                        <Key className="h-4 w-4" />
                        <AlertDescription>
                          We've sent a verification code to your email. Please enter it below.
                        </AlertDescription>
                      </Alert>
                      <div className="space-y-2">
                        <Label htmlFor="2fa-code">Verification Code</Label>
                        <Input
                          id="2fa-code"
                          placeholder="Enter 6-digit code"
                          value={twoFactorCode}
                          onChange={(e) => setTwoFactorCode(e.target.value)}
                          maxLength={6}
                        />
                        <p className="text-xs text-gray-600">
                          For demo purposes, use: 123456
                        </p>
                      </div>
                      <Button 
                        onClick={enableTwoFactor} 
                        disabled={isVerifying || twoFactorCode.length !== 6}
                        className="w-full"
                      >
                        {isVerifying ? "Verifying..." : "Enable 2FA"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KYC Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Identity Verification (KYC)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Verification Level</p>
              <p className="text-sm text-gray-600">
                Higher levels unlock more features and limits
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getKYCStatusColor(kycLevel)}>
                Level {kycLevel} - {getKYCStatusText(kycLevel)}
              </Badge>
              <KYCVerificationModal
                userId={user?.id || ""}
                currentLevel={kycLevel}
                onLevelUpdate={setKycLevel}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Level 1</div>
              <div className="text-sm text-gray-600">Basic verification</div>
              <div className="text-xs text-green-600 mt-1">$500 daily limit</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Level 2</div>
              <div className="text-sm text-gray-600">Enhanced verification</div>
              <div className="text-xs text-green-600 mt-1">$5,000 daily limit</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="font-medium">Level 3</div>
              <div className="text-sm text-gray-600">Full verification</div>
              <div className="text-xs text-green-600 mt-1">Unlimited</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Transaction Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via email</p>
              </div>
              <Switch
                checked={securitySettings.emailNotifications}
                onCheckedChange={(checked) => handleSecuritySettingChange("emailNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS Notifications</p>
                <p className="text-sm text-gray-600">Receive alerts via SMS</p>
              </div>
              <Switch
                checked={securitySettings.smsNotifications}
                onCheckedChange={(checked) => handleSecuritySettingChange("smsNotifications", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Transaction Alerts</p>
                <p className="text-sm text-gray-600">Get notified of all transactions</p>
              </div>
              <Switch
                checked={securitySettings.transactionAlerts}
                onCheckedChange={(checked) => handleSecuritySettingChange("transactionAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Login Alerts</p>
                <p className="text-sm text-gray-600">Get notified of new logins</p>
              </div>
              <Switch
                checked={securitySettings.loginAlerts}
                onCheckedChange={(checked) => handleSecuritySettingChange("loginAlerts", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spending Limits and Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Spending Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Spending Alerts</p>
              <p className="text-sm text-gray-600">Get notified when approaching limits</p>
            </div>
            <Switch
              checked={securitySettings.spendingAlerts}
              onCheckedChange={(checked) => handleSecuritySettingChange("spendingAlerts", checked)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="spending-limit">Daily Spending Limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  id="spending-limit"
                  type="number"
                  value={securitySettings.spendingLimit}
                  onChange={(e) => handleSecuritySettingChange("spendingLimit", parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="withdrawal-limit">Daily Withdrawal Limit</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm">$</span>
                <Input
                  id="withdrawal-limit"
                  type="number"
                  value={securitySettings.withdrawalLimit}
                  onChange={(e) => handleSecuritySettingChange("withdrawalLimit", parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification-threshold">Large Transaction Threshold</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm">$</span>
              <Input
                id="notification-threshold"
                type="number"
                value={notifications.threshold}
                onChange={(e) => handleNotificationChange("threshold", parseFloat(e.target.value))}
              />
              <span className="text-sm text-gray-600">and above</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Large Transaction Alerts</p>
                <p className="text-sm text-gray-600">Above ${notifications.threshold}</p>
              </div>
              <Switch
                checked={notifications.largeTransactions}
                onCheckedChange={(checked) => handleNotificationChange("largeTransactions", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-gray-600">Summary of your activity</p>
              </div>
              <Switch
                checked={notifications.weeklyReports}
                onCheckedChange={(checked) => handleNotificationChange("weeklyReports", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Security Alerts</p>
                <p className="text-sm text-gray-600">Important security notifications</p>
              </div>
              <Switch
                checked={notifications.securityAlerts}
                onCheckedChange={(checked) => handleNotificationChange("securityAlerts", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Marketing Emails</p>
                <p className="text-sm text-gray-600">Product updates and offers</p>
              </div>
              <Switch
                checked={notifications.marketingEmails}
                onCheckedChange={(checked) => handleNotificationChange("marketingEmails", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Bank Account Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BankAccountSettings />
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Auto-logout after inactivity</Label>
            <Select
              value={securitySettings.sessionTimeout.toString()}
              onValueChange={(value) => handleSecuritySettingChange("sessionTimeout", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSecurityCenter;
