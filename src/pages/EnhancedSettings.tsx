// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
// import { useI18n } from "@/contexts/I18nContext"; // Temporarily disabled
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
// import { I18nSettingsModal, RegionalPaymentMethods } from "@/components/i18n/LanguageCurrencySelector"; // Temporarily disabled
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Settings,
  Palette,
  Bell,
  Shield,
  Globe2,
  DollarSign,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  MessageSquare,
  TrendingUp,
  Building,
  CreditCard,
  Zap,
  Database,
  UserCheck,
  Camera,
  Volume2,
  Moon,
  Sun,
  Plus,
  X,
  Upload,
  Star,
  Code,
  Briefcase,
  GraduationCap,
  MapPin,
  Link as LinkIcon,
  Phone,
  FileText,
  Save,
  Edit,
  Trash,
  ChevronRight,
  Award,
  ArrowUpDown,
  Calendar,
  Wifi,
  WifiOff,
  Headphones,
  Image,
  Video,
  Mic,
  Monitor,
  Languages,
  BookOpen,
  Target,
  BarChart,
  PieChart,
  TrendingDown,
  Banknote,
  Wallet,
  QrCode,
  Fingerprint,
  Key,
  ShieldCheck,
  AlertCircle,
  Info,
  HelpCircle,
  RefreshCw,
  LogOut,
  Home,
  Store,
  Coins,
  Crown,
  Radio,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import KYCVerificationModal from "@/components/kyc/KYCVerificationModal";
import BankAccountSettings from "@/components/wallet/BankAccountSettings";
import DataManagement from "@/components/data/DataManagement";
import CurrencyDemo from "@/components/currency/CurrencyDemo";
import AIFeatures from "@/components/ai/AIFeatures";
import MobileTabsFix from "@/components/layout/MobileTabsFix";
import EnhancedAccessibilityFeatures from '@/components/accessibility/EnhancedAccessibilityFeatures';
import { supabase } from "@/integrations/supabase/client";

const { SmartFeedCuration, AIContentAssistant } = AIFeatures;

const EnhancedSettings = () => {
  const { user, updateProfile, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Profile states
  const [skills, setSkills] = useState<string[]>(user?.profile?.skills || []);
  const [newSkill, setNewSkill] = useState("");
  const [interests, setInterests] = useState<string[]>(
    user?.profile?.interests || [],
  );
  const [newInterest, setNewInterest] = useState("");
  const [languages, setLanguages] = useState<string[]>(
    user?.profile?.languages || ["English"],
  );
  const [newLanguage, setNewLanguage] = useState("");
  const [certifications, setCertifications] = useState<string[]>(
    user?.profile?.skills || [],
  );
  const [newCertification, setNewCertification] = useState("");

  // Personal information states
  const [fullName, setFullName] = useState(user?.profile?.full_name || "");
  const [bio, setBio] = useState(user?.profile?.bio || "");
  const [location, setLocation] = useState(user?.profile?.location || "");
  const [website, setWebsite] = useState(user?.profile?.website || "");
  const [phone, setPhone] = useState(user?.profile?.phone || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    user?.profile?.date_of_birth || "",
  );
  const [timezone, setTimezone] = useState(user?.profile?.timezone || "UTC");

  // Professional information states
  const [jobTitle, setJobTitle] = useState(user?.profile?.bio || "");
  const [company, setCompany] = useState(user?.profile?.bio || "");
  const [education, setEducation] = useState(user?.profile?.bio || "");
  const [experience, setExperience] = useState(user?.profile?.bio || "");
  const [linkedinUrl, setLinkedinUrl] = useState(
    user?.profile?.website || "",
  );
  const [githubUrl, setGithubUrl] = useState(user?.profile?.website || "");

  // Freelance profile states - using available profile properties
  const [professionalTitle, setProfessionalTitle] = useState(
    user?.profile?.freelance_profile?.professional_title || "",
  );
  const [hourlyRate, setHourlyRate] = useState(
    user?.profile?.freelance_profile?.hourly_rate?.toString() || "",
  );
  const [availability, setAvailability] = useState(
    user?.profile?.freelance_profile?.availability || "available",
  );
  const [experienceLevel, setExperienceLevel] = useState(
    user?.profile?.freelance_profile?.experience_level || "intermediate",
  );
  const [portfolioUrl, setPortfolioUrl] = useState(
    user?.profile?.freelance_profile?.portfolio_url || "",
  );
  const [workingHours, setWorkingHours] = useState(
    user?.profile?.freelance_profile?.working_hours || "9am-5pm",
  );
  const [responseTime, setResponseTime] = useState(
    user?.profile?.freelance_profile?.response_time || "within-24h",
  );

  // Marketplace profile states - using available profile properties
  const [storeName, setStoreName] = useState(
    user?.profile?.marketplace_profile?.store_name || "",
  );
  const [storeDescription, setStoreDescription] = useState(
    user?.profile?.marketplace_profile?.store_description || "",
  );
  const [businessType, setBusinessType] = useState(
    user?.profile?.marketplace_profile?.business_type || "individual",
  );
  const [businessAddress, setBusinessAddress] = useState(
    user?.profile?.marketplace_profile?.business_address || "",
  );
  const [taxId, setTaxId] = useState(user?.profile?.marketplace_profile?.tax_id || "");
  const [returnPolicy, setReturnPolicy] = useState(
    user?.profile?.marketplace_profile?.return_policy || "",
  );

  // Crypto profile states - using available profile properties
  const [tradingExperience, setTradingExperience] = useState(
    user?.profile?.crypto_profile?.trading_experience || "beginner",
  );
  const [riskTolerance, setRiskTolerance] = useState(
    user?.profile?.crypto_profile?.risk_tolerance || "low",
  );
  const [p2pEnabled, setP2pEnabled] = useState(
    user?.profile?.crypto_profile?.p2p_enabled || false,
  );
  const [preferredCurrency, setPreferredCurrency] = useState(
    user?.profile?.crypto_profile?.preferred_currency || "USD",
  );

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(
    user?.settings?.email_notifications ?? true,
  );
  const [pushNotifications, setPushNotifications] = useState(
    user?.settings?.push_notifications ?? true,
  );
  const [marketingEmails, setMarketingEmails] = useState(
    user?.settings?.marketing_emails ?? false,
  );
  const [orderUpdates, setOrderUpdates] = useState(
    user?.settings?.order_updates ?? true,
  );
  const [tradingAlerts, setTradingAlerts] = useState(
    user?.settings?.trading_alerts ?? true,
  );
  const [socialActivity, setSocialActivity] = useState(
    user?.settings?.social_activity ?? true,
  );
  const [newsUpdates, setNewsUpdates] = useState(
    user?.settings?.news_updates ?? true,
  );
  const [weeklyDigest, setWeeklyDigest] = useState(
    user?.settings?.weekly_digest ?? true,
  );
  const [priceAlerts, setPriceAlerts] = useState(
    user?.settings?.price_alerts ?? true,
  );
  const [securityAlerts, setSecurityAlerts] = useState(
    user?.settings?.security_alerts ?? true,
  );

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState(
    user?.settings?.profile_visibility || "public",
  );
  const [showOnlineStatus, setShowOnlineStatus] = useState(
    user?.settings?.show_online_status ?? true,
  );
  const [allowDirectMessages, setAllowDirectMessages] = useState(
    user?.settings?.allow_direct_messages || "everyone",
  );
  const [showEmail, setShowEmail] = useState(
    user?.settings?.show_email ?? false,
  );
  const [showPhone, setShowPhone] = useState(
    user?.settings?.show_phone ?? false,
  );
  const [indexProfile, setIndexProfile] = useState(
    user?.settings?.index_profile ?? true,
  );

  // Content filter preferences
  const [contentHideSensitive, setContentHideSensitive] = useState<boolean>(user?.settings?.content_hide_sensitive ?? false);
  const [contentSafeSearch, setContentSafeSearch] = useState<string>(user?.settings?.content_safe_search || 'moderate');
  const [blockedKeywords, setBlockedKeywords] = useState<string>((user?.settings?.blocked_keywords || []).join(', '));
  const [showActivity, setShowActivity] = useState(
    user?.settings?.show_activity ?? true,
  );
  const [allowTags, setAllowTags] = useState(
    user?.settings?.allow_tags ?? true,
  );

  // Security settings
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(
    user?.settings?.two_factor_enabled ?? false,
  );
  const [loginNotifications, setLoginNotifications] = useState(
    user?.settings?.login_notifications ?? true,
  );
  const [sessionTimeout, setSessionTimeout] = useState(
    user?.settings?.session_timeout || "24h",
  );
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // App preferences
  const [autoPlayVideos, setAutoPlayVideos] = useState(
    user?.settings?.auto_play_videos ?? true,
  );
  const [reducedMotion, setReducedMotion] = useState(
    user?.settings?.reduced_motion ?? false,
  );
  const [highContrast, setHighContrast] = useState(
    user?.settings?.high_contrast ?? false,
  );
  const [fontSize, setFontSize] = useState(
    user?.settings?.font_size || "medium",
  );
  const [language, setLanguage] = useState(user?.settings?.language || "en");

  // Data & Storage
  const [dataUsage, setDataUsage] = useState("unlimited");
  const [autoBackup, setAutoBackup] = useState(true);
  const [cacheSize, setCacheSize] = useState("245MB");

  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showKYCModal, setShowKYCModal] = useState(false);
  const [kycLevel, setKycLevel] = useState(user?.profile?.kyc_level || 0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Skills management
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // Interests management
  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (interestToRemove: string) => {
    setInterests(interests.filter((interest) => interest !== interestToRemove));
  };

  // Languages management
  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (languageToRemove: string) => {
    if (languages.length > 1) {
      // Keep at least one language
      setLanguages(
        languages.filter((language) => language !== languageToRemove),
      );
    }
  };

  // Certifications management
  const addCertification = () => {
    if (
      newCertification.trim() &&
      !certifications.includes(newCertification.trim())
    ) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (certificationToRemove: string) => {
    setCertifications(
      certifications.filter((cert) => cert !== certificationToRemove),
    );
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        full_name: fullName,
        bio,
        location,
        website,
        phone,
        date_of_birth: dateOfBirth,
        timezone,
        job_title: jobTitle,
        company,
        education,
        experience,
        linkedin_url: linkedinUrl,
        github_url: githubUrl,
        skills,
        interests,
        languages,
        certifications,
      });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save freelance profile
  const saveFreelanceProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        freelance_profile: {
          professional_title: professionalTitle,
          hourly_rate: parseFloat(hourlyRate) || 0,
          availability,
          experience_level: experienceLevel,
          portfolio_url: portfolioUrl,
          working_hours: workingHours,
          response_time: responseTime,
        },
      });

      toast({
        title: "Freelance profile updated",
        description: "Your freelance profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update freelance profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save marketplace profile
  const saveMarketplaceProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        marketplace_profile: {
          store_name: storeName,
          store_description: storeDescription,
          business_type: businessType,
          business_address: businessAddress,
          tax_id: taxId,
          return_policy: returnPolicy,
        },
      });

      toast({
        title: "Store profile updated",
        description: "Your marketplace profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update store profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save crypto profile
  const saveCryptoProfile = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        crypto_profile: {
          trading_experience: tradingExperience,
          risk_tolerance: riskTolerance,
          p2p_enabled: p2pEnabled,
          preferred_currency: preferredCurrency,
        },
      });

      toast({
        title: "Crypto profile updated",
        description: "Your crypto profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update crypto profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save notification settings
  const saveNotificationSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          email_notifications: emailNotifications,
          push_notifications: pushNotifications,
          marketing_emails: marketingEmails,
          order_updates: orderUpdates,
          trading_alerts: tradingAlerts,
          social_activity: socialActivity,
          news_updates: newsUpdates,
          weekly_digest: weeklyDigest,
          price_alerts: priceAlerts,
          security_alerts: securityAlerts,
        },
      });

      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save privacy settings
  const savePrivacySettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          profile_visibility: profileVisibility,
          show_online_status: showOnlineStatus,
          allow_direct_messages: allowDirectMessages,
          show_email: showEmail,
          show_phone: showPhone,
          index_profile: indexProfile,
          show_activity: showActivity,
          allow_tags: allowTags,
        },
      });

      toast({
        title: "Privacy settings updated",
        description: "Your privacy preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update privacy settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          two_factor_enabled: twoFactorEnabled,
          login_notifications: loginNotifications,
          session_timeout: sessionTimeout,
        },
      });

      toast({
        title: "Security settings updated",
        description: "Your security preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save appearance settings
  const saveAppearanceSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          auto_play_videos: autoPlayVideos,
          reduced_motion: reducedMotion,
          high_contrast: highContrast,
          font_size: fontSize,
          language: language,
        },
      });

      toast({
        title: "Appearance settings updated",
        description: "Your appearance preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update appearance settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Save data settings
  const saveDataSettings = async () => {
    setIsLoading(true);
    try {
      await updateProfile({
        settings: {
          data_usage: dataUsage,
          auto_backup: autoBackup,
        },
      });

      toast({
        title: "Data settings updated",
        description: "Your data preferences have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update data settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all password fields.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cache
  const clearCache = () => {
    toast({
      title: "Cache cleared",
      description: "Application cache has been cleared successfully.",
    });
  };

  // Export data
  const exportData = () => {
    toast({
      title: "Data export initiated",
      description:
        "Your data export will be ready shortly. You'll receive an email when it's complete.",
    });
  };

  // Delete account
  const deleteAccount = async () => {
    setIsLoading(true);
    try {
      // This would call the account deletion API
      toast({
        title: "Account deleted",
        description: "Your account has been scheduled for deletion.",
        variant: "destructive",
      });
      logout();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const getKYCStatusBadge = (level: number) => {
    const statuses = [
      {
        label: "Not Verified",
        color: "bg-gray-500",
        icon: <Shield className="w-3 h-3" />,
      },
      {
        label: "Basic",
        color: "bg-blue-500",
        icon: <UserCheck className="w-3 h-3" />,
      },
      {
        label: "Intermediate",
        color: "bg-yellow-500",
        icon: <CheckCircle className="w-3 h-3" />,
      },
      {
        label: "Advanced",
        color: "bg-green-500",
        icon: <Star className="w-3 h-3" />,
      },
    ];
    const status = statuses[level] || statuses[0];
    return (
      <Badge className={`${status.color} text-white`}>
        {status.icon}
        <span className="ml-1">{status.label}</span>
      </Badge>
    );
  };

  const getProfileCompletion = () => {
    const fields = [
      fullName,
      bio,
      location,
      website,
      phone,
      skills.length > 0,
      interests.length > 0,
    ];
    const completed = fields.filter((field) => field && field !== "").length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      <MobileTabsFix />
      <div className="max-w-5xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-3 mb-6">
          <Settings className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Settings</h1>
          <Badge variant="secondary" className="ml-auto">
            Profile {getProfileCompletion()}% Complete
          </Badge>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          {/* Mobile tabs with horizontal scroll */}
          <div className="lg:hidden">
            <div className="w-full overflow-x-auto">
              <TabsList className="flex w-max min-w-full gap-1 p-1 h-auto min-h-[60px]">
                <TabsTrigger
                  value="profile"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Profile
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="professional"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Briefcase className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Work
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="appearance"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Palette className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Appearance
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="financial"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <DollarSign className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Money
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="premium"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0 text-purple-600"
                >
                  <Crown className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Premium
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="notifications"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Bell className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Alerts
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="privacy"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Eye className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Privacy
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="security"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Security
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="data"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Database className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Data
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="ai"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Zap className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    AI
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="i18n"
                  className="flex flex-col items-center gap-1 text-xs min-w-[70px] h-auto py-2 px-3 flex-shrink-0"
                >
                  <Languages className="w-4 h-4 flex-shrink-0" />
                  <span className="text-[10px] leading-tight whitespace-nowrap">
                    Language
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Desktop tabs with grid layout */}
          <div className="hidden lg:block">
            <TabsList className="grid w-full grid-cols-11">
              <TabsTrigger
                value="profile"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Users className="w-4 h-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Briefcase className="w-4 h-4" />
                <span>Work</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Palette className="w-4 h-4" />
                <span>Appearance</span>
              </TabsTrigger>
              <TabsTrigger
                value="financial"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <DollarSign className="w-4 h-4" />
                <span>Money</span>
              </TabsTrigger>
              <TabsTrigger
                value="premium"
                className="flex flex-row items-center gap-2 text-sm text-purple-600"
              >
                <Crown className="w-4 h-4" />
                <span>Premium</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Bell className="w-4 h-4" />
                <span>Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="privacy"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Eye className="w-4 h-4" />
                <span>Privacy</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="data"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Database className="w-4 h-4" />
                <span>Data</span>
              </TabsTrigger>
              <TabsTrigger
                value="ai"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Zap className="w-4 h-4" />
                <span>AI</span>
              </TabsTrigger>
              <TabsTrigger
                value="i18n"
                className="flex flex-row items-center gap-2 text-sm"
              >
                <Languages className="w-4 h-4" />
                <span>Language</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            {/* Profile Completion Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Profile Completion
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Progress value={getProfileCompletion()} className="flex-1" />
                  <span className="text-sm font-medium">
                    {getProfileCompletion()}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete your profile to unlock all features and improve your
                  visibility
                </p>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">
                          Eastern Time
                        </SelectItem>
                        <SelectItem value="America/Chicago">
                          Central Time
                        </SelectItem>
                        <SelectItem value="America/Denver">
                          Mountain Time
                        </SelectItem>
                        <SelectItem value="America/Los_Angeles">
                          Pacific Time
                        </SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {bio.length}/500 characters
                  </p>
                </div>

                {/* Professional Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedinUrl"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <Label htmlFor="githubUrl">GitHub URL</Label>
                    <Input
                      id="githubUrl"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>

                <Button onClick={saveProfileChanges} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>

            {/* Skills & Expertise */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Skills *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      placeholder="Add a skill (e.g., React, Python, Design)"
                      onKeyPress={(e) => e.key === "Enter" && addSkill()}
                    />
                    <Button onClick={addSkill} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                    {skills.length > 0 ? (
                      skills.map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill}
                          <button onClick={() => removeSkill(skill)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Interests</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      placeholder="Add an interest"
                      onKeyPress={(e) => e.key === "Enter" && addInterest()}
                    />
                    <Button onClick={addInterest} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                    {interests.length > 0 ? (
                      interests.map((interest, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="flex items-center gap-1"
                        >
                          {interest}
                          <button onClick={() => removeInterest(interest)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No interests added yet
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Languages</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Add a language"
                      onKeyPress={(e) => e.key === "Enter" && addLanguage()}
                    />
                    <Button onClick={addLanguage} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                    {languages.map((language, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        <Languages className="w-3 h-3" />
                        {language}
                        {languages.length > 1 && (
                          <button onClick={() => removeLanguage(language)}>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Certifications</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newCertification}
                      onChange={(e) => setNewCertification(e.target.value)}
                      placeholder="Add a certification"
                      onKeyPress={(e) =>
                        e.key === "Enter" && addCertification()
                      }
                    />
                    <Button onClick={addCertification} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                    {certifications.length > 0 ? (
                      certifications.map((cert, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Award className="w-3 h-3" />
                          {cert}
                          <button onClick={() => removeCertification(cert)}>
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No certifications added yet
                      </p>
                    )}
                  </div>
                </div>

                <Button onClick={saveProfileChanges} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Skills & Expertise
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Appearance & Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Theme</Label>
                      <p className="text-sm text-muted-foreground">
                        Choose your preferred theme (Light, Dark, or System)
                      </p>
                    </div>
                    <ThemeToggle />
                  </div>

                  <Separator />

                  <div>
                    <Label>Font Size</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Adjust text size for better readability
                    </p>
                    <Select value={fontSize} onValueChange={setFontSize}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium (Default)</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label>Language</Label>
                    <p className="text-sm text-muted-foreground mb-3">
                      Select your preferred language
                    </p>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">🇺🇸 English</SelectItem>
                        <SelectItem value="es">🇪🇸 Español</SelectItem>
                        <SelectItem value="fr">🇫🇷 Français</SelectItem>
                        <SelectItem value="de">🇩🇪 Deutsch</SelectItem>
                        <SelectItem value="zh">🇨🇳 中文</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoPlayVideos">Auto-play Videos</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically play videos in feed
                      </p>
                    </div>
                    <Switch
                      id="autoPlayVideos"
                      checked={autoPlayVideos}
                      onCheckedChange={setAutoPlayVideos}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reducedMotion">Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations and transitions
                      </p>
                    </div>
                    <Switch
                      id="reducedMotion"
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="highContrast">High Contrast</Label>
                      <p className="text-sm text-muted-foreground">
                        Improve visibility with higher contrast
                      </p>
                    </div>
                    <Switch
                      id="highContrast"
                      checked={highContrast}
                      onCheckedChange={setHighContrast}
                    />
                  </div>
                </div>

                {/* Advanced accessibility controls embedded here */}
                <div className="mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Accessibility className="w-5 h-5" />
                        Advanced Accessibility
                      </CardTitle>
                      <CardDescription>Fine-grained accessibility options</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <EnhancedAccessibilityFeatures onSettingsChange={(s) => {
                        try { window.localStorage.setItem('settings:accessibility', JSON.stringify(s)); } catch {};
                        toast({ title: 'Accessibility settings updated' });
                      }} />
                    </CardContent>
                  </Card>
                </div>

                <Button onClick={saveAppearanceSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Professional Settings */}
          <TabsContent value="professional" className="space-y-6">
            {/* Freelance Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Freelance Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="professionalTitle">
                      Professional Title
                    </Label>
                    <Input
                      id="professionalTitle"
                      value={professionalTitle}
                      onChange={(e) => setProfessionalTitle(e.target.value)}
                      placeholder="e.g., Full Stack Developer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="25"
                      min="1"
                      max="1000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="availability">Availability</Label>
                    <Select
                      value={availability}
                      onValueChange={setAvailability}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            Available
                          </div>
                        </SelectItem>
                        <SelectItem value="busy">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            Busy
                          </div>
                        </SelectItem>
                        <SelectItem value="unavailable">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            Unavailable
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <Select
                      value={experienceLevel}
                      onValueChange={setExperienceLevel}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entry">
                          Entry Level (0-2 years)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (2-5 years)
                        </SelectItem>
                        <SelectItem value="expert">
                          Expert (5+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="workingHours">Working Hours</Label>
                    <Select
                      value={workingHours}
                      onValueChange={setWorkingHours}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9am-5pm">9 AM - 5 PM</SelectItem>
                        <SelectItem value="flexible">Flexible</SelectItem>
                        <SelectItem value="custom">Custom Hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="responseTime">Response Time</Label>
                    <Select
                      value={responseTime}
                      onValueChange={setResponseTime}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="within-1h">Within 1 hour</SelectItem>
                        <SelectItem value="within-24h">
                          Within 24 hours
                        </SelectItem>
                        <SelectItem value="within-48h">
                          Within 48 hours
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                  <Input
                    id="portfolioUrl"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    placeholder="https://yourportfolio.com"
                  />
                </div>
                <Button onClick={saveFreelanceProfile} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Freelance Profile
                </Button>
              </CardContent>
            </Card>

            {/* Marketplace Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Marketplace Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder="Your Store Name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select
                      value={businessType}
                      onValueChange={setBusinessType}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individual">
                          Individual Seller
                        </SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="corporation">Corporation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Input
                      id="businessAddress"
                      value={businessAddress}
                      onChange={(e) => setBusinessAddress(e.target.value)}
                      placeholder="Business address (required for business accounts)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                    <Input
                      id="taxId"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      placeholder="Tax identification number"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="storeDescription">Store Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeDescription}
                    onChange={(e) => setStoreDescription(e.target.value)}
                    placeholder="Describe your store and products..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="returnPolicy">Return Policy</Label>
                  <Textarea
                    id="returnPolicy"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    placeholder="Describe your return and refund policy..."
                    rows={3}
                  />
                </div>
                <Button onClick={saveMarketplaceProfile} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Store Profile
                </Button>
              </CardContent>
            </Card>

            {/* Crypto Trading Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5" />
                  Crypto Trading Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tradingExperience">
                      Trading Experience
                    </Label>
                    <Select
                      value={tradingExperience}
                      onValueChange={setTradingExperience}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">
                          Beginner (0-1 years)
                        </SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate (1-3 years)
                        </SelectItem>
                        <SelectItem value="advanced">
                          Advanced (3+ years)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                    <Select
                      value={riskTolerance}
                      onValueChange={setRiskTolerance}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Conservative</SelectItem>
                        <SelectItem value="medium">Moderate</SelectItem>
                        <SelectItem value="high">Aggressive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="preferredCurrency">
                      Preferred Currency
                    </Label>
                    <Select
                      value={preferredCurrency}
                      onValueChange={setPreferredCurrency}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="p2pEnabled">Enable P2P Trading</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow peer-to-peer cryptocurrency trading
                    </p>
                  </div>
                  <Switch
                    id="p2pEnabled"
                    checked={p2pEnabled}
                    onCheckedChange={setP2pEnabled}
                  />
                </div>
                <Button onClick={saveCryptoProfile} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Crypto Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financial Settings */}
          <TabsContent value="financial" className="space-y-6">
            {/* KYC Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Identity Verification (KYC)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Verification Level</p>
                    <p className="text-sm text-muted-foreground">
                      Higher levels unlock more features and trading limits
                    </p>
                  </div>
                  {getKYCStatusBadge(kycLevel)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${kycLevel >= 0 ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      <Shield className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">Basic</p>
                    <p className="text-xs text-muted-foreground">
                      Email & Phone
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${kycLevel >= 1 ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">Identity</p>
                    <p className="text-xs text-muted-foreground">
                      Government ID
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${kycLevel >= 2 ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      <FileText className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">Documents</p>
                    <p className="text-xs text-muted-foreground">
                      Address Proof
                    </p>
                  </div>
                  <div className="text-center">
                    <div
                      className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${kycLevel >= 3 ? "bg-green-500 text-white" : "bg-gray-200"}`}
                    >
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">Advanced</p>
                    <p className="text-xs text-muted-foreground">Video Call</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">
                    Benefits of Higher KYC Levels:
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Level 1: Trade up to $1,000/day</li>
                    <li>• Level 2: Trade up to $10,000/day, P2P trading</li>
                    <li>• Level 3: Unlimited trading, premium features</li>
                  </ul>
                </div>

                <Button
                  onClick={() => setShowKYCModal(true)}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {kycLevel === 0
                    ? "Start Verification"
                    : "Upgrade Verification"}
                </Button>
              </CardContent>
            </Card>

            {/* Bank Account Settings */}
            <BankAccountSettings />

            {/* Trading Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trading Limits & Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold">$1,000</p>
                    <p className="text-sm text-muted-foreground">Daily Limit</p>
                    <Progress value={45} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      $450 used today
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold">$5,000</p>
                    <p className="text-sm text-muted-foreground">
                      Weekly Limit
                    </p>
                    <Progress value={30} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      $1,500 used this week
                    </p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold">$20,000</p>
                    <p className="text-sm text-muted-foreground">
                      Monthly Limit
                    </p>
                    <Progress value={25} className="mt-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      $5,000 used this month
                    </p>
                  </div>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <p className="font-medium text-yellow-800">
                      Increase Your Limits
                    </p>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Complete KYC verification to increase your trading limits
                    and access premium features.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        <span className="font-medium">Credit Card</span>
                      </div>
                      <Badge variant="secondary">Primary</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">**** 1234</p>
                    <p className="text-xs text-muted-foreground">
                      Expires 12/25
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg border-dashed">
                    <div className="text-center">
                      <Plus className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Add Payment Method
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Conversion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Currency Conversion
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time currency conversion tools and exchange rates for all your financial needs
                </p>
              </CardHeader>
              <CardContent>
                <CurrencyDemo />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Premium Settings */}
          <TabsContent value="premium" className="space-y-6">
            {/* Enhanced Premium Features Promotion */}
            <Card className="mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                      <Star className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900 text-lg">
                        Get Verified & Stand Out
                      </h3>
                      <p className="text-sm text-blue-700 max-w-md">
                        Get the blue checkmark, unlock premium features, and
                        show everyone you're authentic and trusted
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-blue-600">
                        <span>✓ Verified badge</span>
                        <span>✓ Priority support</span>
                        <span>✓ Advanced tools</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open("/app/premium", "_blank")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Premium
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Enhanced KYC Verification Promotion */}
            <Card className="mb-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-100 rounded-xl">
                      <ShieldCheck className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 text-lg">
                        Complete Identity Verification
                      </h3>
                      <p className="text-sm text-green-700 max-w-md">
                        Verify your identity to unlock higher trading limits,
                        enhanced security, and access to premium features
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-green-600">
                        <span>✓ Higher trading limits</span>
                        <span>✓ Enhanced security</span>
                        <span>✓ Faster withdrawals</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => window.open("/app/kyc", "_blank")}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-3"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Start Verification
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Premium Status Overview */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Crown className="w-5 h-5" />
                  Premium Subscription
                </CardTitle>
                <CardDescription>
                  Manage your premium subscription and access advanced features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
                  <div>
                    <h3 className="font-semibold">Current Plan: Free</h3>
                    <p className="text-sm text-muted-foreground">
                      Upgrade to unlock premium features and boost your
                      experience
                    </p>
                  </div>
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade Now
                  </Button>
                </div>

                {/* Premium Features Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">Creator Tools</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Advanced analytics</li>
                      <li>• Live streaming tools</li>
                      <li>• Content scheduling</li>
                    </ul>
                  </div>
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium mb-2">Business Features</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Priority support</li>
                      <li>• Custom branding</li>
                      <li>• Team collaboration</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links to Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Premium Features Access
                </CardTitle>
                <CardDescription>
                  Quick access to premium features and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => window.open("/app/premium", "_blank")}
                  >
                    <Crown className="w-6 h-6 text-purple-600" />
                    <span className="font-medium">Subscription Manager</span>
                    <span className="text-xs text-muted-foreground">
                      Manage plans & billing
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => window.open("/app/live-streaming", "_blank")}
                  >
                    <Radio className="w-6 h-6 text-red-600" />
                    <span className="font-medium">Live Streaming</span>
                    <span className="text-xs text-muted-foreground">
                      Professional streaming
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-2"
                    onClick={() => window.open("/app/unified-creator-studio", "_blank")}
                  >
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <span className="font-medium">Creator Analytics</span>
                    <span className="text-xs text-muted-foreground">
                      Advanced insights
                    </span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* KYC Integration for Premium Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Verification
                </CardTitle>
                <CardDescription>
                  Complete verification to access all premium features
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-900">
                        Identity Verification
                      </h4>
                      <p className="text-sm text-green-700">
                        Required for trading and monetization
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                    onClick={() => window.open("/app/kyc", "_blank")}
                  >
                    Start Verification
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="emailNotifications">
                          Email Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Receive important updates via email
                        </p>
                      </div>
                      <Switch
                        id="emailNotifications"
                        checked={emailNotifications}
                        onCheckedChange={setEmailNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="securityAlerts">Security Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Login attempts and security updates
                        </p>
                      </div>
                      <Switch
                        id="securityAlerts"
                        checked={securityAlerts}
                        onCheckedChange={setSecurityAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="weeklyDigest">Weekly Digest</Label>
                        <p className="text-sm text-muted-foreground">
                          Summary of your activity and earnings
                        </p>
                      </div>
                      <Switch
                        id="weeklyDigest"
                        checked={weeklyDigest}
                        onCheckedChange={setWeeklyDigest}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="marketingEmails">
                          Marketing Emails
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Product updates and promotions
                        </p>
                      </div>
                      <Switch
                        id="marketingEmails"
                        checked={marketingEmails}
                        onCheckedChange={setMarketingEmails}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Push Notifications */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    Push Notifications
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="pushNotifications">
                          Push Notifications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get instant notifications
                        </p>
                      </div>
                      <Switch
                        id="pushNotifications"
                        checked={pushNotifications}
                        onCheckedChange={setPushNotifications}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="socialActivity">Social Activity</Label>
                        <p className="text-sm text-muted-foreground">
                          Likes, comments, and follows
                        </p>
                      </div>
                      <Switch
                        id="socialActivity"
                        checked={socialActivity}
                        onCheckedChange={setSocialActivity}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="orderUpdates">Order Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Marketplace order status changes
                        </p>
                      </div>
                      <Switch
                        id="orderUpdates"
                        checked={orderUpdates}
                        onCheckedChange={setOrderUpdates}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Trading & Finance */}
                <div>
                  <h3 className="font-medium mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Trading & Finance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="tradingAlerts">Trading Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Price movements and trading opportunities
                        </p>
                      </div>
                      <Switch
                        id="tradingAlerts"
                        checked={tradingAlerts}
                        onCheckedChange={setTradingAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="priceAlerts">Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Cryptocurrency price notifications
                        </p>
                      </div>
                      <Switch
                        id="priceAlerts"
                        checked={priceAlerts}
                        onCheckedChange={setPriceAlerts}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="newsUpdates">News Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Market news and analysis
                        </p>
                      </div>
                      <Switch
                        id="newsUpdates"
                        checked={newsUpdates}
                        onCheckedChange={setNewsUpdates}
                      />
                    </div>
                  </div>
                </div>
                
                <Button onClick={saveNotificationSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>

            {/* Notification Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Notification Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quiet Hours</Label>
                  <p className="text-sm text-muted-foreground mb-2">
                    Set hours when you don't want to receive notifications
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietStart">Start Time</Label>
                      <Input id="quietStart" type="time" defaultValue="22:00" />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">End Time</Label>
                      <Input id="quietEnd" type="time" defaultValue="08:00" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Privacy Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="profileVisibility">Profile Visibility</Label>
                  <Select
                    value={profileVisibility}
                    onValueChange={setProfileVisibility}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Globe2 className="w-4 h-4" />
                          Public - Everyone can see your profile
                        </div>
                      </SelectItem>
                      <SelectItem value="followers">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Followers Only - Only your followers can see
                        </div>
                      </SelectItem>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Private - Only you can see
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="allowDirectMessages">
                    Who can message you
                  </Label>
                  <Select
                    value={allowDirectMessages}
                    onValueChange={setAllowDirectMessages}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="everyone">Everyone</SelectItem>
                      <SelectItem value="followers">Followers Only</SelectItem>
                      <SelectItem value="verified">
                        Verified Users Only
                      </SelectItem>
                      <SelectItem value="none">No One</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Profile Information Display</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showOnlineStatus">
                        Show Online Status
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Let others see when you're online
                      </p>
                    </div>
                    <Switch
                      id="showOnlineStatus"
                      checked={showOnlineStatus}
                      onCheckedChange={setShowOnlineStatus}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showActivity">Show Activity Status</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your recent activity
                      </p>
                    </div>
                    <Switch
                      id="showActivity"
                      checked={showActivity}
                      onCheckedChange={setShowActivity}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showEmail">Show Email in Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your email publicly
                      </p>
                    </div>
                    <Switch
                      id="showEmail"
                      checked={showEmail}
                      onCheckedChange={setShowEmail}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showPhone">Show Phone in Profile</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your phone number publicly
                      </p>
                    </div>
                    <Switch
                      id="showPhone"
                      checked={showPhone}
                      onCheckedChange={setShowPhone}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="allowTags">Allow Tags</Label>
                      <p className="text-sm text-muted-foreground">
                        Let others tag you in posts
                      </p>
                    </div>
                    <Switch
                      id="allowTags"
                      checked={allowTags}
                      onCheckedChange={setAllowTags}
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-medium">Search & Discovery</h3>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="indexProfile">
                        Index Profile in Search
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Allow search engines to find your profile
                      </p>
                    </div>
                    <Switch
                      id="indexProfile"
                      checked={indexProfile}
                      onCheckedChange={setIndexProfile}
                    />
                  </div>

                  {/* Content filters embedded into Search & Discovery */}
                  <div className="mt-4 space-y-4">
                    <h4 className="font-medium">Content Filters</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Hide Sensitive Content</p>
                          <p className="text-sm text-muted-foreground">Filter nudity, violence and other sensitive categories</p>
                        </div>
                        <Switch checked={contentHideSensitive} onCheckedChange={setContentHideSensitive} />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Safe Search Level</p>
                          <p className="text-sm text-muted-foreground">Reduce exposure to mature content in discovery</p>
                        </div>
                        <Select value={contentSafeSearch} onValueChange={setContentSafeSearch}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="off">Off</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="strict">Strict</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Blocked Keywords (comma separated)</Label>
                      <Input value={blockedKeywords} onChange={(e) => setBlockedKeywords(e.target.value)} placeholder="e.g. spoiler, political" />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="default" onClick={() => {
                        try {
                          window.localStorage.setItem('settings:contentFilters', JSON.stringify({ safeSearch: contentSafeSearch, blocked: blockedKeywords.split(',').map(s=>s.trim()).filter(Boolean) }));
                        } catch {}
                        toast({ title: 'Content filters saved' });
                      }}>
                        Save Filters
                      </Button>
                      <Button variant="ghost" onClick={() => {
                        try { window.localStorage.removeItem('settings:contentFilters'); } catch {}
                        setBlockedKeywords(''); setContentSafeSearch('moderate'); setContentHideSensitive(false);
                      }}>
                        Reset
                      </Button>
                    </div>
                  </div>
                </div>

                <Button onClick={savePrivacySettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>

            {/* Data & Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5" />
                  Data & Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Analytics Tracking</Label>
                    <p className="text-sm text-muted-foreground">
                      Help us improve the platform with usage data
                    </p>
                  </div>
                  <Switch defaultChecked={true} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Personalized Ads</Label>
                    <p className="text-sm text-muted-foreground">
                      Show ads based on your interests
                    </p>
                  </div>
                  <Switch defaultChecked={false} />
                </div>
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download My Data
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="twoFactorEnabled">
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    id="twoFactorEnabled"
                    checked={twoFactorEnabled}
                    onCheckedChange={setTwoFactorEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="loginNotifications">
                      Login Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified of new login attempts
                    </p>
                  </div>
                  <Switch
                    id="loginNotifications"
                    checked={loginNotifications}
                    onCheckedChange={setLoginNotifications}
                  />
                </div>

                <div>
                  <Label htmlFor="sessionTimeout">Session Timeout</Label>
                  <Select
                    value={sessionTimeout}
                    onValueChange={setSessionTimeout}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="8h">8 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Change Password
                  </h3>
                  <div>
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                  <Button onClick={changePassword} disabled={isLoading}>
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </Button>
                </div>
                
                <Button onClick={saveSecuritySettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* App Preferences */}
            {/* Data Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  Data Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Data Usage Preference</Label>
                  <Select value={dataUsage} onValueChange={setDataUsage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Conserve data</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="unlimited">Unlimited</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup">Auto Backup</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={autoBackup}
                    onCheckedChange={setAutoBackup}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Cache Size</Label>
                    <p className="text-sm text-muted-foreground">
                      Current cache: {cacheSize}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={clearCache}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                </div>
                
                <Button onClick={saveDataSettings} disabled={isLoading}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Data Settings
                </Button>
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium text-red-800">
                        Sign Out All Devices
                      </p>
                      <p className="text-sm text-red-600">
                        Sign out from all devices except this one
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-red-600 border-red-300"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out All Devices
                      </Button>
                    </div>

                    <Separator />

                    <div>
                      <p className="font-medium text-red-800">Delete Account</p>
                      <p className="text-sm text-red-600">
                        Permanently delete your account and all data. This
                        action cannot be undone.
                      </p>
                      <Dialog
                        open={showDeleteConfirm}
                        onOpenChange={setShowDeleteConfirm}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle className="text-red-600">
                              Delete Account
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="bg-red-50 p-4 rounded-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                <p className="font-medium text-red-800">
                                  Warning
                                </p>
                              </div>
                              <p className="text-sm text-red-700">
                                This will permanently delete your account and
                                all associated data:
                              </p>
                              <ul className="text-sm text-red-700 mt-2 space-y-1">
                                <li>• Profile information and settings</li>
                                <li>• Posts, comments, and media</li>
                                <li>• Marketplace products and orders</li>
                                <li>• Trading history and portfolio</li>
                                <li>• Wallet and financial data</li>
                              </ul>
                            </div>
                            <div>
                              <Label htmlFor="deleteConfirm">
                                Type "DELETE" to confirm
                              </Label>
                              <Input id="deleteConfirm" placeholder="DELETE" />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={deleteAccount}
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-6">
            <DataManagement />
          </TabsContent>

          {/* AI Features Tab */}
          <TabsContent value="ai" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SmartFeedCuration />
              <AIContentAssistant />
            </div>
          </TabsContent>

          {/* Internationalization Tab - Temporarily disabled */}
          <TabsContent value="i18n" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="w-5 h-5" />
                  Language & Regional Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Language settings temporarily unavailable. Please check back
                    later.
                  </p>
                </div>
                {/* <I18nSettingsModal
                  trigger={
                    <Button variant="outline" className="w-full">
                      <Globe2 className="w-4 h-4 mr-2" />
                      Configure Language & Region
                    </Button>
                  }
                /> */}
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Regional Payment Methods
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RegionalPaymentMethods />
              </CardContent>
            </Card> */}
          </TabsContent>
        </Tabs>

        {/* KYC Modal */}
        {showKYCModal && (
          <KYCVerificationModal
            userId={user?.id || ""}
            currentLevel={kycLevel}
            onLevelUpdate={(newLevel) => {
              setKycLevel(newLevel);
              setShowKYCModal(false);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default EnhancedSettings;
